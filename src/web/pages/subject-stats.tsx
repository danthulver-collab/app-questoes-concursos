import { useState, useEffect } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { getQuizData, type Question, type QuizData, type Pacote } from "../lib/quiz-store";
import { AppHeader } from "../components/app-header";
import { useAuth } from "../lib/auth-context-supabase";

// Task 117: Detailed statistics page for a subject/discipline

interface QuestionProgress {
  answered: boolean;
  correct: boolean;
  answeredAt: string;
  userAnswer: number;
}

interface ProgressData {
  [questionId: string]: QuestionProgress;
}

interface QuestionDifficulty {
  question: Question;
  correctRate: number;
  attempts: number;
}

function SubjectStatsPage() {
  const { user } = useAuth();
  const [, params] = useRoute("/pacote/:id/materia/:disciplina/stats");
  const [, setLocation] = useLocation();
  const pacoteId = params?.id || "";
  const disciplina = params?.disciplina ? decodeURIComponent(params.disciplina) : "";
  
  const [pacote, setPacote] = useState<Pacote | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [progress, setProgress] = useState<ProgressData>({});
  const [weeklyData, setWeeklyData] = useState<{ day: string; count: number; correct: number }[]>([]);

  // Load data
  useEffect(() => {
    const data = getQuizData();
    const foundPacote = data.pacotes.find(p => p.id === decodeURIComponent(pacoteId));
    setPacote(foundPacote || null);
    
    if (foundPacote) {
      // Get questions for this discipline
      let pacoteQuestions: Question[] = [];
      if (foundPacote.questionsIds && foundPacote.questionsIds.length > 0) {
        pacoteQuestions = data.questions.filter(q => 
          foundPacote.questionsIds.includes(q.id) && q.disciplina === disciplina
        );
      } else {
        pacoteQuestions = data.questions.filter(q => 
          (q.concurso === foundPacote.nome || q.concurso?.toLowerCase() === foundPacote.nome.toLowerCase()) &&
          q.disciplina === disciplina
        );
      }
      setQuestions(pacoteQuestions);
    }
    
    // Load progress
    if (user?.username) {
      const storageKey = `quiz_answered_${user.username}_${pacoteId}_${disciplina}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const progressData = JSON.parse(stored);
          setProgress(progressData);
          
          // Calculate weekly data
          const weekly: Record<string, { count: number; correct: number }> = {};
          const now = new Date();
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dayKey = date.toLocaleDateString("pt-BR", { weekday: "short" });
            weekly[dayKey] = { count: 0, correct: 0 };
          }
          
          Object.values(progressData).forEach((p: any) => {
            if (p.answeredAt) {
              const date = new Date(p.answeredAt);
              const dayKey = date.toLocaleDateString("pt-BR", { weekday: "short" });
              if (weekly[dayKey]) {
                weekly[dayKey].count++;
                if (p.correct) weekly[dayKey].correct++;
              }
            }
          });
          
          setWeeklyData(Object.entries(weekly).map(([day, data]) => ({ day, ...data })));
        } catch { /* ignore */ }
      }
    }
  }, [pacoteId, disciplina, user]);

  // Calculate statistics
  const totalQuestions = questions.length;
  const answeredCount = Object.values(progress).filter(p => p.answered).length;
  const correctCount = Object.values(progress).filter(p => p.correct).length;
  const incorrectCount = answeredCount - correctCount;
  const unansweredCount = totalQuestions - answeredCount;
  const accuracyPercent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  
  // Get most difficult questions (ones user got wrong)
  const difficultQuestions = questions
    .filter(q => progress[q.id]?.answered && !progress[q.id]?.correct)
    .slice(0, 5);
  
  // Get recently answered
  const recentlyAnswered = Object.entries(progress)
    .filter(([_, p]) => p.answered)
    .sort((a, b) => new Date(b[1].answeredAt).getTime() - new Date(a[1].answeredAt).getTime())
    .slice(0, 5)
    .map(([id, p]) => ({
      question: questions.find(q => q.id === id),
      progress: p
    }))
    .filter(item => item.question);

  // Max value for chart scaling
  const maxChartValue = Math.max(...weeklyData.map(d => d.count), 1);

  if (!pacote) {
    return (
      <div className="min-h-screen bg-[#070b14]">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="glass-card rounded-3xl p-12">
            <span className="text-6xl mb-6 block">📊</span>
            <h1 className="text-3xl font-bold text-white mb-4">Estatísticas não encontradas</h1>
            <Link href="/" className="text-orange-400 hover:underline">Voltar para Início</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14]">
      <AppHeader />
      
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href={`/pacote/${pacoteId}`} className="hover:text-white transition-colors">
            {pacote.nome}
          </Link>
          <span>›</span>
          <Link href={`/pacote/${pacoteId}/materia/${encodeURIComponent(disciplina)}`} className="hover:text-white transition-colors">
            {disciplina}
          </Link>
          <span>›</span>
          <span className="text-white">Estatísticas</span>
        </nav>
        
        {/* Header */}
        <div className="glass-card rounded-2xl p-6 md:p-8 mb-6 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">📊</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{disciplina}</h1>
              <p className="text-gray-400">Estatísticas detalhadas</p>
            </div>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-white mb-1">{totalQuestions}</div>
            <div className="text-sm text-gray-400">Total</div>
          </div>
          <div className="glass-card rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-1">{correctCount}</div>
            <div className="text-sm text-gray-400">Certas</div>
          </div>
          <div className="glass-card rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-rose-400 mb-1">{incorrectCount}</div>
            <div className="text-sm text-gray-400">Erradas</div>
          </div>
          <div className="glass-card rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-amber-400 mb-1">{accuracyPercent}%</div>
            <div className="text-sm text-gray-400">Acerto</div>
          </div>
        </div>
        
        {/* Weekly Activity Chart */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📈</span>
            Atividade Semanal
          </h2>
          
          <div className="flex items-end justify-between gap-2 h-40">
            {weeklyData.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-1" style={{ height: "100px" }}>
                  {/* Correct bar */}
                  <div 
                    className="w-full max-w-[30px] bg-emerald-500/50 rounded-t-sm transition-all"
                    style={{ 
                      height: `${(day.correct / maxChartValue) * 100}%`,
                      minHeight: day.correct > 0 ? "4px" : "0"
                    }}
                  />
                  {/* Incorrect bar */}
                  <div 
                    className="w-full max-w-[30px] bg-rose-500/50 rounded-b-sm transition-all"
                    style={{ 
                      height: `${((day.count - day.correct) / maxChartValue) * 100}%`,
                      minHeight: (day.count - day.correct) > 0 ? "4px" : "0"
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 capitalize">{day.day}</span>
                <span className="text-xs text-gray-400">{day.count}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-emerald-500/50 rounded"></span>
              Certas
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-rose-500/50 rounded"></span>
              Erradas
            </span>
          </div>
        </div>
        
        {/* Progress Distribution */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🎯</span>
            Distribuição do Progresso
          </h2>
          
          <div className="space-y-4">
            {/* Progress bar */}
            <div className="h-4 rounded-full bg-white/5 overflow-hidden flex">
              {correctCount > 0 && (
                <div 
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${(correctCount / totalQuestions) * 100}%` }}
                />
              )}
              {incorrectCount > 0 && (
                <div 
                  className="h-full bg-rose-500 transition-all"
                  style={{ width: `${(incorrectCount / totalQuestions) * 100}%` }}
                />
              )}
              {unansweredCount > 0 && (
                <div 
                  className="h-full bg-gray-500/50 transition-all"
                  style={{ width: `${(unansweredCount / totalQuestions) * 100}%` }}
                />
              )}
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500"></span>
                <span className="text-gray-400">Corretas: {correctCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-rose-500"></span>
                <span className="text-gray-400">Incorretas: {incorrectCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-gray-500"></span>
                <span className="text-gray-400">Não respondidas: {unansweredCount}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Difficult Questions / Points to Review */}
        {difficultQuestions.length > 0 && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>💡</span>
              Questões para Revisar
            </h2>
            
            <div className="space-y-3">
              {difficultQuestions.map((q, idx) => (
                <div key={q.id} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <p className="text-sm text-white line-clamp-2">{q.title}</p>
                  {q.assunto && (
                    <span className="text-xs text-rose-400 mt-2 block">Assunto: {q.assunto}</span>
                  )}
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setLocation(`/pacote/${pacoteId}/materia/${encodeURIComponent(disciplina)}?filter=incorrect`)}
              className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-white hover:scale-[1.02] transition-transform"
            >
              📝 Estudar Pontos Fracos
            </button>
          </div>
        )}
        
        {/* Recommendations */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📋</span>
            Recomendações
          </h2>
          
          <div className="space-y-3 text-sm">
            {accuracyPercent < 50 && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300">
                🎯 Sua taxa de acerto está abaixo de 50%. Recomendamos revisar os conceitos básicos desta matéria antes de continuar.
              </div>
            )}
            {accuracyPercent >= 50 && accuracyPercent < 80 && (
              <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-300">
                📚 Bom progresso! Foque em revisar as questões que errou para melhorar ainda mais.
              </div>
            )}
            {accuracyPercent >= 80 && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300">
                🌟 Excelente desempenho! Você domina bem esta matéria. Continue praticando para manter o conhecimento.
              </div>
            )}
            {unansweredCount > 0 && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-gray-300">
                📌 Você ainda tem {unansweredCount} questões não respondidas. Continue estudando para completar a matéria!
              </div>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/pacote/${pacoteId}/materia/${encodeURIComponent(disciplina)}`}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-white text-center hover:scale-[1.02] transition-transform"
          >
            Continuar Estudando
          </Link>
          <Link
            href={`/pacote/${pacoteId}`}
            className="flex-1 px-6 py-4 glass-card rounded-xl font-semibold text-white text-center hover:bg-white/5 transition-colors"
          >
            Ver Outras Matérias
          </Link>
        </div>
      </main>
    </div>
  );
}

export default SubjectStatsPage;
