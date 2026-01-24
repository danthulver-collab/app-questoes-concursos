import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { getQuizData, filterQuestions, getUniqueConcursos, getUniqueDisciplinas, getUniqueModulos, type Question, type QuizData, type Pacote } from "../lib/quiz-store";
import { AppHeader } from "../components/app-header";
import { useAuth } from "../lib/auth-context-supabase";
import { recordQuizResult, analyzeError, type ErrorAnalysis } from "../lib/user-stats";
import { getActiveConcursos, getActiveConcurso, setActiveConcurso, hasAccessToConcurso, getUserPlan, isUserPlus, isSuperAdmin, getUserConcursoOriginal, getAvailableConcursosByPlan, canAnswerMoreQuestions, getRemainingQuestions, incrementDailyQuestionCount, canViewComments, hasFullAIAccess, isWaitingForPackage, getPackageDaysRemaining, getUserPackageStatus, getUserCreationProgress, PLAN_LIMITS, STAGE_LABELS, STAGE_ICONS, STAGE_MESSAGES, type PlanType, type CreationProgress } from "../lib/access-control";
import { MiniTimeline } from "../components/progress-timeline";
import { TrialBadge } from "../components/trial-badge";
import { useSyncPlan } from "../lib/use-sync-plan";
import { SidebarMenu } from "../components/sidebar-menu";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;
const TIME_PER_QUESTION = 30;
const QUIZ_PROGRESS_KEY = "quiz_progress";

interface LocalQuizResult {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  disciplina?: string;
}

interface SavedProgress {
  currentIndex: number;
  results: LocalQuizResult[];
  filterConcurso: string;
  filterDisciplina: string;
  filterModulo: string;
  savedAt: string;
  questionsIds: string[];
}

