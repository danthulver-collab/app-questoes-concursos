import { useState, useEffect, useCallback, useRef } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { getQuizData, type Question, type QuizData, type Pacote } from "../lib/quiz-store";
import { AppHeader } from "../components/app-header";
import { useAuth } from "../lib/auth-context-supabase";
import { recordQuizResult, analyzeError, type ErrorAnalysis } from "../lib/user-stats";
import { getRecommendedTechnique, toggleFavoriteTechnique, isFavoriteTechnique, type StudyTechnique } from "../lib/study-techniques";

// Task 113, 114, 115: Study all questions from a package (no timer)

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

interface QuestionProgress {
  answered: boolean;
  correct: boolean;
  answeredAt: string;
  userAnswer: number;
}

interface ProgressData {
  [questionId: string]: QuestionProgress;
}

type FilterType = "all" | "unanswered" | "answered" | "correct" | "incorrect";

function PacoteEstudarPage() {
  const { user } = useAuth();
  const [, params] = useRoute("/pacote/:id/estudar");
  const [, setLocation] = useLocation();
  const pacoteId = params?.id || "";
  
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [pacote, setPacote] = useState<Pacote | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Task 151, 156: 3-step flow states
  const [selectedOption, setSelectedOption] = useState<number | null>(null); // Step 1: Selection
  const [hasAnswered, setHasAnswered] = useState(false); // Step 2: Answered (not showing result yet)
  const [showResult, setShowResult] = useState(false); // Step 3: Result colors shown
  const [showComments, setShowComments] = useState(false); // Comments expanded
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null); // Final confirmed answer
  const [showExplanation, setShowExplanation] = useState(false);
  const [progress, setProgress] = useState<ProgressData>({});
  const [filter, setFilter] = useState<FilterType>("all");
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentErrorAnalysis, setCurrentErrorAnalysis] = useState<ErrorAnalysis | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  
  // Task 143: Study technique state
  const [currentTechnique, setCurrentTechnique] = useState<StudyTechnique | null>(null);
  const [isTechniqueFavorite, setIsTechniqueFavorite] = useState(false);
  
  const startTime = useRef<number>(Date.now());

  // Storage key for progress (all disciplines combined)
  const getStorageKey = () => `quiz_answered_${user?.username}_${pacoteId}_all`;
  
  // Load data on mount
  useEffect(() => {
    const data = getQuizData();
    setQuizData(data);
    
    const foundPacote = data.pacotes.find(p => p.id === decodeURIComponent(pacoteId));
    setPacote(foundPacote || null);
    
    // BLOQUEAR ACESSO: Se pacote não está pronto, redireciona
    // Bloqueia se: não tem status OU status diferente de "pronto"
    if (foundPacote && foundPacote.status !== "pronto") {
      console.log(`[BLOQUEIO] Pacote ${foundPacote.id} com status "${foundPacote.status || 'undefined'}" - redirecionando...`);
      setLocation("/aguardando-pacote");
      return;
    }
    
    if (foundPacote) {
      // Get all questions for this package
      let pacoteQuestions: Question[] = [];
      
      if (foundPacote.questionsIds && foundPacote.questionsIds.length > 0) {
        pacoteQuestions = data.questions.filter(q => foundPacote.questionsIds.includes(q.id));
      } else {
        pacoteQuestions = data.questions.filter(q => 
          q.concurso === foundPacote.nome || q.concurso?.toLowerCase() === foundPacote.nome.toLowerCase()
        );
      }
      
      setAllQuestions(pacoteQuestions);
      setFilteredQuestions(pacoteQuestions);
    }
    
    // Load progress from localStorage
    if (user?.username) {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        try {
          setProgress(JSON.parse(stored));
        } catch { /* ignore */ }
      }
    }
  }, [pacoteId, user]);

  // Apply filter to questions
  useEffect(() => {
    let filtered = [...allQuestions];
    
    switch (filter) {
      case "unanswered":
        filtered = allQuestions.filter(q => !progress[q.id]?.answered);
        break;
      case "answered":
        filtered = allQuestions.filter(q => progress[q.id]?.answered);
        break;
      case "correct":
        filtered = allQuestions.filter(q => progress[q.id]?.correct === true);
        break;
      case "incorrect":
        filtered = allQuestions.filter(q => progress[q.id]?.answered && progress[q.id]?.correct === false);
        break;
    }
    
    setFilteredQuestions(filtered);
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setShowResult(false);
    setShowComments(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCurrentErrorAnalysis(null);
  }, [filter, allQuestions, progress]);

  const currentQuestion = filteredQuestions[currentIndex];
  const totalQuestions = filteredQuestions.length;
  const allTotalQuestions = allQuestions.length;

  // Save progress to localStorage
  const saveProgress = useCallback((newProgress: ProgressData) => {
    setProgress(newProgress);
    localStorage.setItem(getStorageKey(), JSON.stringify(newProgress));
  }, [user, pacoteId]);

  // Task 151: Step 1 - Handle option selection (pre-confirmation)
  const handleSelectOption = useCallback((answerIndex: number) => {
    if (hasAnswered) return; // Already answered, can't change
    setSelectedOption(answerIndex);
  }, [hasAnswered]);

  // Task 151: Step 2 - Confirm answer (but don't show result yet)
  const handleConfirmAnswer = useCallback(() => {
    if (selectedOption === null || hasAnswered || !currentQuestion) return;
    
    setHasAnswered(true);
    setSelectedAnswer(selectedOption);
    
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
    
    // Save to progress
    const newProgress = {
      ...progress,
      [currentQuestion.id]: {
        answered: true,
        correct: isCorrect,
        answeredAt: new Date().toISOString(),
        userAnswer: selectedOption
      }
    };
    saveProgress(newProgress);
    
    // Record for stats
    if (user?.username) {
      recordQuizResult(user.username, {
        questionId: currentQuestion.id,
        selectedAnswer: selectedOption,
        isCorrect,
        timeSpent,
        disciplina: currentQuestion.disciplina
      });
    }
  }, [selectedOption, hasAnswered, currentQuestion, progress, saveProgress, user]);

  // Task 151: Step 3 - Show result (colors appear)
  const handleShowResult = useCallback(() => {
    if (!hasAnswered || !currentQuestion) return;
    
    setShowResult(true);
    setShowExplanation(true);
    
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
    
    // Task 143: Get study technique recommendation
    if (user?.username) {
      const technique = getRecommendedTechnique(
        user.username,
        currentQuestion.disciplina,
        isCorrect,
        !progress[currentQuestion.id]?.answered
      );
      setCurrentTechnique(technique);
      setIsTechniqueFavorite(isFavoriteTechnique(user.username, technique.id));
    }
    
    // Analyze error if wrong
    if (!isCorrect && user?.username) {
      const analysis = analyzeError(
        user.username,
        currentQuestion.id,
        currentQuestion.disciplina,
        timeSpent,
        999
      );
      setCurrentErrorAnalysis(analysis);
    } else {
      setCurrentErrorAnalysis(null);
    }
  }, [hasAnswered, currentQuestion, selectedAnswer, user, progress]);

  // Task 153: Toggle comments visibility
  const handleToggleComments = useCallback(() => {
    setShowComments(prev => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
      setShowResult(false);
      setShowComments(false);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setCurrentErrorAnalysis(null);
      setCurrentTechnique(null);
      startTime.current = Date.now();
    } else {
      setShowCompletionModal(true);
    }
  }, [currentIndex, totalQuestions]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      const prevQuestion = filteredQuestions[currentIndex - 1];
      const prevProgress = progress[prevQuestion?.id];
      if (prevProgress?.answered) {
        setSelectedOption(prevProgress.userAnswer);
        setHasAnswered(true);
        setShowResult(true);
        setShowComments(false);
        setSelectedAnswer(prevProgress.userAnswer);
        setShowExplanation(true);
      } else {
        setSelectedOption(null);
        setHasAnswered(false);
        setShowResult(false);
        setShowComments(false);
        setSelectedAnswer(null);
        setShowExplanation(false);
      }
      setCurrentErrorAnalysis(null);
      startTime.current = Date.now();
    }
  }, [currentIndex, filteredQuestions, progress]);

  const handleJumpTo = (index: number) => {
    setCurrentIndex(index);
    const targetQuestion = filteredQuestions[index];
    const targetProgress = progress[targetQuestion?.id];
    if (targetProgress?.answered) {
      setSelectedOption(targetProgress.userAnswer);
      setHasAnswered(true);
      setShowResult(true);
      setShowComments(false);
      setSelectedAnswer(targetProgress.userAnswer);
      setShowExplanation(true);
    } else {
      setSelectedOption(null);
      setHasAnswered(false);
      setShowResult(false);
      setShowComments(false);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
    setCurrentErrorAnalysis(null);
    setShowSidebar(false);
    startTime.current = Date.now();
  };

  // Calculate stats
  const answeredCount = Object.values(progress).filter(p => p.answered).length;
  const correctCount = Object.values(progress).filter(p => p.correct).length;
  const accuracyPercent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  const getQuestionStatusIcon = (questionId: string) => {
    const p = progress[questionId];
    if (!p?.answered) return "⭕";
    if (p.correct) return "✅";
    return "❌";
  };

  const getQuestionStatusClass = (questionId: string) => {
    const p = progress[questionId];
    if (!p?.answered) return "bg-gray-500/20 border-gray-500/30 text-gray-400";
    if (p.correct) return "bg-emerald-500/20 border-emerald-500/30 text-emerald-400";
    return "bg-rose-500/20 border-rose-500/30 text-rose-400";
  };

  if (!pacote || !currentQuestion) {
    return (
      <div className="min-h-screen bg-[#070b14]">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="glass-card rounded-3xl p-12 animate-fade-in">
            {filteredQuestions.length === 0 && allQuestions.length > 0 ? (
              <>
                <span className="text-6xl mb-6 block">🎯</span>
                <h1 className="text-3xl font-bold text-white mb-4">Nenhuma questão encontrada</h1>
                <p className="text-gray-400 mb-8">Não há questões com o filtro selecionado.</p>
                <button 
                  onClick={() => setFilter("all")}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-white hover:scale-[1.02] transition-transform"
                >
                  Ver Todas as Questões
                </button>
              </>
            ) : (
              <>
                <span className="text-6xl mb-6 block">📭</span>
                <h1 className="text-3xl font-bold text-white mb-4">Pacote não encontrado</h1>
                <p className="text-gray-400 mb-8">Este pacote não possui questões ou não foi encontrado.</p>
                <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-white hover:scale-[1.02] transition-transform">
                  Voltar para Início
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14]">
      <AppHeader />
      
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="lg:hidden fixed top-20 right-4 z-40 p-3 glass-card rounded-xl text-white"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 left-0 h-screen w-72 bg-[#0a0f1a] border-r border-white/10 z-50
          transform transition-transform duration-300 lg:transform-none
          ${showSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          overflow-y-auto pt-20 lg:pt-4
        `}>
          <div className="p-4">
            {/* Breadcrumb */}
            <nav className="text-xs text-gray-400 mb-4">
              <Link href={`/pacote/${pacoteId}`} className="hover:text-white transition-colors">
                {pacote.nome}
              </Link>
              <span className="mx-2">›</span>
              <span className="text-white">Estudar Tudo</span>
            </nav>
            
            {/* Stats */}
            <div className="glass-card rounded-xl p-4 mb-4">
              <div className="grid grid-cols-2 gap-3 text-center text-sm">
                <div>
                  <div className="text-xl font-bold text-white">{answeredCount}/{allTotalQuestions}</div>
                  <div className="text-xs text-gray-400">respondidas</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-emerald-400">{accuracyPercent}%</div>
                  <div className="text-xs text-gray-400">acerto</div>
                </div>
              </div>
            </div>
            
            {/* Filter */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-2 block">Filtrar questões</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              >
                <option value="all">Todas ({allTotalQuestions})</option>
                <option value="unanswered">Não respondidas ({allQuestions.filter(q => !progress[q.id]?.answered).length})</option>
                <option value="answered">Respondidas ({answeredCount})</option>
                <option value="correct">Corretas ({correctCount})</option>
                <option value="incorrect">Incorretas ({answeredCount - correctCount})</option>
              </select>
            </div>
            
            {/* Current question info */}
            {currentQuestion && (
              <div className="glass-card rounded-xl p-3 mb-4 text-sm">
                <span className="text-gray-400">Disciplina:</span>
                <span className="text-white ml-2">{currentQuestion.disciplina || "Geral"}</span>
              </div>
            )}
            
            {/* Question list - quick navigation */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-2 block">Navegação rápida</label>
              <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
                {filteredQuestions.slice(0, 50).map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => handleJumpTo(idx)}
                    className={`
                      w-10 h-10 rounded-lg border text-xs font-medium transition-all
                      ${idx === currentIndex ? "ring-2 ring-orange-500" : ""}
                      ${getQuestionStatusClass(q.id)}
                      hover:scale-105
                    `}
                    title={`Questão ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              {filteredQuestions.length > 50 && (
                <p className="text-xs text-gray-500 mt-2">+{filteredQuestions.length - 50} questões</p>
              )}
            </div>
            
            {/* Back to package */}
            <Link
              href={`/pacote/${pacoteId}`}
              className="flex items-center gap-2 w-full px-4 py-3 glass-card rounded-xl text-gray-300 hover:text-white transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar para Matérias
            </Link>
          </div>
        </aside>
        
        {/* Overlay for mobile sidebar */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
        
        {/* Main content */}
        <main className="flex-1 max-w-4xl mx-auto px-4 py-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setShowExitModal(true)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline">Sair</span>
            </button>
            
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">
                <span className="text-white font-semibold">{currentIndex + 1}</span> / {totalQuestions}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300">
                {getQuestionStatusIcon(currentQuestion.id)}
              </span>
            </div>
          </div>
          
          {/* Question card */}
          <div className="glass-card rounded-2xl p-6 md:p-8 mb-6 animate-fade-in">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <span className="text-xs text-orange-400 mb-2 block">{currentQuestion.disciplina || "Geral"}</span>
                <h2 className="text-lg md:text-xl font-semibold text-white leading-relaxed">
                  {currentQuestion.title}
                </h2>
              </div>
            </div>
            
            {/* Task 151, 152: Options with 3-step flow */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options && currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctAnswer;
                const isUserAnswer = selectedAnswer === idx;
                
                // Task 152: Color logic based on state
                let buttonClass = "glass-card border-white/10 hover:border-blue-500/50 hover:bg-white/5";
                let labelClass = "bg-white/10 text-gray-300";
                
                if (showResult) {
                  // Task 152: After "Ver Resposta" - show green/red colors
                  if (isCorrect) {
                    buttonClass = "bg-emerald-500/20 border-emerald-500/50";
                    labelClass = "bg-emerald-500 text-white";
                  } else if (isUserAnswer && !isCorrect) {
                    buttonClass = "bg-rose-500/20 border-rose-500/50";
                    labelClass = "bg-rose-500 text-white";
                  } else {
                    buttonClass = "opacity-40 border-white/5";
                  }
                } else if (hasAnswered && isSelected) {
                  // Task 152: After "Responder" but before "Ver Resposta" - subtle blue/orange
                  buttonClass = "bg-orange-500/20 border-orange-500/50 ring-2 ring-orange-500/30";
                  labelClass = "bg-orange-500 text-white";
                } else if (isSelected) {
                  // Task 152, 157: Before "Responder" - blue highlight
                  buttonClass = "bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-500/30";
                  labelClass = "bg-blue-500 text-white";
                }
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={hasAnswered}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${buttonClass} disabled:cursor-default`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`
                        w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-200
                        ${labelClass}
                      `}>
                        {showResult && isCorrect ? "✓" : 
                         showResult && isUserAnswer && !isCorrect ? "✗" :
                         OPTION_LABELS[idx]}
                      </span>
                      <span className="text-white/90 pt-1">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Task 151, 156, 157: Action Buttons based on state */}
            <div className="space-y-4 mb-6">
              {/* Step 1: Responder Button - blue, visible when option selected but not answered */}
              {selectedOption !== null && !hasAnswered && (
                <button
                  onClick={handleConfirmAnswer}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Responder
                </button>
              )}
              
              {/* Step 2: Ver Resposta Button - orange/pulsing, visible after answered but before result */}
              {hasAnswered && !showResult && (
                <button
                  onClick={handleShowResult}
                  className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 animate-pulse"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver Resposta
                </button>
              )}
            </div>
            
            {/* Task 151: Result feedback shown after "Ver Resposta" */}
            {showResult && (
              <div className={`rounded-xl p-5 mb-4 ${
                selectedAnswer === currentQuestion.correctAnswer 
                  ? "bg-emerald-500/10 border border-emerald-500/30" 
                  : "bg-rose-500/10 border border-rose-500/30"
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {selectedAnswer === currentQuestion.correctAnswer ? "🎉" : "❌"}
                  </span>
                  <span className={`font-semibold text-lg ${
                    selectedAnswer === currentQuestion.correctAnswer ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {selectedAnswer === currentQuestion.correctAnswer ? "Parabéns! Você acertou!" : "Resposta Incorreta"}
                  </span>
                </div>
              </div>
            )}
            
            {/* Task 153, 154: Ver Comentário Button - collapsible, visible after result */}
            {showResult && (
              <div className="mb-4">
                <button
                  onClick={handleToggleComments}
                  className="w-full py-3 px-5 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-400 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <span>{showComments ? "▲" : "▼"}</span>
                  <span>{showComments ? "Ocultar Comentário" : "Ver Comentário"}</span>
                </button>
                
                {/* Task 153, 154: Comments section with slide animation */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  showComments ? "max-h-[2000px] opacity-100 mt-4" : "max-h-0 opacity-0"
                }`}>
                  {/* Explanation/Comments */}
                  {currentQuestion.explanation && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4">
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <span>📖</span>
                        Comentário
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  )}
                  
                  {/* Error Analysis */}
                  {currentErrorAnalysis && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 mb-4">
                      <h4 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
                        <span>🔍</span>
                        Análise do Erro
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-gray-400">Tipo de erro:</span>
                          <span className="text-white ml-2">{currentErrorAnalysis.errorType}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">O que isso indica:</span>
                          <p className="text-gray-300 mt-1">{currentErrorAnalysis.studyInsight}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Como corrigir:</span>
                          <p className="text-gray-300 mt-1">{currentErrorAnalysis.correctionTip}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Task 154: Study Techniques inside comments section */}
                  {currentTechnique && (
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-indigo-400 font-semibold flex items-center gap-2">
                          <span>💡</span>
                          Técnica de Estudo Recomendada
                        </h4>
                        <button
                          onClick={() => {
                            if (user?.username) {
                              const isNowFavorite = toggleFavoriteTechnique(user.username, currentTechnique.id);
                              setIsTechniqueFavorite(isNowFavorite);
                            }
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            isTechniqueFavorite 
                              ? "bg-amber-500/20 text-amber-400" 
                              : "bg-white/5 text-gray-400 hover:bg-white/10"
                          }`}
                          title={isTechniqueFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                        >
                          {isTechniqueFavorite ? "⭐" : "☆"}
                        </button>
                      </div>
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">{currentTechnique.emoji}</span>
                        <div className="flex-1">
                          <h5 className="text-white font-medium mb-1">{currentTechnique.name}</h5>
                          <p className="text-gray-400 text-sm mb-2">{currentTechnique.description}</p>
                          <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-gray-300 text-sm">{currentTechnique.application}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-6 py-3 glass-card rounded-xl text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>
            
            {showResult ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-white hover:scale-[1.02] transition-transform"
              >
                {currentIndex < totalQuestions - 1 ? "Próxima" : "Finalizar"}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 glass-card rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Pular
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </main>
      </div>
      
      {/* Exit confirmation modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-6 max-w-md w-full animate-scale-in">
            <h3 className="text-xl font-bold text-white mb-4">Sair do Estudo?</h3>
            <p className="text-gray-400 mb-6">
              Seu progresso foi salvo automaticamente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 px-4 py-3 glass-card rounded-xl text-white hover:bg-white/5 transition-colors"
              >
                Continuar
              </button>
              <Link
                href={`/pacote/${pacoteId}`}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-white text-center hover:scale-[1.02] transition-transform"
              >
                Sair
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Completion modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full animate-scale-in text-center">
            <span className="text-6xl mb-4 block">🎉</span>
            <h3 className="text-2xl font-bold text-white mb-2">Pacote Concluído!</h3>
            <p className="text-gray-400 mb-6">
              Você completou todas as questões do pacote {pacote.nome}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="glass-card rounded-xl p-4">
                <div className="text-2xl font-bold text-emerald-400">{correctCount}</div>
                <div className="text-xs text-gray-400">acertos</div>
              </div>
              <div className="glass-card rounded-xl p-4">
                <div className="text-2xl font-bold text-amber-400">{accuracyPercent}%</div>
                <div className="text-xs text-gray-400">aproveitamento</div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              {answeredCount - correctCount > 0 && (
                <button
                  onClick={() => {
                    setShowCompletionModal(false);
                    setFilter("incorrect");
                  }}
                  className="w-full px-4 py-3 glass-card rounded-xl text-white hover:bg-white/5 transition-colors"
                >
                  📝 Revisar Erradas ({answeredCount - correctCount})
                </button>
              )}
              <Link
                href={`/pacote/${pacoteId}`}
                className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-white hover:scale-[1.02] transition-transform"
              >
                Voltar para Matérias
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PacoteEstudarPage;
