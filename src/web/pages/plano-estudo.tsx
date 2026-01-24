import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { AppHeader } from "../components/app-header";
import { useAuth } from "../lib/auth-context-supabase";
import { getErrorStats, getUserStats, type ErrorType } from "../lib/user-stats";
import { getQuizData } from "../lib/quiz-store";

interface DayTask {
  id: string;
  text: string;
  completed: boolean;
}

interface DayPlan {
  day: number;
  title: string;
  focus: string;
  disciplinas: string[];
  questionsToReview: number;
  questionsCompleted: number;
  tips: string[];
  exercises: string[];
  completed: boolean;
  tasks: DayTask[];
}

const STUDY_PLAN_KEY = "study_plan_progress";
const STUDY_PLAN_TASKS_KEY = "study_plan_tasks";
const STUDY_PLAN_QUESTIONS_KEY = "study_plan_questions";
const STUDY_PLAN_GENERATED_KEY = "study_plan_generated_at";

const DAILY_TIPS: Record<number, string[]> = {
  1: [
    "Comece com uma revisão geral dos conceitos que mais errou.",
    "Faça resumos curtos dos tópicos principais.",
    "Não tente decorar, entenda a lógica."
  ],
  2: [
    "Pratique questões focadas na disciplina mais fraca.",
    "Use técnicas de memorização como mapas mentais.",
    "Faça pausas de 5 minutos a cada 25 minutos de estudo."
  ],
  3: [
    "Revise os erros de confusão conceitual.",
    "Compare conceitos similares lado a lado.",
    "Crie flashcards para termos que confunde."
  ],
  4: [
    "Foque em questões de interpretação de texto.",
    "Pratique leitura atenta, sublinhando palavras-chave.",
    "Releia enunciados antes de responder."
  ],
  5: [
    "Simule condições reais de prova com tempo.",
    "Evite distrações durante o estudo.",
    "Respire fundo antes de cada questão."
  ],
  6: [
    "Revisão geral de todos os tópicos trabalhados.",
    "Refaça questões que errou nos dias anteriores.",
    "Anote dúvidas para pesquisar depois."
  ],
  7: [
    "Dia de consolidação e descanso ativo.",
    "Revise apenas os resumos feitos na semana.",
    "Confie no seu preparo e descanse bem."
  ]
};

const ERROR_TYPE_FOCUS: Record<ErrorType, string> = {
  desconhecimento: "Estudo teórico aprofundado",
  confusao: "Diferenciação de conceitos",
  interpretacao: "Leitura e interpretação",
  distracao: "Concentração e atenção"
};