function Index() {
  const { user, isLoading: authLoading } = useAuth();
  const search = useSearch();
  const [, setLocation] = useLocation();
  
  // SINCRONIZAÇÃO AUTOMÁTICA DO PLANO (a cada 10 segundos)
  useSyncPlan(user?.email || user?.username);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [gameState, setGameState] = useState<"start" | "playing" | "finished">("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [selectedOption, setSelectedOption] = useState<number | null>(null); // Task 146: Pre-confirmation selection
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null); // Confirmed answer
  const [showExplanation, setShowExplanation] = useState(false);
  const [results, setResults] = useState<LocalQuizResult[]>([]);
  const hasRecordedResult = useRef(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false); // Loading state for button
  
  // Modals
  const [showExitModal, setShowExitModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiQuery, setAIQuery] = useState("");
  const [aiSearches, setAISearches] = useState<Array<{query: string; timestamp: string}>>([]);
  
  // Error Analysis
  const [currentErrorAnalysis, setCurrentErrorAnalysis] = useState<ErrorAnalysis | null>(null);
  
  // Filters
  const [filterConcurso, setFilterConcurso] = useState<string>("");
  const [filterDisciplina, setFilterDisciplina] = useState<string>("");
  const [filterModulo, setFilterModulo] = useState<string>("");
  const [filterBanca, setFilterBanca] = useState<string>("");
  const [filterAno, setFilterAno] = useState<string>("");
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // View mode: "concursos" shows concurso cards, "filters" shows traditional filters
  const [viewMode, setViewMode] = useState<"concursos" | "filters">("concursos");
  
  // Track if we're coming from a concurso page (with filters in URL)
  const [fromConcursoPage, setFromConcursoPage] = useState(false);
  
  // Access Control
  const [userActiveConcursos, setUserActiveConcursos] = useState<string[]>([]);
  const [selectedActiveConcurso, setSelectedActiveConcurso] = useState<string | null>(null);
  const [showConcursoSelector, setShowConcursoSelector] = useState(false);
  
  // Plan-based access
  const [userPlan, setUserPlanState] = useState<PlanType | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Daily limit for free plan
  const [remainingQuestions, setRemainingQuestions] = useState<number>(PLAN_LIMITS.free.questionsPerDay);
  const [showDailyLimitModal, setShowDailyLimitModal] = useState(false);
  
  // User's assigned packages
  const [userPacotes, setUserPacotes] = useState<Pacote[]>([]);
  
  // "Ver Resposta" and "Ver Comentário" feature
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [showCommentsUpsellModal, setShowCommentsUpsellModal] = useState(false);
  
  // Check if user can view comments (paid plans only)
  // Use email first (for Google login), then username
  const userCanViewComments = user?.username ? canViewComments(user.email || user.username) : false;
  const userHasFullAI = user?.username ? hasFullAIAccess(user.email || user.username) : false;
  
  // Task 78: Check if user is waiting for custom package
  const userIsWaitingForPackage = user?.username ? isWaitingForPackage(user.username) : false;
  const packageDaysRemaining = user?.username ? getPackageDaysRemaining(user.username) : 7;
  // Task 85: Check if package is ready
  const userPackageStatus = user?.username ? getUserPackageStatus(user.username) : null;
  const userPackageIsReady = userPackageStatus === "pronto";
  // Task 100: Get creation progress for timeline
  const userCreationProgress = user?.username ? getUserCreationProgress(user.username) : null;
  const isAwaitingPayment = userPackageStatus === "aguardando_pagamento";

  // Get user's assigned packages
  const getUserPacotes = useCallback((data: QuizData, username: string): Pacote[] => {
    return data.pacotes.filter(pacote => {
      // Check if user has access via direct assignment or pacote_access_[id] key
      if (pacote.alunoAtribuido === username) return true;
      const pacoteAccessKey = `pacote_access_${pacote.id}`;
      const accessList = JSON.parse(localStorage.getItem(pacoteAccessKey) || "[]") as string[];
      return accessList.includes(username);
    });
  }, []);

  // Read URL params for filters (coming from concurso page)
  useEffect(() => {
    if (search) {
      const params = new URLSearchParams(search);
      const concursoParam = params.get("concurso");
      const disciplinaParam = params.get("disciplina");
      const autostart = params.get("autostart"); // 🔥 Flag para auto-iniciar
      
      if (concursoParam || disciplinaParam) {
        setFromConcursoPage(true);
        setViewMode("filters");
        if (concursoParam) setFilterConcurso(concursoParam);
        if (disciplinaParam) setFilterDisciplina(disciplinaParam);
        
        // 🔥 Auto-start quiz quando vem da página de concurso OU tem flag autostart
        if (autostart === "true" || (concursoParam && disciplinaParam)) {
          setTimeout(() => startQuiz(), 100);
        }
      }
    }
  }, [search]);

  // 🔥 REDIRECT: Se pagamento foi confirmado, ir para tela de acompanhamento
  // APENAS SE VIER DE PARÂMETROS DE URL (evita loop infinito)
  useEffect(() => {
    if (!user) return;
    
    // Só redireciona se tiver parâmetro forceCheck na URL (de outras páginas)
    const urlParams = new URLSearchParams(window.location.search);
    const forceCheck = urlParams.get('forceCheck');
    
    if (!forceCheck) return; // NÃO redireciona automaticamente ao carregar
    
    const userId = user.email || user.username;
    const packageStatus = getUserPackageStatus(userId);
    
    // Se tem solicitação de pacote
    if (packageStatus && packageStatus !== null) {
      console.log(`[Index] Status do pacote: ${packageStatus}`);
      
      // Redirecionar para página de acompanhamento
      if (packageStatus === "aguardando_pagamento" || 
          packageStatus === "aguardando_montagem" || 
          packageStatus === "em_andamento" || 
          packageStatus === "pronto") {
        console.log(`[Index] 🔄 Redirecionando para /aguardando-pacote`);
        setLocation("/aguardando-pacote");
      }
    }
  }, [user, setLocation]);

  // Listener para atualizar quando o plano mudar (sincronização em tempo real)
  useEffect(() => {
    const handlePlanUpdate = (event: any) => {
      const { userId: updatedUserId, plan } = event.detail;
      const currentUserId = user?.email || user?.username;
      
      if (updatedUserId === currentUserId && plan !== userPlan) {
        console.log(`[Index] Plano atualizado de ${userPlan} para: ${plan}`);
        setUserPlanState(plan);
        
        // Atualizar questões restantes
        if (plan === 'free' || plan === 'trial') {
          const remaining = getRemainingQuestions(currentUserId);
          setRemainingQuestions(remaining);
        }
      }
    };
    
    window.addEventListener('planUpdated', handlePlanUpdate);
    return () => window.removeEventListener('planUpdated', handlePlanUpdate);
  }, [user, userPlan]);
  
  // 🔥 LISTENER REMOVIDO: Estava causando loop infinito
  // O redirect deve acontecer apenas na página aguardando-pacote

  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('[Index] Inicializando dados...');
        const data = getQuizData();
        setQuizData(data);
        setFilteredQuestions(data.questions);
        
        // Load user's plan and access data
        if (user?.username) {
          // Check by email first (for Google login), then username
          const userId = user.email || user.username;
          const plan = getUserPlan(userId) || "free";
          setUserPlanState(plan);
      
      // Update remaining questions for free plan
      const remaining = getRemainingQuestions(userId);
      setRemainingQuestions(remaining);
      
      // Get all concursos from system
      const allConcursosFromQuestions = getUniqueConcursos(data.questions);
      const allConcursosFromAdmin = data.concursos.map(c => c.nome);
      const allConcursos = [...new Set([...allConcursosFromQuestions, ...allConcursosFromAdmin])];
      
      // Filter concursos based on user's plan
      const availableConcursos = getAvailableConcursosByPlan(userId, allConcursos);
      
      // Fall back to legacy access control if no plan is set
      const activeConcursos = plan ? availableConcursos : getActiveConcursos(user.username);
      setUserActiveConcursos(activeConcursos);
      
      // For Plus plan, don't auto-filter by concurso
      if (plan === "plus") {
        // Plus users see all concursos
        setSelectedActiveConcurso(null);
      } else if (activeConcursos.length === 1) {
        // Individual plan or legacy: set the concurso filter
        setSelectedActiveConcurso(activeConcursos[0]);
        setFilterConcurso(activeConcursos[0]);
      } else if (activeConcursos.length > 1) {
        setShowConcursoSelector(true);
      }
      
      // Load user's assigned packages
      const assignedPacotes = getUserPacotes(data, user.username);
      setUserPacotes(assignedPacotes);
        }
        
        // Check for saved progress
        const saved = localStorage.getItem(QUIZ_PROGRESS_KEY);
        if (saved) {
          setHasSavedProgress(true);
        }
        
        console.log('[Index] Dados inicializados com sucesso');
      } catch (error) {
        console.error('[Index] Erro ao inicializar:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    
    // Só inicializa se o user já foi carregado
    if (!authLoading && user) {
      initializeData();
    } else if (!authLoading && !user) {
      setIsInitializing(false);
    }
  }, [user, authLoading]);

  // Update filtered questions when filters change
  useEffect(() => {
    if (!quizData) return;
    
    let filtered = quizData.questions;
    
    // Apply base filters
    if (filterConcurso) {
      filtered = filtered.filter(q => q.concurso === filterConcurso);
    }
    if (filterDisciplina) {
      filtered = filtered.filter(q => q.disciplina === filterDisciplina);
    }
    if (filterModulo) {
      filtered = filtered.filter(q => q.modulo === filterModulo);
    }
    
    // Apply advanced filters
    if (filterBanca) {
      filtered = filtered.filter(q => q.concurso?.includes(filterBanca) || q.orgao?.includes(filterBanca));
    }
    if (filterAno) {
      filtered = filtered.filter(q => q.ano === parseInt(filterAno));
    }
    
    setFilteredQuestions(filtered);
  }, [filterConcurso, filterDisciplina, filterModulo, filterBanca, filterAno, quizData]);

  const currentQuestion = filteredQuestions[currentIndex];
  const totalQuestions = filteredQuestions.length;

  // Task 146: Handle option selection (pre-confirmation)
  const handleSelectOption = useCallback((answerIndex: number) => {
    if (selectedAnswer !== null) return; // Already answered
    setSelectedOption(answerIndex);
  }, [selectedAnswer]);

  // Task 146: Confirm answer and show result (also called by timer timeout with -1)
  const handleConfirmAnswer = useCallback((forceAnswer?: number) => {
    const answerIndex = forceAnswer !== undefined ? forceAnswer : selectedOption;
    if (answerIndex === null || selectedAnswer !== null || !currentQuestion) return;
    
    // Show immediate visual feedback
    setIsSubmittingAnswer(true);
    
    // Use requestAnimationFrame to ensure UI updates before heavy computation
    requestAnimationFrame(() => {
      setSelectedAnswer(answerIndex);
      setShowExplanation(true);
    
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const timeSpent = TIME_PER_QUESTION - timeLeft;
    
    // Increment daily question count for free and trial plan users
    if (user?.username && (userPlan === "free" || userPlan === "trial" || !userPlan)) {
      incrementDailyQuestionCount(user.username);
      const remaining = getRemainingQuestions(user.username);
      setRemainingQuestions(remaining);
    }
    
    // Analyze error if answer is wrong
    if (!isCorrect && user?.username) {
      const analysis = analyzeError(
        user.username,
        currentQuestion.id,
        currentQuestion.disciplina,
        timeSpent,
        TIME_PER_QUESTION
      );
      setCurrentErrorAnalysis(analysis);
    } else {
      setCurrentErrorAnalysis(null);
    }
    
      setResults(prev => [...prev, {
        questionId: currentQuestion.id,
        selectedAnswer: answerIndex,
        isCorrect,
        timeSpent,
        disciplina: currentQuestion.disciplina
      }]);
      
      // Reset loading state
      setIsSubmittingAnswer(false);
    });
  }, [selectedOption, selectedAnswer, currentQuestion, timeLeft, user, userPlan]);

  // Timer effect
  useEffect(() => {
    if (gameState !== "playing" || selectedAnswer !== null) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleConfirmAnswer(-1); // Time's up - force answer as wrong
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, selectedAnswer, handleConfirmAnswer]);

  const startQuiz = () => {
    if (filteredQuestions.length === 0) return;
    
    // Check daily limit for free and trial plan users
    if (user?.username && (userPlan === "free" || userPlan === "trial" || !userPlan)) {
      const userId = user.email || user.username;
      if (!canAnswerMoreQuestions(userId)) {
        setShowDailyLimitModal(true);
        return;
      }
    }
    
    localStorage.removeItem(QUIZ_PROGRESS_KEY);
    setHasSavedProgress(false);
    setGameState("playing");
    setCurrentIndex(0);
    setTimeLeft(TIME_PER_QUESTION);
    setSelectedOption(null);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setResults([]);
    hasRecordedResult.current = false;
    setShowCorrectAnswer(false);
    setShowComment(false);
  };
  
  const resumeQuiz = () => {
    const saved = localStorage.getItem(QUIZ_PROGRESS_KEY);
    if (!saved || !quizData) return;
    
    try {
      const progress: SavedProgress = JSON.parse(saved);
      
      // Restore filters
      setFilterConcurso(progress.filterConcurso);
      setFilterDisciplina(progress.filterDisciplina);
      setFilterModulo(progress.filterModulo);
      
      // Filter questions based on saved filters
      const filters: { concurso?: string; disciplina?: string; modulo?: string } = {};
      if (progress.filterConcurso) filters.concurso = progress.filterConcurso;
      if (progress.filterDisciplina) filters.disciplina = progress.filterDisciplina;
      if (progress.filterModulo) filters.modulo = progress.filterModulo;
      
      const filtered = Object.keys(filters).length > 0 
        ? filterQuestions(quizData.questions, filters)
        : quizData.questions;
      
      setFilteredQuestions(filtered);
      setResults(progress.results);
      setCurrentIndex(progress.currentIndex);
      setGameState("playing");
      setTimeLeft(TIME_PER_QUESTION);
      setSelectedOption(null);
      setSelectedAnswer(null);
      setShowExplanation(false);
      hasRecordedResult.current = false;
    } catch {
      localStorage.removeItem(QUIZ_PROGRESS_KEY);
      setHasSavedProgress(false);
    }
  };
  
  const saveProgress = () => {
    const progress: SavedProgress = {
      currentIndex,
      results,
      filterConcurso,
      filterDisciplina,
      filterModulo,
      savedAt: new Date().toISOString(),
      questionsIds: filteredQuestions.map(q => q.id),
    };
    localStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(progress));
    setHasSavedProgress(true);
  };
  
  const handleExitQuiz = (save: boolean) => {
    if (save) {
      saveProgress();
    } else {
      localStorage.removeItem(QUIZ_PROGRESS_KEY);
      setHasSavedProgress(false);
    }
    setShowExitModal(false);
    setGameState("start");
    setCurrentIndex(0);
    setResults([]);
    setSelectedOption(null);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };
  
  const handleAISearch = () => {
    if (!aiQuery.trim()) return;
    setAISearches(prev => [...prev, { query: aiQuery, timestamp: new Date().toISOString() }]);
    setAIQuery("");
  };

  // Record quiz result when finished
  // Task 180: Use email first (for Google login), then username for stats
  useEffect(() => {
    const userId = user?.email || user?.username;
    if (gameState === "finished" && userId && results.length > 0 && !hasRecordedResult.current) {
      hasRecordedResult.current = true;
      const totalTimeSpent = results.reduce((acc, r) => acc + r.timeSpent, 0);
      const correctAnswers = results.filter(r => r.isCorrect).length;
      const disciplinas = [...new Set(results.map(r => r.disciplina).filter(Boolean) as string[])];
      
      recordQuizResult(userId, {
        totalQuestions: results.length,
        correctAnswers,
        timeSpent: totalTimeSpent,
        concurso: filterConcurso || undefined,
        disciplinas,
        detailedResults: results.map(r => ({
          questionId: r.questionId,
          disciplina: r.disciplina,
          isCorrect: r.isCorrect,
          timeSpent: r.timeSpent
        }))
      });
    }
  }, [gameState, user, results, filterConcurso]);

  const nextQuestion = () => {
    // Check daily limit for free and trial plan users before moving to next question
    if (user?.username && (userPlan === "free" || userPlan === "trial" || !userPlan) && currentIndex + 1 < totalQuestions) {
      const userId = user.email || user.username;
      if (!canAnswerMoreQuestions(userId)) {
        setShowDailyLimitModal(true);
        setGameState("finished"); // End the quiz early
        return;
      }
    }
    
    if (currentIndex + 1 >= totalQuestions) {
      setGameState("finished");
    } else {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(TIME_PER_QUESTION);
      setSelectedOption(null);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setCurrentErrorAnalysis(null);
      setShowCorrectAnswer(false);
      setShowComment(false);
      setIsSubmittingAnswer(false); // Reset loading state
    }
  };

  const score = results.filter(r => r.isCorrect).length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  if (!quizData) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-b-amber-500/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </div>
    );
  }

  // Combine concursos from questions AND from admin panel
  const concursosFromQuestions = getUniqueConcursos(quizData.questions);
  const concursosFromAdmin = quizData.concursos.map(c => c.nome);
  const allUniqueConcursos = [...new Set([...concursosFromQuestions, ...concursosFromAdmin])].sort();
  
  // Filter concursos based on user's plan
  const uniqueConcursos = userPlan === "plus" 
    ? allUniqueConcursos 
    : userPlan === "individual" 
      ? allUniqueConcursos.filter(c => userActiveConcursos.includes(c))
      : allUniqueConcursos;
  
  // Concursos the user doesn't have access to (for showing locked options)
  const lockedConcursos = userPlan === "individual" 
    ? allUniqueConcursos.filter(c => !userActiveConcursos.includes(c))
    : [];
  
  // Combine disciplinas from questions AND from admin panel
  const disciplinasFromQuestions = getUniqueDisciplinas(quizData.questions);
  const disciplinasFromAdmin = quizData.disciplinas.map(d => d.nome);
  const uniqueDisciplinas = [...new Set([...disciplinasFromQuestions, ...disciplinasFromAdmin])].sort();
  
  const uniqueModulos = getUniqueModulos(quizData.questions);
  
  // Get unique bancas and anos for advanced filters
  const uniqueBancas = [...new Set(quizData.questions.map(q => q.orgao || q.concurso).filter(Boolean))].sort() as string[];
  const uniqueAnos = [...new Set(quizData.questions.map(q => q.ano).filter(Boolean))].sort((a, b) => (b || 0) - (a || 0)) as number[];
  
  // Handle trying to access locked concurso
  const handleLockedConcursoClick = () => {
    setShowUpgradeModal(true);
  };

  // Handle concurso selection
  const handleSelectConcurso = (concurso: string) => {
    if (user?.username) {
      setActiveConcurso(user.username, concurso);
      setSelectedActiveConcurso(concurso);
      setFilterConcurso(concurso);
      setShowConcursoSelector(false);
    }
  };

  // Concurso Selection Modal (for users with multiple accesses)
  if (showConcursoSelector && userActiveConcursos.length > 1) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        <AppHeader showAdmin />
        
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="glass-card rounded-3xl p-8 max-w-lg w-full text-center animate-slide-in-up">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold mb-2">Qual concurso deseja estudar hoje?</h2>
            <p className="text-gray-400 mb-6">Você tem acesso a {userActiveConcursos.length} concursos</p>
            
            <div className="space-y-3">
              {userActiveConcursos.map(concurso => (
                <button
                  key={concurso}
                  onClick={() => handleSelectConcurso(concurso)}
                  className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/50 rounded-xl transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{concurso}</span>
                    <span className="text-orange-400 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Waiting for Access Screen (for users with no access)
  if (user?.username && userActiveConcursos.length === 0) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        <AppHeader showAdmin />
        
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="glass-card rounded-3xl p-8 max-w-lg w-full text-center animate-slide-in-up">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <span className="text-4xl">⏳</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Aguardando Liberação</h2>
            <p className="text-gray-400 mb-6">
              Olá{user.nome ? `, ${user.nome}` : ''}! Sua conta foi criada com sucesso.<br/>
              Aguarde a liberação do acesso ao seu concurso pelo administrador.
            </p>
            
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm text-blue-300 mb-6">
              💡 Entre em contato com o suporte para agilizar a liberação do seu acesso.
            </div>
            
            <div className="flex gap-3 justify-center">
              <Link href="/perfil">
                <button className="px-6 py-3 bg-white/10 hover:bg-white/15 rounded-xl font-medium transition-all">
                  Meu Perfil
                </button>
              </Link>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-medium transition-all hover:scale-105"
              >
                Verificar Acesso
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Start Screen
  if (gameState === "start") {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex flex-col relative overflow-hidden">
        {/* Background mesh gradient */}
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px]" />
        
        {/* Task 175: Fixed Sidebar Menu (Desktop) / Bottom Bar (Mobile) */}
        <SidebarMenu />
        
        <AppHeader showAdmin />
        
        <main className="flex-1 flex flex-col items-center justify-center p-6 pb-24 lg:pb-6 lg:ml-20 xl:ml-72 text-center relative z-10 transition-all duration-300">
          <div className="animate-slide-in-up max-w-2xl mx-auto">
            {/* Trial Badge */}
            {userPlan === "trial" && user && (
              <div className="mb-4 animate-slide-in-up">
                <TrialBadge userId={user.email || user.username} variant="full" />
              </div>
            )}
            
            {/* Plan Badge */}
            {userPlan !== "trial" && (
              <div className="mb-4 animate-slide-in-up flex justify-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border ${
                  userPlan === "plus" 
                    ? "bg-amber-500/20 border-amber-500/30" 
                    : userPlan === "individual"
                    ? "bg-orange-500/20 border-orange-500/30"
                    : "bg-emerald-500/20 border-emerald-500/30"
                }`}>
                  <span>{userPlan === "plus" ? "✨" : userPlan === "individual" ? "⭐" : "🆓"}</span>
                  <span className={`font-bold ${
                    userPlan === "plus" ? "text-amber-400" : userPlan === "individual" ? "text-orange-400" : "text-emerald-400"
                  }`}>
                    Plano {userPlan === "plus" ? "Plus" : userPlan === "individual" ? "Individual" : "Grátis"}
                  </span>
                  {userPlan === "plus" && (
                    <span className="text-gray-400 text-xs">• Acesso Total Liberado</span>
                  )}
                  {(userPlan === "free" || !userPlan) && (
                    <span className="text-gray-400 text-xs">• {remainingQuestions} questões restantes hoje</span>
                  )}
                  {(userPlan === "individual" || userPlan === "free" || !userPlan) && (
                    <Link href="/planos">
                      <span className="text-xs text-gray-400 hover:text-white underline ml-2 cursor-pointer">
                        Fazer Upgrade
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            )}
            
            {/* Task 85: Package Ready Banner */}
            {userPackageIsReady && (
              <Link href="/aguardando-pacote">
                <div className="mb-6 animate-slide-in-up cursor-pointer group">
                  <div className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-2xl hover:border-emerald-500/50 transition-all">
                    <span className="text-2xl">🎉</span>
                    <div className="text-left">
                      <p className="text-emerald-400 font-bold text-sm">Seu pacote personalizado está PRONTO!</p>
                      <p className="text-gray-400 text-xs">Clique para <span className="text-white underline group-hover:text-emerald-400">ver detalhes</span></p>
                    </div>
                  </div>
                </div>
              </Link>
            )}
            
            {/* Task 100: Enhanced Status Card with Timeline */}
            {isAwaitingPayment && (
              <Link href="/aguardando-pagamento">
                <div className="mb-6 animate-slide-in-up cursor-pointer">
                  <div className="glass-card rounded-2xl p-4 border border-yellow-500/30 hover:border-yellow-500/50 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">🔒</span>
                      <div>
                        <p className="text-yellow-400 font-bold text-sm">Pagamento Pendente</p>
                        <p className="text-gray-400 text-xs">Complete seu pagamento para iniciar</p>
                      </div>
                    </div>
                    <MiniTimeline currentStage="pagamento_pendente" />
                    <button className="mt-3 w-full py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-sm font-medium transition-all">
                      Ir para Checkout
                    </button>
                  </div>
                </div>
              </Link>
            )}
            
            {/* Task 100: In Progress Package Card */}
            {userIsWaitingForPackage && !userPackageIsReady && !isAwaitingPayment && (
              <Link href="/aguardando-pacote">
                <div className="mb-6 animate-slide-in-up cursor-pointer">
                  <div className="glass-card rounded-2xl p-4 border border-blue-500/30 hover:border-blue-500/50 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{userCreationProgress?.stage ? STAGE_ICONS[userCreationProgress.stage] : "🛠️"}</span>
                      <div className="flex-1">
                        <p className="text-blue-400 font-bold text-sm">Seu Pedido em Andamento</p>
                        <p className="text-gray-400 text-xs">
                          {userCreationProgress?.stage ? STAGE_MESSAGES[userCreationProgress.stage] : "Preparando seu pacote..."}
                        </p>
                      </div>
                      <span className="text-lg text-blue-400 font-bold">{userCreationProgress?.percentual || 0}%</span>
                    </div>
                    <MiniTimeline currentStage={userCreationProgress?.stage || "pagamento_confirmado"} />
                    <button className="mt-3 w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-all">
                      Ver Progresso Completo
                    </button>
                  </div>
                </div>
              </Link>
            )}
            
            {/* Active Concurso Badge */}
            {selectedActiveConcurso && (
              <div className="mb-6 animate-slide-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-sm">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-emerald-400 font-medium">Seu Concurso Ativo:</span>
                  <span className="text-white font-bold">{selectedActiveConcurso}</span>
                  {userActiveConcursos.length > 1 && (
                    <button 
                      onClick={() => setShowConcursoSelector(true)}
                      className="ml-2 text-xs text-gray-400 hover:text-white underline"
                    >
                      trocar
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Logo with glow effect */}
            <div className="relative mb-10">
              <div className="absolute inset-0 w-32 h-32 md:w-40 md:h-40 bg-orange-500/30 rounded-3xl blur-2xl animate-pulse mx-auto" />
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden mx-auto shadow-2xl shadow-orange-500/20 ring-1 ring-white/10">
                <img 
                  src="./1522a1ec-a823-4b8d-b840-956fc29e2cf8.jpg" 
                  alt="Só Questões de Concursos"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
                Questões de Concursos
              </span>
            </h1>
            
            <p className="text-gray-400 text-lg md:text-xl mb-8 font-medium">
              Pratique com questões reais de provas anteriores
            </p>

            {/* Task 141: View Mode Toggle - ONLY for Plus and Free plans, not Individual */}
            {userPlan !== "individual" && (
              <div className="flex items-center justify-center gap-2 mb-6">
                <button
                  onClick={() => setViewMode("concursos")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    viewMode === "concursos" 
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  <span>🏆</span>
                  Concursos
                </button>
                <button
                  onClick={() => setViewMode("filters")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    viewMode === "filters" 
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  <span>🔍</span>
                  Filtros Avançados
                </button>
              </div>
            )}
            
            {/* Task 141: Concursos Cards Grid - ONLY for Plus and Free plans */}
            {userPlan !== "individual" && viewMode === "concursos" && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <span>🎯</span>
                  Escolha um Concurso para Estudar
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uniqueConcursos.map((concurso, idx) => {
                    const questionsCount = quizData?.questions.filter(q => q.concurso === concurso).length || 0;
                    const disciplinasCount = new Set(quizData?.questions.filter(q => q.concurso === concurso).map(q => q.disciplina)).size || 0;
                    const concursoData = quizData?.concursos.find(c => c.nome === concurso);
                    
                    const colors = [
                      { bg: "from-orange-500/20 to-amber-500/10", border: "border-orange-500/30", text: "text-orange-400", accent: "bg-orange-500" },
                      { bg: "from-blue-500/20 to-cyan-500/10", border: "border-blue-500/30", text: "text-blue-400", accent: "bg-blue-500" },
                      { bg: "from-emerald-500/20 to-green-500/10", border: "border-emerald-500/30", text: "text-emerald-400", accent: "bg-emerald-500" },
                      { bg: "from-purple-500/20 to-pink-500/10", border: "border-purple-500/30", text: "text-purple-400", accent: "bg-purple-500" },
                      { bg: "from-rose-500/20 to-red-500/10", border: "border-rose-500/30", text: "text-rose-400", accent: "bg-rose-500" },
                      { bg: "from-teal-500/20 to-cyan-500/10", border: "border-teal-500/30", text: "text-teal-400", accent: "bg-teal-500" },
                      { bg: "from-indigo-500/20 to-violet-500/10", border: "border-indigo-500/30", text: "text-indigo-400", accent: "bg-indigo-500" },
                    ];
                    const color = colors[idx % colors.length];
                    
                    return (
                      <Link
                        key={concurso}
                        href={`/concurso/${encodeURIComponent(concurso)}`}
                        className={`group relative p-5 rounded-2xl border-2 transition-all hover:scale-[1.02] text-left overflow-hidden bg-gradient-to-br ${color.bg} ${color.border} hover:shadow-lg hover:shadow-${color.text.replace('text-', '')}/10`}
                      >
                        {/* Decorative accent */}
                        <div className={`absolute top-0 right-0 w-24 h-24 ${color.accent}/5 rounded-full blur-2xl`} />
                        
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-3xl">🏆</span>
                            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                              Ver Matérias →
                            </span>
                          </div>
                          
                          <h4 className={`font-bold text-lg mb-1 ${color.text} group-hover:text-white transition-colors`}>
                            {concurso}
                          </h4>
                          
                          {concursoData?.orgao && (
                            <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                              <span>🏛️</span>
                              {concursoData.orgao}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
                            <div className="flex items-center gap-1">
                              <span className="text-lg font-bold text-white">{questionsCount}</span>
                              <span className="text-xs text-gray-500">questões</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-lg font-bold text-white">{disciplinasCount}</span>
                              <span className="text-xs text-gray-500">matérias</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Hover glow effect */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${color.bg} pointer-events-none`} />
                      </Link>
                    );
                  })}
                </div>
                
                {uniqueConcursos.length === 0 && (
                  <div className="text-center p-12 glass-card rounded-2xl">
                    <span className="text-5xl mb-4 block">📭</span>
                    <h3 className="text-xl font-semibold text-white mb-2">Nenhum concurso disponível</h3>
                    <p className="text-gray-400">Aguarde a adição de novos concursos pela administração.</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Traditional Filters - ONLY for Plus and Free plans */}
            {userPlan !== "individual" && viewMode === "filters" && (
            <div className="glass-card rounded-2xl p-5 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-400 text-left">Filtrar Questões</h3>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="text-xs text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1"
                >
                  {showAdvancedFilters ? "Menos filtros" : "Mais filtros"}
                  <svg 
                    className={`w-4 h-4 transition-transform ${showAdvancedFilters ? "rotate-180" : ""}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-2 text-left">Concurso / Prova</label>
                  <select
                    value={filterConcurso}
                    onChange={(e) => setFilterConcurso(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 transition-all appearance-none cursor-pointer [&>option]:bg-[#1a1f2e] [&>option]:text-white [&>option:hover]:bg-orange-500 [&>option:checked]:bg-orange-600"
                  >
                    <option value="">Todos os concursos</option>
                    {uniqueConcursos.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2 text-left">Disciplina / Matéria</label>
                  <select
                    value={filterDisciplina}
                    onChange={(e) => setFilterDisciplina(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 transition-all appearance-none cursor-pointer [&>option]:bg-[#1a1f2e] [&>option]:text-white [&>option:hover]:bg-orange-500 [&>option:checked]:bg-orange-600"
                  >
                    <option value="">Todas as disciplinas</option>
                    {uniqueDisciplinas.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10 animate-slide-in-up">
                  <div>
                    <label className="block text-xs text-gray-500 mb-2 text-left">Banca / Órgão</label>
                    <select
                      value={filterBanca}
                      onChange={(e) => setFilterBanca(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 transition-all appearance-none cursor-pointer [&>option]:bg-[#1a1f2e] [&>option]:text-white"
                    >
                      <option value="">Todas as bancas</option>
                      {uniqueBancas.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-2 text-left">Ano</label>
                    <select
                      value={filterAno}
                      onChange={(e) => setFilterAno(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 transition-all appearance-none cursor-pointer [&>option]:bg-[#1a1f2e] [&>option]:text-white"
                    >
                      <option value="">Todos os anos</option>
                      {uniqueAnos.map(a => (
                        <option key={a} value={String(a)}>{a}</option>
                      ))}
                    </select>
                  </div>
                  {/* Modules filter */}
                  {uniqueModulos.length > 0 && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-2 text-left">Módulo</label>
                      <select
                        value={filterModulo}
                        onChange={(e) => setFilterModulo(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 transition-all appearance-none cursor-pointer [&>option]:bg-[#1a1f2e] [&>option]:text-white"
                      >
                        <option value="">Todos os módulos</option>
                        {uniqueModulos.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
              
              {/* Filter stats and clear button */}
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-sm text-gray-400 flex items-center gap-2">
                  <span className="text-orange-400 font-bold">{filteredQuestions.length}</span> questões encontradas
                  {(filterConcurso || filterDisciplina || filterModulo || filterBanca || filterAno) && (
                    <span className="text-xs text-gray-500">(filtrado)</span>
                  )}
                </span>
                {(filterConcurso || filterDisciplina || filterModulo || filterBanca || filterAno) && (
                  <button
                    onClick={() => { 
                      setFilterConcurso(""); 
                      setFilterDisciplina(""); 
                      setFilterModulo(""); 
                      setFilterBanca("");
                      setFilterAno("");
                    }}
                    className="text-sm text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>
            )}
            
            {/* Resume button if saved progress exists */}
            {hasSavedProgress && (
              <div className="glass-card rounded-2xl p-5 mb-8 border border-orange-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📌</span>
                  <div>
                    <h3 className="font-semibold text-white">Simulado em andamento</h3>
                    <p className="text-sm text-gray-400">Você tem um simulado pausado</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={resumeQuiz}
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                  >
                    Continuar
                  </button>
                  <button
                    onClick={() => { localStorage.removeItem(QUIZ_PROGRESS_KEY); setHasSavedProgress(false); }}
                    className="px-6 py-3 glass-card rounded-xl font-semibold hover:bg-white/10 transition-all"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            )}
            
            {/* Task 141: Message for Individual plan users with packages */}
            {userPlan === "individual" && userPacotes.length > 0 && (
              <div className="text-center mb-6">
                <p className="text-lg text-emerald-400 font-medium">
                  ✨ Seu pacote personalizado está pronto para estudar!
                </p>
              </div>
            )}
            
            {/* Task 141: Message for Individual plan users WITHOUT packages */}
            {userPlan === "individual" && userPacotes.length === 0 && (
              <div className="glass-card rounded-2xl p-8 mb-8 border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 text-center">
                <span className="text-5xl mb-4 block">📦</span>
                <h3 className="text-xl font-bold text-white mb-2">Seu Pacote Está Sendo Preparado</h3>
                <p className="text-gray-400 mb-4">
                  Aguarde a finalização do seu pacote personalizado. 
                  Nossa equipe está preparando as melhores questões para você!
                </p>
                <Link 
                  href="/aguardando-pacote"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/20 text-amber-400 rounded-xl font-medium hover:bg-amber-500/30 transition-all"
                >
                  <span>📋</span>
                  Ver Status do Pacote
                </Link>
              </div>
            )}

            {/* Task 132 & 140: User's Exclusive Packages - ONLY for Individual plan users */}
            {userPlan === "individual" && userPacotes.length > 0 && (
              <div className="glass-card rounded-2xl p-5 mb-8 border-2 border-purple-500/40 bg-gradient-to-br from-purple-500/10 to-pink-500/5 relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500/20 rounded-xl">
                      <span className="text-2xl">⭐</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">Seus Pacotes Exclusivos</h3>
                      <p className="text-sm text-gray-400">{userPacotes.length} pacote(s) personalizado(s) para você</p>
                    </div>
                    <span className="ml-auto px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded-full border border-purple-500/30 animate-pulse">
                      EXCLUSIVO
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userPacotes.map(pacote => {
                      const pacoteQuestionsCount = pacote.questionsIds.length;
                      // Get disciplines from package config
                      const disciplinasCount = pacote.disciplinas?.length || 0;
                      
                      // Verifica se o pacote está bloqueado
                      // BLOQUEADO se: não tem status OU status diferente de "pronto"
                      const isPacotePronto = pacote.status === "pronto";
                      const isPacoteBloqueado = !isPacotePronto; // Se não está pronto, está bloqueado
                      
                      return (
                        <Link 
                          key={pacote.id}
                          href={isPacoteBloqueado ? "/aguardando-pacote" : `/pacote/${encodeURIComponent(pacote.id)}`}
                          className={`group relative p-5 bg-white/5 rounded-xl border border-purple-500/20 hover:bg-white/10 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/10 ${isPacoteBloqueado ? 'opacity-75' : ''}`}
                        >
                          {/* Cadeado no canto superior direito */}
                          {isPacoteBloqueado && (
                            <div className="absolute top-3 right-3 z-10">
                              <div className="relative group/lock">
                                <div className="absolute inset-0 bg-amber-500/30 rounded-lg blur-md"></div>
                                <div className="relative px-2 py-1.5 bg-gradient-to-br from-amber-500/80 to-orange-500/80 rounded-lg border border-amber-400/50 shadow-lg">
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                {/* Tooltip */}
                                <div className="absolute top-full right-0 mt-2 opacity-0 group-hover/lock:opacity-100 transition-opacity pointer-events-none">
                                  <div className="px-3 py-1.5 bg-gray-900 border border-amber-500/30 rounded-lg shadow-xl whitespace-nowrap text-xs text-amber-400">
                                    Em preparação...
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Badge de status PRONTO */}
                          {isPacotePronto && (
                            <div className="absolute top-3 right-3 z-10">
                              <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500/30 rounded-lg blur-md"></div>
                                <div className="relative px-2 py-1 bg-gradient-to-br from-emerald-500/80 to-green-500/80 rounded-lg border border-emerald-400/50 shadow-lg flex items-center gap-1">
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-xs font-bold text-white">PRONTO</span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 pr-12">
                              <h4 className="font-bold text-white text-lg group-hover:text-purple-300 transition-colors">{pacote.nome}</h4>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-1">
                                {pacote.banca && <span className="flex items-center gap-1">🏛️ {pacote.banca}</span>}
                                {pacote.ano && <span className="flex items-center gap-1">📅 {pacote.ano}</span>}
                              </div>
                            </div>
                            {!isPacoteBloqueado && (
                              <span className="text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all">→</span>
                            )}
                          </div>
                          
                          {pacote.descricao && (
                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{pacote.descricao}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1.5">
                              <span className="text-purple-400">📝</span>
                              <span className="text-white font-semibold">{pacoteQuestionsCount}</span>
                              <span className="text-gray-500">questões</span>
                            </div>
                            {disciplinasCount > 0 && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-purple-400">📚</span>
                                <span className="text-white font-semibold">{disciplinasCount}</span>
                                <span className="text-gray-500">matérias</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <span className="text-sm text-purple-400 font-medium group-hover:text-purple-300">
                              Acessar Pacote →
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            
            {/* Stats cards */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <div className="glass-card rounded-2xl px-6 py-4 min-w-[120px]">
                <div className="text-2xl font-bold text-orange-400">{filteredQuestions.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Questões</div>
              </div>
              <div className="glass-card rounded-2xl px-6 py-4 min-w-[120px]">
                <div className="text-2xl font-bold text-blue-400">{TIME_PER_QUESTION}s</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Por Questão</div>
              </div>
              <div className="glass-card rounded-2xl px-6 py-4 min-w-[120px]">
                <div className="text-2xl font-bold text-emerald-400">{uniqueConcursos.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Concursos</div>
              </div>
            </div>
            
            {/* Daily question counter for free users */}
            {(userPlan === "free" || !userPlan) && (
              <div className={`mb-4 px-4 py-3 rounded-xl border flex items-center justify-center gap-3 ${
                remainingQuestions === 0 
                  ? "bg-red-500/10 border-red-500/30" 
                  : remainingQuestions <= 3
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-emerald-500/10 border-emerald-500/30"
              }`}>
                <span className="text-lg">{remainingQuestions === 0 ? "⛔" : remainingQuestions <= 3 ? "⚠️" : "📊"}</span>
                <span className={`font-medium ${
                  remainingQuestions === 0 
                    ? "text-red-400" 
                    : remainingQuestions <= 3
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}>
                  {remainingQuestions === 0 
                    ? "Limite atingido! Volte amanhã ou faça upgrade"
                    : `${remainingQuestions}/${PLAN_LIMITS.free.questionsPerDay} questões restantes hoje`
                  }
                </span>
                {remainingQuestions > 0 && remainingQuestions <= 5 && (
                  <Link href="/planos">
                    <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors cursor-pointer">
                      Upgrade
                    </span>
                  </Link>
                )}
              </div>
            )}
            
            {/* Task 155 & 167: Enhanced "Iniciar Simulado" button with animations */}
            {userPlan !== "individual" && (
              <button
                onClick={startQuiz}
                disabled={filteredQuestions.length === 0 || ((userPlan === "free" || !userPlan) && remainingQuestions === 0)}
                className="group relative px-14 py-6 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 bg-[length:200%_100%] rounded-2xl font-bold text-lg overflow-hidden transition-all duration-500 hover:scale-110 active:scale-95 shadow-2xl shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 animate-gradient-x hover:shadow-orange-500/60"
              >
                {/* Animated background shine */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                {/* Pulse rings */}
                <div className="absolute inset-0 rounded-2xl">
                  <div className="absolute inset-0 rounded-2xl animate-ping-slow bg-orange-400/20" />
                </div>
                
                {/* Icon */}
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {filteredQuestions.length === 0 ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (userPlan === "free" || !userPlan) && remainingQuestions === 0 ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span>
                    {filteredQuestions.length === 0 
                      ? "Nenhuma questão disponível" 
                      : (userPlan === "free" || !userPlan) && remainingQuestions === 0
                      ? "Limite Atingido - Faça Upgrade"
                      : "Iniciar Simulado"
                    }
                  </span>
                </span>
                
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            )}
            
            {/* Custom animations */}
            <style>{`
              @keyframes gradient-x {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
              }
              .animate-gradient-x {
                animation: gradient-x 3s ease infinite;
              }
              @keyframes ping-slow {
                0% { transform: scale(1); opacity: 0.3; }
                75%, 100% { transform: scale(1.1); opacity: 0; }
              }
              .animate-ping-slow {
                animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
              }
            `}</style>
          </div>
        </main>
        
        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="glass-card rounded-3xl p-8 max-w-md w-full text-center animate-slide-in-up">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Conteúdo Bloqueado</h3>
              <p className="text-gray-400 mb-6">
                Este concurso não está disponível no seu <span className="text-orange-400 font-medium">Plano Individual</span>.
                <br />Faça upgrade para o <span className="text-amber-400 font-medium">Plano Plus</span> e tenha acesso a todos os concursos!
              </p>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Plano Plus</span>
                  <span className="text-amber-400 font-bold">R$ 197/mês</span>
                </div>
                <ul className="text-sm text-gray-300 text-left space-y-1">
                  <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> Acesso a TODOS os concursos</li>
                  <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> Todas as disciplinas</li>
                  <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> Suporte prioritário</li>
                </ul>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all"
                >
                  Voltar
                </button>
                <Link href="/planos" className="flex-1">
                  <button className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 rounded-xl font-bold transition-all">
                    Fazer Upgrade
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {/* Daily Limit Modal for Free Users */}
        {showDailyLimitModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="glass-card rounded-3xl p-8 max-w-md w-full text-center animate-slide-in-up">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500/30 to-amber-500/20 flex items-center justify-center">
                <span className="text-4xl">⏰</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Limite Diário Atingido!
              </h3>
              <p className="text-gray-400 mb-6">
                Você já respondeu suas <span className="text-emerald-400 font-bold">{PLAN_LIMITS.free.questionsPerDay} questões gratuitas</span> de hoje.
                <br /><br />
                Faça upgrade para continuar estudando sem limites!
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300 flex items-center gap-2">
                      <span>⭐</span> Plano Individual
                    </span>
                    <span className="text-orange-400 font-bold">R$ {PLAN_LIMITS.individual.price}/mês</span>
                  </div>
                  <p className="text-xs text-gray-400 text-left">Questões ilimitadas para 1 concurso</p>
                </div>
                
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300 flex items-center gap-2">
                      <span>✨</span> Plano Plus
                    </span>
                    <span className="text-amber-400 font-bold">R$ {PLAN_LIMITS.plus.price}/mês</span>
                  </div>
                  <p className="text-xs text-gray-400 text-left">Questões ilimitadas + todos os concursos</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                {/* Mercado Pago Quick Links */}
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="https://mpago.la/1ym97zu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 rounded-xl font-bold transition-all text-center text-sm shadow-lg shadow-orange-500/25"
                  >
                    💳 Individual R$97
                  </a>
                  <a
                    href="https://mpago.la/1AtgXnn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 bg-gradient-to-r from-amber-400 to-yellow-400 hover:opacity-90 rounded-xl font-bold text-gray-900 transition-all text-center text-sm shadow-lg shadow-amber-500/25"
                  >
                    ✨ Plus R$197
                  </a>
                </div>
                
                <p className="text-xs text-gray-400 text-center">Pagamento seguro via Mercado Pago</p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDailyLimitModal(false)}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all"
                  >
                    Voltar Amanhã
                  </button>
                  <Link href="/planos" className="flex-1">
                    <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all">
                      Comparar Planos
                    </button>
                  </Link>
                </div>
                
                <a
                  href={`https://api.whatsapp.com/send?phone=5521980645070&text=${encodeURIComponent(`Olá! Atingi meu limite diário e gostaria de fazer upgrade. Meu usuário é: ${user?.username}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Falar com Suporte
                </a>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                🔄 Seu limite será renovado amanhã às 00:00
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Finished Screen
  if (gameState === "finished") {
    const getEmoji = () => {
      if (percentage >= 80) return "🏆";
      if (percentage >= 60) return "🎉";
      if (percentage >= 40) return "👍";
      return "💪";
    };

    const getMessage = () => {
      if (percentage >= 80) return "Excelente! Aprovação garantida!";
      if (percentage >= 60) return "Muito bom! Continue estudando!";
      if (percentage >= 40) return "Bom progresso! Foco nos estudos!";
      return "Não desista! Revise o conteúdo!";
    };

    const getGradient = () => {
      if (percentage >= 80) return "from-emerald-500 to-teal-500";
      if (percentage >= 60) return "from-blue-500 to-cyan-500";
      if (percentage >= 40) return "from-amber-500 to-orange-500";
      return "from-red-500 to-pink-500";
    };

    return (
      <div className="min-h-screen bg-[#070b14] text-white flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        
        {/* Task 175: Fixed Sidebar Menu */}
        <SidebarMenu />
        
        <AppHeader showAdmin />
        
        <main className="flex-1 flex flex-col items-center justify-center p-6 pb-24 lg:pb-6 lg:ml-20 xl:ml-72 text-center relative z-10 transition-all duration-300">
          <div className="animate-scale-in">
            <div className="text-8xl md:text-9xl mb-8 animate-float">{getEmoji()}</div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold mb-6">
              {getMessage()}
            </h1>
            
            <div className="glass-card rounded-3xl p-8 md:p-10 mb-10 min-w-[300px]">
              <div className={`text-7xl md:text-8xl font-black bg-gradient-to-r ${getGradient()} bg-clip-text text-transparent mb-3`}>
                {percentage}%
              </div>
              <p className="text-gray-400 text-lg">
                {score} de {totalQuestions} questões corretas
              </p>
              
              {/* Mini stats */}
              <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-emerald-400">{score}</div>
                  <div className="text-xs text-gray-500">Acertos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">{totalQuestions - score}</div>
                  <div className="text-xs text-gray-500">Erros</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 flex-wrap justify-center">
              <button
                onClick={startQuiz}
                className="group relative px-10 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl font-bold overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-orange-500/25"
              >
                <span className="relative z-10">🔄 Novo Simulado</span>
              </button>
              <Link
                href="/dashboard"
                className="px-10 py-4 glass-card rounded-2xl font-bold hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
              >
                📊 Ver Meu Desempenho
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Loading Screen
  if (authLoading || isInitializing) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Playing Screen
  const timerPercentage = (timeLeft / TIME_PER_QUESTION) * 100;
  const isTimeLow = timeLeft <= 10;

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex-col relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-50" />
      
      {/* Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-3xl p-6 md:p-8 max-w-md w-full animate-scale-in">
            <div className="text-center mb-6">
              <span className="text-5xl mb-4 block">⚠️</span>
              <h3 className="text-xl font-bold text-white mb-2">Sair do Simulado?</h3>
              <p className="text-gray-400">Você respondeu {results.length} de {totalQuestions} questões.</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => handleExitQuiz(true)}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl font-bold transition-all hover:scale-[1.02]"
              >
                💾 Salvar e Sair (Continuar depois)
              </button>
              <button
                onClick={() => handleExitQuiz(false)}
                className="w-full py-4 glass-card rounded-2xl font-semibold hover:bg-white/10 transition-all text-red-400"
              >
                🗑️ Sair sem Salvar
              </button>
              <button
                onClick={() => setShowExitModal(false)}
                className="w-full py-4 glass-card rounded-2xl font-semibold hover:bg-white/10 transition-all"
              >
                ← Voltar ao Simulado
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* AI Search Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-3xl p-6 md:p-8 max-w-lg w-full animate-scale-in max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🤖</span>
                <div>
                  <h3 className="text-xl font-bold text-white">Pesquisar com IA</h3>
                  <p className="text-xs text-gray-400">Tire suas dúvidas sobre a questão</p>
                </div>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                ✕
              </button>
            </div>
            
            <div className="glass-card rounded-xl p-3 mb-4 border border-amber-500/30 bg-amber-500/5">
              <p className="text-xs text-amber-400">
                ⚡ Esta ferramenta é para estudo. Usar IA não afeta sua pontuação.
              </p>
            </div>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAIQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAISearch()}
                placeholder="Digite sua dúvida sobre a questão..."
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
              />
              <button
                onClick={handleAISearch}
                disabled={!aiQuery.trim()}
                className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold disabled:opacity-50 transition-all hover:scale-[1.02]"
              >
                Buscar
              </button>
            </div>
            
            {aiSearches.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-400">Suas pesquisas:</h4>
                {aiSearches.map((search, i) => (
                  <div key={i} className="glass-card rounded-xl p-4">
                    <p className="text-white text-sm mb-2">📝 {search.query}</p>
                    <p className="text-gray-400 text-xs">
                      ✅ Sua pesquisa foi registrada. Em breve teremos integração com IA para responder suas dúvidas!
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Comments Upsell Modal */}
      {showCommentsUpsellModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-3xl p-6 md:p-8 max-w-md w-full animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Comentários Bloqueados</h3>
              <p className="text-gray-400">
                Os comentários e explicações detalhadas estão disponíveis apenas nos <span className="text-amber-400 font-medium">planos pagos</span>.
              </p>
            </div>
            
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6">
              <p className="text-sm text-amber-300 mb-2 font-medium">✨ Com os planos pagos você tem acesso a:</p>
              <ul className="text-xs text-gray-300 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  Explicações detalhadas de cada questão
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  Análise de erros personalizada
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  Questões ilimitadas por dia
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  Plano de estudos personalizado
                </li>
              </ul>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <a
                href="https://mpago.la/1ym97zu"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl transition-all text-center text-sm"
              >
                <span className="block text-xs opacity-80">Individual</span>
                R$ 97/mês
              </a>
              <a
                href="https://mpago.la/1AtgXnn"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-gray-900 font-bold rounded-xl transition-all text-center text-sm"
              >
                <span className="block text-xs opacity-80">Plus</span>
                R$ 197/mês
              </a>
            </div>
            
            <button
              onClick={() => setShowCommentsUpsellModal(false)}
              className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all"
            >
              Continuar Estudando
            </button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between p-4 md:p-5">
          <div className="flex items-center gap-3">
            {/* Exit button */}
            <button
              onClick={() => setShowExitModal(true)}
              className="p-2.5 glass-card rounded-xl hover:bg-white/10 transition-all"
              title="Sair do simulado"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            
            <img 
              src="./1522a1ec-a823-4b8d-b840-956fc29e2cf8.jpg" 
              alt="Logo"
              className="w-10 h-10 md:w-11 md:h-11 rounded-xl object-cover ring-1 ring-white/10"
            />
            <div>
              <div className="text-sm font-semibold text-white">
                Questão {currentIndex + 1} de {totalQuestions}
              </div>
              <div className="text-xs text-gray-500">
                {score} acertos • {currentQuestion?.disciplina || "Geral"}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* AI Search button */}
            <button
              onClick={() => setShowAIModal(true)}
              className="p-2.5 glass-card rounded-xl hover:bg-white/10 transition-all"
              title="Pesquisar com IA"
            >
              <span className="text-lg">🤖</span>
            </button>
            
            {/* Timer */}
            <div className={`relative flex items-center gap-3 px-5 py-2.5 rounded-2xl transition-all duration-300 ${
              isTimeLow ? "glass-card ring-2 ring-red-500/50" : "glass-card"
            }`}>
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18" cy="18" r="15"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18" cy="18" r="15"
                    fill="none"
                    stroke={isTimeLow ? "#ef4444" : "#f97316"}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="94.2"
                    strokeDashoffset={94.2 - (94.2 * timerPercentage / 100)}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${
                  isTimeLow ? "text-red-400" : "text-white"
                }`}>
                  {timeLeft}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + (selectedAnswer !== null ? 1 : 0)) / totalQuestions) * 100}%` }}
          />
        </div>
      </header>

      {/* Question */}
      <main className="flex-1 flex flex-col p-4 md:p-6 relative z-10">
        <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col animate-slide-in-up">
          {/* Question metadata */}
          {(currentQuestion?.concurso || currentQuestion?.disciplina) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {currentQuestion.concurso && (
                <span className="px-3 py-1 glass-card rounded-full text-xs font-medium text-orange-400">
                  📋 {currentQuestion.concurso} {currentQuestion.ano && `(${currentQuestion.ano})`}
                </span>
              )}
              {currentQuestion.disciplina && (
                <span className="px-3 py-1 glass-card rounded-full text-xs font-medium text-blue-400">
                  📚 {currentQuestion.disciplina}
                </span>
              )}
              {currentQuestion.orgao && (
                <span className="px-3 py-1 glass-card rounded-full text-xs font-medium text-gray-400">
                  🏛️ {currentQuestion.orgao}
                </span>
              )}
            </div>
          )}
          
          {/* Question card */}
          <div className="glass-card rounded-3xl p-6 md:p-8 mb-6">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold leading-relaxed">
              {currentQuestion?.title}
            </h2>
          </div>
          
          {/* Options - Task 146: Two-step selection with immediate green feedback */}
          <div className="grid gap-3 md:gap-4 stagger-children">
            {currentQuestion?.options.map((option, index) => {
              const isPreSelected = selectedOption === index && selectedAnswer === null;
              const isConfirmedSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showResult = selectedAnswer !== null;
              const revealedAnswer = showCorrectAnswer && !showResult;
              
              let cardClass = "glass-card hover:bg-white/[0.08] cursor-pointer";
              let labelClass = "bg-white/10 text-gray-300";
              
              if (showResult) {
                // After confirmation - show correct/incorrect
                if (isCorrect) {
                  cardClass = "bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/30";
                  labelClass = "bg-emerald-500 text-white";
                } else if (isConfirmedSelected && !isCorrect) {
                  cardClass = "bg-red-500/10 border-red-500/50 ring-1 ring-red-500/30";
                  labelClass = "bg-red-500 text-white";
                } else {
                  cardClass = "glass-card opacity-50";
                  labelClass = "bg-white/10 text-gray-500";
                }
              } else if (isPreSelected) {
                // Pre-confirmation selection - immediate green feedback
                cardClass = "bg-emerald-500/10 border-emerald-500/50 ring-2 ring-emerald-500/30";
                labelClass = "bg-emerald-500 text-white";
              } else if (revealedAnswer && isCorrect) {
                // Show correct answer with special styling when "Ver Resposta" is clicked
                cardClass = "bg-emerald-500/10 border-emerald-500/50 ring-2 ring-emerald-500/40 animate-pulse";
                labelClass = "bg-emerald-500 text-white";
              }
              
              return (
                <button
                  key={index}
                  onClick={() => handleSelectOption(index)}
                  disabled={selectedAnswer !== null}
                  className={`flex items-center gap-4 p-4 md:p-5 rounded-2xl transition-all duration-300 ${cardClass} ${
                    !showResult && !revealedAnswer ? "hover:scale-[1.01] active:scale-[0.99]" : ""
                  }`}
                >
                  <span className={`w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-bold text-base transition-all ${labelClass}`}>
                    {showResult ? (isCorrect ? "✓" : isConfirmedSelected ? "✗" : OPTION_LABELS[index]) : 
                     isPreSelected ? "✓" : 
                     (revealedAnswer && isCorrect ? "✓" : OPTION_LABELS[index])}
                  </span>
                  <span className={`text-left text-base md:text-lg flex-1 font-medium ${
                    showResult && !isCorrect && !isConfirmedSelected ? "text-gray-500" : "text-white"
                  }`}>
                    {option}
                  </span>
                  {revealedAnswer && isCorrect && (
                    <span className="px-3 py-1 bg-emerald-500/30 text-emerald-300 text-xs font-bold rounded-full">
                      CORRETA
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Task 150: Responder Button - visible when option is selected but not confirmed */}
          {selectedOption !== null && selectedAnswer === null && (
            <div className="mt-6">
              <button
                onClick={() => handleConfirmAnswer()}
                disabled={isSubmittingAnswer}
                className={`w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-3 ${
                  isSubmittingAnswer 
                    ? 'opacity-80 cursor-wait scale-[0.98]' 
                    : 'hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isSubmittingAnswer ? (
                  <>
                    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Responder
                  </>
                )}
              </button>
            </div>
          )}
          
          {/* "Ver Resposta" button - only shown BEFORE answering */}
          {selectedAnswer === null && !showCorrectAnswer && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowCorrectAnswer(true)}
                className="px-6 py-3 glass-card rounded-xl text-sm font-medium text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver Resposta
              </button>
            </div>
          )}
          
          {/* Notice when answer is revealed */}
          {showCorrectAnswer && selectedAnswer === null && (
            <div className="mt-4 p-4 glass-card rounded-xl border border-amber-500/30 bg-amber-500/5 text-center">
              <p className="text-amber-400 text-sm">
                👆 A resposta correta está destacada acima. Você ainda pode responder normalmente!
              </p>
            </div>
          )}

          {/* After answer or reveal - show Ver Comentário button and comment section */}
          {(showExplanation || showCorrectAnswer) && (
            <div className="mt-6 md:mt-8 animate-slide-in-up">
              {/* "Ver Comentário" button - collapsible */}
              {!showComment ? (
                <button
                  onClick={() => {
                    if (userCanViewComments) {
                      setShowComment(true);
                    } else {
                      setShowCommentsUpsellModal(true);
                    }
                  }}
                  className={`w-full p-4 glass-card rounded-2xl border transition-all flex items-center justify-center gap-3 group ${
                    userCanViewComments 
                      ? "border-orange-500/30 hover:bg-orange-500/10" 
                      : "border-gray-500/30 hover:bg-gray-500/10"
                  }`}
                >
                  <span className="text-2xl">{userCanViewComments ? "💡" : "🔒"}</span>
                  <span className={`font-semibold group-hover:opacity-80 ${
                    userCanViewComments ? "text-orange-400" : "text-gray-400"
                  }`}>
                    {userCanViewComments ? "Ver Comentário / Explicação" : "Ver Comentário"}
                  </span>
                  {!userCanViewComments && (
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full">
                      PRO
                    </span>
                  )}
                  <svg className={`w-5 h-5 ${userCanViewComments ? "text-orange-400" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Collapsible comment header */}
                  <button
                    onClick={() => setShowComment(false)}
                    className="w-full glass-card rounded-2xl p-5 md:p-6 border-l-4 border-orange-500 text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">💡</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-orange-400 text-lg">Comentário / Explicação</h3>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                          {currentQuestion?.explanation}
                        </p>
                        
                        {/* Task 170: Audio Comment Button - Plus Plan Only */}
                        {(isUserPlus(user?.email || user?.username || "") || isSuperAdmin(user?.email) || isSuperAdmin(user?.username)) && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Tenta usar arquivo de áudio primeiro, senão usa TTS
                                const audioFile = (currentQuestion as any)?.audioComment;
                                if (audioFile) {
                                  const audio = new Audio(audioFile);
                                  audio.play().catch(() => {
                                    // Fallback para TTS se áudio não carregar
                                    const text = currentQuestion?.explanation || "";
                                    if ('speechSynthesis' in window && text) {
                                      const utterance = new SpeechSynthesisUtterance(text);
                                      utterance.lang = 'pt-BR';
                                      utterance.rate = 0.9;
                                      speechSynthesis.speak(utterance);
                                    }
                                  });
                                } else {
                                  // Usa TTS se não tiver arquivo de áudio
                                  const text = currentQuestion?.explanation || "";
                                  if ('speechSynthesis' in window && text) {
                                    const utterance = new SpeechSynthesisUtterance(text);
                                    utterance.lang = 'pt-BR';
                                    utterance.rate = 0.9;
                                    speechSynthesis.speak(utterance);
                                  }
                                }
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-400 hover:bg-purple-500/30 transition-all text-sm font-medium"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                              </svg>
                              🎧 Ouvir Comentário em Áudio
                              <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded">PLUS</span>
                            </button>
                          </div>
                        )}
                        
                        {/* Task 171: ChatGPT Search Button - Plus Plan Only */}
                        {(isUserPlus(user?.email || user?.username || "") || isSuperAdmin(user?.email) || isSuperAdmin(user?.username)) && (
                          <div className="mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowAIModal(true);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 hover:bg-emerald-500/30 transition-all text-sm font-medium"
                            >
                              <span className="text-lg">🤖</span>
                              Pesquisar com ChatGPT
                              <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded">PLUS</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
              
                  {/* Error Analysis - shown only when answer is wrong */}
                  {currentErrorAnalysis && (
                    <div className="glass-card rounded-2xl p-5 md:p-6 border-l-4 border-red-500 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">{currentErrorAnalysis.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold">
                              {currentErrorAnalysis.errorTypeName}
                            </span>
                          </div>
                          
                          <h4 className="font-bold text-red-400 text-lg mb-2">Análise do Erro</h4>
                          
                          {/* Insight */}
                          <div className="mb-4">
                            <p className="text-sm text-gray-400 mb-1">📊 O que isso revela:</p>
                            <p className="text-gray-300 leading-relaxed">
                              {currentErrorAnalysis.insight}
                            </p>
                          </div>
                          
                          {/* How to fix */}
                          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <p className="text-sm text-emerald-400 mb-1 font-semibold">✨ Como corrigir:</p>
                            <p className="text-gray-300 leading-relaxed">
                              {currentErrorAnalysis.howToFix}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Next button - only show after answering */}
              {showExplanation && (
                <button
                  onClick={nextQuestion}
                  className="group w-full mt-6 py-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-orange-500/25"
                >
                  {currentIndex + 1 >= totalQuestions ? "🏁 Ver Resultado" : "Próxima Questão →"}
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Index;