function generateStudyPlan(username: string): DayPlan[] {
  const errorStats = getErrorStats(username);
  const userStats = getUserStats(username);
  const quizData = getQuizData();
  
  // Get disciplinas with most errors
  const disciplinaErrors: Record<string, number> = {};
  for (const error of errorStats.recentErrors) {
    if (error.disciplina) {
      disciplinaErrors[error.disciplina] = (disciplinaErrors[error.disciplina] || 0) + 1;
    }
  }
  
  // Sort disciplinas by error count
  const sortedDisciplinas = Object.entries(disciplinaErrors)
    .sort((a, b) => b[1] - a[1])
    .map(([d]) => d);
  
  // Get most common error type
  const errorTypes = errorStats.errorTypeCounts;
  const dominantErrorType = (Object.entries(errorTypes)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "desconhecimento") as ErrorType;
  
  // Calculate recommended questions per day based on performance
  const accuracy = userStats.totalQuestionsAnswered > 0
    ? userStats.totalCorrect / userStats.totalQuestionsAnswered
    : 0.5;
  const baseQuestions = accuracy < 0.5 ? 10 : accuracy < 0.7 ? 15 : 20;
  
  // Load saved progress
  const savedProgress = localStorage.getItem(STUDY_PLAN_KEY);
  const completedDays: number[] = savedProgress ? JSON.parse(savedProgress) : [];
  
  // Load saved tasks
  const savedTasks = localStorage.getItem(STUDY_PLAN_TASKS_KEY);
  const taskProgress: Record<string, boolean> = savedTasks ? JSON.parse(savedTasks) : {};
  
  // Load questions progress
  const savedQuestions = localStorage.getItem(STUDY_PLAN_QUESTIONS_KEY);
  const questionsProgress: Record<number, number> = savedQuestions ? JSON.parse(savedQuestions) : {};
  
  const plan: DayPlan[] = [];
  
  for (let day = 1; day <= 7; day++) {
    const dayDisciplinas = sortedDisciplinas.slice(
      (day - 1) % sortedDisciplinas.length,
      ((day - 1) % sortedDisciplinas.length) + 2
    ).filter(Boolean);
    
    if (dayDisciplinas.length === 0 && sortedDisciplinas.length > 0) {
      dayDisciplinas.push(sortedDisciplinas[0]);
    }
    
    const focuses: Record<number, string> = {
      1: "Diagnóstico e revisão inicial",
      2: "Foco nas disciplinas mais fracas",
      3: "Correção de confusões conceituais",
      4: "Treino de interpretação",
      5: "Simulado cronometrado",
      6: "Revisão intensiva",
      7: "Consolidação e descanso"
    };
    
    const titles: Record<number, string> = {
      1: "Início da Jornada",
      2: "Fortalecendo Bases",
      3: "Clareza Conceitual",
      4: "Interpretação Afiada",
      5: "Simulado Real",
      6: "Revisão Final",
      7: "Consolidação"
    };
    
    // Generate specific exercises and tasks
    const exercises: string[] = [];
    const tasks: DayTask[] = [];
    
    if (dayDisciplinas.length > 0) {
      const exerciseText = `Resolver ${baseQuestions} questões de ${dayDisciplinas[0] || "conteúdo geral"}`;
      exercises.push(exerciseText);
      tasks.push({
        id: `day${day}_quest`,
        text: exerciseText,
        completed: taskProgress[`day${day}_quest`] || false
      });
    }
    
    if (day === 3 && dominantErrorType === "confusao") {
      const text = "Criar quadro comparativo de conceitos similares";
      exercises.push(text);
      tasks.push({ id: `day${day}_compare`, text, completed: taskProgress[`day${day}_compare`] || false });
    }
    
    if (day === 4) {
      const text = "Praticar sublinhando palavras-chave em 5 enunciados";
      exercises.push(text);
      tasks.push({ id: `day${day}_underline`, text, completed: taskProgress[`day${day}_underline`] || false });
    }
    
    if (day === 5) {
      const text = "Fazer simulado de 20 questões em 40 minutos";
      exercises.push(text);
      tasks.push({ id: `day${day}_simul`, text, completed: taskProgress[`day${day}_simul`] || false });
    }
    
    if (day <= 4 && errorStats.totalErrors > 5) {
      const text = "Refazer 3 questões que errou anteriormente";
      exercises.push(text);
      tasks.push({ id: `day${day}_redo`, text, completed: taskProgress[`day${day}_redo`] || false });
    }
    
    // Add review tips as tasks
    tasks.push({
      id: `day${day}_review`,
      text: "Revisar resumos e anotações do dia",
      completed: taskProgress[`day${day}_review`] || false
    });
    
    plan.push({
      day,
      title: titles[day],
      focus: focuses[day],
      disciplinas: dayDisciplinas.length > 0 ? dayDisciplinas : ["Revisão Geral"],
      questionsToReview: day === 7 ? Math.floor(baseQuestions / 2) : baseQuestions,
      questionsCompleted: questionsProgress[day] || 0,
      tips: DAILY_TIPS[day],
      exercises,
      completed: completedDays.includes(day),
      tasks
    });
  }
  
  return plan;
}

function PlanoEstudoPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [studyPlan, setStudyPlan] = useState<DayPlan[]>([]);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [hasNewPlan, setHasNewPlan] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  
  useEffect(() => {
    if (user?.username) {
      const plan = generateStudyPlan(user.username);
      setStudyPlan(plan);
      
      // Find first incomplete day
      const firstIncomplete = plan.find(d => !d.completed);
      if (firstIncomplete) {
        setActiveDay(firstIncomplete.day);
        setExpandedDay(firstIncomplete.day);
      } else {
        setActiveDay(1);
        setExpandedDay(1);
      }
      
      // Check if there's a new plan (based on recent errors)
      const lastGenerated = localStorage.getItem(STUDY_PLAN_GENERATED_KEY);
      const errorStats = getErrorStats(user.username);
      if (lastGenerated && errorStats.totalErrors > 0) {
        const lastDate = new Date(lastGenerated);
        const recentErrors = errorStats.recentErrors.filter(
          e => new Date(e.timestamp) > lastDate
        );
        setHasNewPlan(recentErrors.length >= 3);
      }
      
      // Update generated timestamp
      localStorage.setItem(STUDY_PLAN_GENERATED_KEY, new Date().toISOString());
    }
  }, [user]);
  
  const toggleDayComplete = (day: number) => {
    setStudyPlan(prev => {
      const newPlan = prev.map(d => 
        d.day === day ? { ...d, completed: !d.completed } : d
      );
      
      // Save progress
      const completedDays = newPlan.filter(d => d.completed).map(d => d.day);
      localStorage.setItem(STUDY_PLAN_KEY, JSON.stringify(completedDays));
      
      return newPlan;
    });
  };
  
  const toggleTask = (dayNum: number, taskId: string) => {
    setStudyPlan(prev => {
      const newPlan = prev.map(d => {
        if (d.day === dayNum) {
          return {
            ...d,
            tasks: d.tasks.map(t => 
              t.id === taskId ? { ...t, completed: !t.completed } : t
            )
          };
        }
        return d;
      });
      
      // Save task progress
      const taskProgress: Record<string, boolean> = {};
      newPlan.forEach(d => {
        d.tasks.forEach(t => {
          taskProgress[t.id] = t.completed;
        });
      });
      localStorage.setItem(STUDY_PLAN_TASKS_KEY, JSON.stringify(taskProgress));
      
      return newPlan;
    });
  };
  
  const incrementQuestions = (dayNum: number) => {
    setStudyPlan(prev => {
      const newPlan = prev.map(d => {
        if (d.day === dayNum && d.questionsCompleted < d.questionsToReview) {
          return { ...d, questionsCompleted: d.questionsCompleted + 1 };
        }
        return d;
      });
      
      // Save questions progress
      const questionsProgress: Record<number, number> = {};
      newPlan.forEach(d => {
        questionsProgress[d.day] = d.questionsCompleted;
      });
      localStorage.setItem(STUDY_PLAN_QUESTIONS_KEY, JSON.stringify(questionsProgress));
      
      return newPlan;
    });
  };
  
  const startDaySimulado = (day: DayPlan) => {
    // Navigate to home with filter params if disciplines exist
    if (day.disciplinas.length > 0 && day.disciplinas[0] !== "Revisão Geral") {
      navigate(`/?disciplina=${encodeURIComponent(day.disciplinas[0])}`);
    } else {
      navigate("/");
    }
  };
  
  const completedCount = studyPlan.filter(d => d.completed).length;
  const progressPercent = Math.round((completedCount / 7) * 100);
  
  const getDayEmoji = (day: number) => {
    const emojis: Record<number, string> = {
      1: "🚀", 2: "💪", 3: "🧠", 4: "📖", 5: "⏱️", 6: "🔥", 7: "🏆"
    };
    return emojis[day] || "📚";
  };
  
  const getCurrentDayPlan = () => studyPlan.find(d => d.day === activeDay);
  
  return (
    <div className="min-h-screen bg-[#070b14] text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
      
      <AppHeader />
      
      <main className="relative z-10 max-w-4xl mx-auto p-4 md:p-6 pb-20">
        {/* Header */}
        <div className="mb-6 animate-slide-in-up">
          <Link href="/dashboard">
            <a className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar ao Dashboard
            </a>
          </Link>
          
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  📅 Plano de Estudo Personalizado
                </span>
              </h1>
              <p className="text-gray-400">
                7 dias focados nas suas maiores dificuldades
              </p>
            </div>
            
            {/* New Plan Badge */}
            {hasNewPlan && (
              <div className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-xl animate-pulse">
                <span className="text-orange-400 font-semibold text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  Novo plano disponível!
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Current Day Hero Card */}
        {getCurrentDayPlan() && !getCurrentDayPlan()?.completed && (
          <div 
            className="glass-card rounded-2xl p-6 mb-6 border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 animate-slide-in-up"
            style={{ animationDelay: "0.05s" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/30">
                  {getDayEmoji(activeDay)}
                </div>
                <div>
                  <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wide">Próximo Passo</p>
                  <h2 className="text-2xl font-bold text-white">Dia {activeDay}: {getCurrentDayPlan()?.title}</h2>
                  <p className="text-gray-400 text-sm">{getCurrentDayPlan()?.focus}</p>
                </div>
              </div>
            </div>
            
            {/* Quick Progress */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="glass-card rounded-xl p-3 bg-white/5">
                <p className="text-xs text-gray-500 mb-1">Questões do Dia</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-emerald-400">
                    {getCurrentDayPlan()?.questionsCompleted}/{getCurrentDayPlan()?.questionsToReview}
                  </span>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ 
                        width: `${((getCurrentDayPlan()?.questionsCompleted || 0) / (getCurrentDayPlan()?.questionsToReview || 1)) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="glass-card rounded-xl p-3 bg-white/5">
                <p className="text-xs text-gray-500 mb-1">Tarefas Completas</p>
                <span className="text-xl font-bold text-cyan-400">
                  {getCurrentDayPlan()?.tasks.filter(t => t.completed).length}/{getCurrentDayPlan()?.tasks.length}
                </span>
              </div>
            </div>
            
            {/* Disciplines */}
            <div className="flex flex-wrap gap-2 mb-4">
              {getCurrentDayPlan()?.disciplinas.map((d, i) => (
                <span key={i} className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium">
                  {d}
                </span>
              ))}
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => startDaySimulado(getCurrentDayPlan()!)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-bold text-lg hover:scale-[1.02] transition-all shadow-lg shadow-emerald-500/25"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Começar Dia {activeDay}
              </button>
              <button
                onClick={() => setExpandedDay(expandedDay === activeDay ? null : activeDay)}
                className="px-6 py-4 glass-card rounded-xl font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Ver Checklist
              </button>
            </div>
          </div>
        )}
        
        {/* Progress Card */}
        <div className="glass-card rounded-2xl p-5 mb-6 animate-slide-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">Progresso da Semana</h3>
            <span className="text-emerald-400 font-bold">{completedCount}/7 dias</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {completedCount === 7 && (
            <p className="text-emerald-400 text-sm mt-3 text-center font-semibold">
              🎉 Parabéns! Você completou o plano de estudos!
            </p>
          )}
        </div>
        
        {/* Study Plan Cards */}
        <div className="space-y-3">
          {studyPlan.map((day, index) => {
            const isActive = day.day === activeDay && !day.completed;
            const tasksCompleted = day.tasks.filter(t => t.completed).length;
            const questionsPercent = (day.questionsCompleted / day.questionsToReview) * 100;
            
            return (
              <div 
                key={day.day}
                className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 animate-slide-in-up ${
                  day.completed 
                    ? "ring-2 ring-emerald-500/50 opacity-80" 
                    : isActive 
                      ? "ring-2 ring-cyan-500/50" 
                      : ""
                }`}
                style={{ animationDelay: `${0.1 + index * 0.04}s` }}
              >
                {/* Day Header */}
                <button
                  onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                      day.completed 
                        ? "bg-emerald-500/20" 
                        : isActive
                          ? "bg-gradient-to-br from-emerald-500/30 to-cyan-500/30"
                          : "bg-white/5"
                    }`}>
                      {day.completed ? "✅" : getDayEmoji(day.day)}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">Dia {day.day}: {day.title}</h3>
                        {isActive && (
                          <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full font-medium">
                            Atual
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{day.focus}</p>
                      {/* Mini progress indicators */}
                      {!day.completed && (
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">
                            📝 {tasksCompleted}/{day.tasks.length}
                          </span>
                          <span className="text-xs text-gray-500">
                            🎯 {day.questionsCompleted}/{day.questionsToReview}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedDay === day.day ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Expanded Content */}
                {expandedDay === day.day && (
                  <div className="px-4 pb-4 border-t border-white/10 animate-slide-in-up">
                    {/* Disciplinas */}
                    <div className="pt-4 mb-4">
                      <p className="text-xs text-gray-500 mb-2">Disciplinas do dia:</p>
                      <div className="flex flex-wrap gap-2">
                        {day.disciplinas.map((d, i) => (
                          <span key={i} className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Questions Progress */}
                    <div className="glass-card rounded-xl p-4 mb-4 border border-emerald-500/20 bg-emerald-500/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🎯</span>
                          <div>
                            <p className="text-sm text-gray-400">Progresso de questões:</p>
                            <p className="text-xl font-bold text-emerald-400">
                              {day.questionsCompleted}/{day.questionsToReview} questões
                            </p>
                          </div>
                        </div>
                        {!day.completed && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              incrementQuestions(day.day);
                            }}
                            disabled={day.questionsCompleted >= day.questionsToReview}
                            className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                          >
                            +1 Questão
                          </button>
                        )}
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all"
                          style={{ width: `${questionsPercent}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Task Checklist */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Checklist do dia:</p>
                      <div className="space-y-2">
                        {day.tasks.map((task) => (
                          <button
                            key={task.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTask(day.day, task.id);
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                              task.completed 
                                ? "bg-emerald-500/10 line-through text-gray-500" 
                                : "bg-white/5 hover:bg-white/10 text-gray-300"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                              task.completed 
                                ? "bg-emerald-500 border-emerald-500" 
                                : "border-gray-500"
                            }`}>
                              {task.completed && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm">{task.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Tips */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Dicas para hoje:</p>
                      <ul className="space-y-2">
                        {day.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                            <span className="text-cyan-400">💡</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      {!day.completed && (
                        <button
                          onClick={() => startDaySimulado(day)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold hover:scale-[1.02] transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Iniciar Simulado com Temas do Dia
                        </button>
                      )}
                      <button
                        onClick={() => toggleDayComplete(day.day)}
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                          day.completed
                            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            : "bg-white/5 text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        {day.completed ? "✅ Concluído - Desmarcar" : "Marcar como Concluído"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <Link href="/">
            <a className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-all shadow-xl shadow-orange-500/25">
              🚀 Praticar Livremente
            </a>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default PlanoEstudoPage;
