import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../lib/auth-context-supabase";
import { getUserStats, getAllUsersStats, getBadgeInfo, type UserStats } from "../lib/user-stats";
import { getQuizData } from "../lib/quiz-store";
import { AppHeader } from "../components/app-header";
import { getOnboardingData } from "./onboarding";
import { getUserPlan, getRemainingQuestions, PLAN_LIMITS, type PlanType } from "../lib/access-control";
import { monitorPaymentStatus } from "../lib/plan-upgrade";
import { supabase } from "../lib/supabase";

interface OnboardingData {
  concursoObjetivo: string;
  cargoDesejado: string;
  bancaOrganizadora: string;
  materias: string;
}

function DashboardPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [allUsers, setAllUsers] = useState<UserStats[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "disciplinas" | "history" | "ranking">("overview");
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [activePedido, setActivePedido] = useState<any>(null);
  
  // Plan-related state
  const [userPlan, setUserPlan] = useState<PlanType | null>(null);
  const [remainingQuestions, setRemainingQuestions] = useState<number>(PLAN_LIMITS.free.questionsPerDay);

  useEffect(() => {
    if (user?.username) {
      // Task 169: Use email first for Google login, then username for stats
      const userId = user.email || user.username;
      const userStats = getUserStats(userId);
      setStats(userStats);
      setAllUsers(getAllUsersStats());
      const quizData = getQuizData();
      setTotalQuestions(quizData.questions.length);
      setOnboardingData(getOnboardingData(userId));
      
      // Load plan info
      const plan = getUserPlan(userId) || "free";
      setUserPlan(plan);
      setRemainingQuestions(getRemainingQuestions(userId));
      
      // 🔥 Monitorar status de pagamento e fazer upgrade automático
      if (user.id && user.email) {
        monitorPaymentStatus(user.id, user.email).then(() => {
          // Recarrega plano após verificação
          const updatedPlan = getUserPlan(userId) || "free";
          setUserPlan(updatedPlan);
        });
        
        // Buscar pedido ativo do usuário
        supabase
          .from('plan_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
          .then(({ data }) => {
            if (data && data.status !== 'pronto' && data.status !== 'cancelado') {
              setActivePedido(data);
            }
          })
          .catch(() => {});
      }
    }
  }, [user]);

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  const accuracy = stats.totalQuestionsAnswered > 0
    ? Math.round((stats.totalCorrect / stats.totalQuestionsAnswered) * 100)
    : 0;

  const avgTimePerQuestion = stats.totalQuestionsAnswered > 0
    ? Math.round(stats.totalTimeSpent / stats.totalQuestionsAnswered)
    : 0;

  const userRank = allUsers.findIndex(u => u.username === stats.username) + 1;

  // Get last 7 days stats
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const dailyData = last7Days.map(date => ({
    date,
    label: new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' }),
    ...stats.dailyStats[date] || { answered: 0, correct: 0 }
  }));

  const maxDaily = Math.max(...dailyData.map(d => d.answered), 1);

  // Sort disciplinas by performance
  const disciplinaEntries = Object.entries(stats.disciplinaStats)
    .map(([name, data]) => ({
      name,
      ...data,
      accuracy: data.answered > 0 ? (data.correct / data.answered) * 100 : 0
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  const strongestDisciplinas = disciplinaEntries.filter(d => d.accuracy >= 60);
  const weakestDisciplinas = disciplinaEntries.filter(d => d.accuracy < 60).reverse();

  return (
    <div className="min-h-screen bg-[#070b14] text-white relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />
      
      <AppHeader showBack backUrl="/" title="Meu Perfil" />

      <main className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 relative z-10">
        {/* Cards principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Big CTA Button - Comece as questões aqui */}
          <Link href="/">
            <div className="glass-card rounded-3xl p-8 md:p-12 animate-slide-in-up cursor-pointer group hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-orange-500/20 to-amber-500/10 border-2 border-orange-500/30 hover:border-orange-500/60 shadow-2xl shadow-orange-500/20">
              <div className="flex flex-col items-center justify-center text-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-4xl shadow-xl shadow-orange-500/40 group-hover:scale-110 transition-transform">
                  📚
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white group-hover:text-orange-400 transition-colors">
                  Comece as questões aqui
                </h2>
                <p className="text-gray-400 text-lg max-w-md">
                  Pratique com questões de concursos e melhore seu desempenho
                </p>
                <div className="mt-2 flex items-center gap-2 text-orange-400 font-semibold">
                  <span>Iniciar agora</span>
                  <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
          
          {/* Card de Pedido em Andamento */}
          {activePedido && (
            <div className="glass-card rounded-3xl p-8 md:p-12 animate-slide-in-up bg-gradient-to-br from-blue-500/20 to-purple-500/10 border-2 border-blue-500/30 shadow-2xl shadow-blue-500/20">
              <div className="flex flex-col items-center justify-center text-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-4xl shadow-xl shadow-blue-500/40 animate-pulse">
                  {activePedido.status === 'em_andamento' ? '🔨' : '⏳'}
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white">
                  {activePedido.status === 'em_andamento' ? '🔨 Seu Pacote está em Produção!' : 
                   activePedido.status === 'pronto' ? '🎉 Seu Pacote foi Entregue!' :
                   '⏳ Pedido Recebido!'}
                </h2>
                <p className="text-gray-300 text-base max-w-md">
                  {activePedido.status === 'em_andamento' 
                    ? 'Estamos montando seu pacote personalizado. Em breve estará pronto!'
                    : activePedido.status === 'pronto'
                    ? 'Seu pacote está pronto! Acesse agora e comece a estudar.'
                    : 'Seu pedido foi recebido. Aguarde enquanto preparamos tudo para você.'}
                </p>
                <button
                  onClick={() => setLocation('/acompanhar-pedido')}
                  className="mt-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 rounded-2xl text-white font-bold text-xl shadow-2xl shadow-blue-500/40 transition-all active:scale-95 hover:scale-105 flex items-center gap-3"
                >
                  <span className="text-3xl">👁️</span>
                  <span>Acompanhar Pedido</span>
                </button>
                <div className={`mt-3 px-5 py-2.5 rounded-full text-base font-bold shadow-lg ${
                  activePedido.status === 'em_andamento' 
                    ? 'bg-blue-500 text-white shadow-blue-500/30' 
                    : activePedido.status === 'pronto'
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                    : 'bg-amber-500 text-white shadow-amber-500/30'
                }`}>
                  {activePedido.status === 'em_andamento' ? '🔨 Em Produção' : 
                   activePedido.status === 'pronto' ? '✅ Entregue' :
                   '⏳ Aguardando'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Header */}
        <div className="glass-card rounded-3xl p-6 md:p-8 mb-6 animate-slide-in-up">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-4xl font-bold shadow-xl shadow-orange-500/30">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                user?.username?.charAt(0).toUpperCase() || "U"
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{user?.username}</h1>
              <p className="text-gray-400">
                {user?.provider === "google" && "🔵 Conectado via Google"}
                {user?.provider === "facebook" && "🔵 Conectado via Facebook"}
                {(!user?.provider || user?.provider === "local") && "🔐 Conta local"}
              </p>
              {userRank > 0 && (
                <p className="text-orange-400 font-semibold mt-2">
                  🏅 #{userRank} no ranking geral
                </p>
              )}
              {/* Plan Badge */}
              <div className="mt-3 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${
                  userPlan === "plus" 
                    ? "bg-amber-500/20 text-amber-400" 
                    : userPlan === "individual"
                    ? "bg-orange-500/20 text-orange-400"
                    : "bg-emerald-500/20 text-emerald-400"
                }`}>
                  {userPlan === "plus" ? "✨ Plano Plus" : userPlan === "individual" ? "⭐ Plano Individual" : "🆓 Plano Grátis"}
                </span>
                {userPlan === "free" || !userPlan ? (
                  <Link href="/planos" className="text-xs text-orange-400 hover:text-orange-300 underline">
                    Fazer Upgrade
                  </Link>
                ) : null}
              </div>
            </div>

            {/* Badges */}
            {stats.badges.length > 0 && (
              <div className="flex-1 flex flex-wrap justify-center md:justify-end gap-2">
                {stats.badges.slice(0, 6).map(badge => {
                  const info = getBadgeInfo(badge);
                  return (
                    <div
                      key={badge}
                      className="group relative px-3 py-2 bg-white/5 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors cursor-default"
                      title={info.description}
                    >
                      <span className="text-xl">{info.emoji}</span>
                      <span className="text-sm font-medium hidden sm:inline">{info.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Meu Objetivo Section */}
        {onboardingData && (
          <div className="glass-card rounded-2xl p-6 mb-6 animate-slide-in-up border border-orange-500/20 bg-gradient-to-r from-orange-500/5 to-amber-500/5" style={{ animationDelay: '25ms' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-2xl">
                  🎯
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Meu Objetivo</h3>
                  <p className="text-sm text-gray-400">Seu foco de estudos</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditGoal(!showEditGoal)}
                className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
              >
                ✏️ Editar
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">Concurso</div>
                <div className="font-semibold text-white">{onboardingData.concursoObjetivo}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">Cargo</div>
                <div className="font-semibold text-white">{onboardingData.cargoDesejado}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">Banca</div>
                <div className="font-semibold text-orange-400">{onboardingData.bancaOrganizadora}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">Matérias</div>
                <div className="font-semibold text-white text-sm leading-tight">
                  {onboardingData.materias.split(/[,\n]/).filter(m => m.trim()).slice(0, 3).join(', ')}
                  {onboardingData.materias.split(/[,\n]/).filter(m => m.trim()).length > 3 && '...'}
                </div>
              </div>
            </div>
            
            {showEditGoal && (
              <div className="mt-4 pt-4 border-t border-white/10 text-center">
                <p className="text-sm text-gray-400 mb-3">Para editar seu objetivo, refaça o onboarding:</p>
                <button 
                  onClick={() => {
                    if (user?.username) {
                      localStorage.removeItem(`quiz_user_onboarding_${user.username}`);
                      window.location.href = '/onboarding';
                    }
                  }}
                  className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm transition-colors"
                >
                  Refazer Onboarding
                </button>
              </div>
            )}
          </div>
        )}

        {/* Study Plan Banner */}
        <a 
          href="/plano-de-estudo"
          className="block glass-card rounded-2xl p-5 mb-6 animate-slide-in-up hover:scale-[1.01] transition-all border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5"
          style={{ animationDelay: '50ms' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center text-3xl">
                📅
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Plano de Estudo Personalizado</h3>
                <p className="text-sm text-gray-400">7 dias focados nas suas maiores dificuldades</p>
              </div>
            </div>
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>

        {/* Daily Limit Banner for Free Users */}
        {(userPlan === "free" || !userPlan) && (
          <div className="glass-card rounded-2xl p-5 mb-6 animate-slide-in-up border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5" style={{ animationDelay: '75ms' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <span className="text-2xl">⏰</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Limite Diário</span>
                    <span className={`text-2xl font-black ${remainingQuestions <= 3 ? 'text-red-400' : 'text-amber-400'}`}>
                      {remainingQuestions}/{PLAN_LIMITS.free.questionsPerDay}
                    </span>
                    <span className="text-gray-400">questões restantes</span>
                  </div>
                  <p className="text-sm text-gray-500">Renova em 24 horas</p>
                </div>
              </div>
              <Link 
                href="/planos" 
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-orange-500/20"
              >
                Questões Ilimitadas
              </Link>
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${remainingQuestions <= 3 ? 'bg-red-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}
                style={{ width: `${(remainingQuestions / PLAN_LIMITS.free.questionsPerDay) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-slide-in-up" style={{ animationDelay: '100ms' }}>
          <div className="glass-card rounded-2xl p-5 text-center group hover:scale-[1.02] transition-transform">
            <div className="text-4xl font-black text-orange-400">{stats.totalQuestionsAnswered}</div>
            <div className="text-sm text-gray-500 mt-1">Questões</div>
            <div className="text-xs text-gray-600 mt-2">de {totalQuestions} disponíveis</div>
          </div>
          <div className="glass-card rounded-2xl p-5 text-center group hover:scale-[1.02] transition-transform">
            <div className="text-4xl font-black text-emerald-400">{accuracy}%</div>
            <div className="text-sm text-gray-500 mt-1">Taxa de Acerto</div>
            <div className="text-xs text-gray-600 mt-2">{stats.totalCorrect} certas</div>
          </div>
          <div className="glass-card rounded-2xl p-5 text-center group hover:scale-[1.02] transition-transform">
            <div className="text-4xl font-black text-blue-400">{avgTimePerQuestion}s</div>
            <div className="text-sm text-gray-500 mt-1">Tempo Médio</div>
            <div className="text-xs text-gray-600 mt-2">por questão</div>
          </div>
          <div className="glass-card rounded-2xl p-5 text-center group hover:scale-[1.02] transition-transform">
            <div className="text-4xl font-black text-purple-400">{stats.quizHistory.length}</div>
            <div className="text-sm text-gray-500 mt-1">Simulados</div>
            <div className="text-xs text-gray-600 mt-2">realizados</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: "overview", label: "Visão Geral", icon: "📊" },
            { id: "disciplinas", label: "Disciplinas", icon: "📚" },
            { id: "history", label: "Histórico", icon: "📅" },
            { id: "ranking", label: "Ranking", icon: "🏆" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/30"
                  : "glass-card hover:bg-white/10 text-gray-400"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-slide-in-up" style={{ animationDelay: '200ms' }}>
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Chart */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-6">Atividade Semanal</h3>
                <div className="flex items-end justify-between h-40 gap-2">
                  {dailyData.map((day, i) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col items-center mb-2" style={{ height: '120px' }}>
                        <div 
                          className="w-full bg-gradient-to-t from-orange-500/50 to-orange-500/80 rounded-t-lg transition-all duration-500"
                          style={{ 
                            height: `${(day.answered / maxDaily) * 100}%`,
                            minHeight: day.answered > 0 ? '8px' : '0'
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 capitalize">{day.label}</span>
                      <span className="text-xs text-gray-600">{day.answered}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Correct vs Wrong Donut */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-6">Acertos vs Erros</h3>
                <div className="flex items-center justify-center gap-8">
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="rgba(239, 68, 68, 0.3)"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeDasharray={`${accuracy}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-black text-emerald-400">{accuracy}%</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-emerald-500" />
                      <div>
                        <div className="font-bold text-emerald-400">{stats.totalCorrect}</div>
                        <div className="text-xs text-gray-500">Acertos</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-red-500/50" />
                      <div>
                        <div className="font-bold text-red-400">{stats.totalQuestionsAnswered - stats.totalCorrect}</div>
                        <div className="text-xs text-gray-500">Erros</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strongest Disciplinas */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span>💪</span> Disciplinas Fortes
                </h3>
                <div className="space-y-3">
                  {strongestDisciplinas.slice(0, 4).map(d => (
                    <div key={d.name} className="flex items-center justify-between">
                      <span className="text-gray-300">{d.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${d.accuracy}%` }}
                          />
                        </div>
                        <span className="text-emerald-400 font-bold text-sm w-12 text-right">{Math.round(d.accuracy)}%</span>
                      </div>
                    </div>
                  ))}
                  {strongestDisciplinas.length === 0 && (
                    <p className="text-gray-500 text-sm">Responda mais questões para ver suas disciplinas fortes</p>
                  )}
                </div>
              </div>

              {/* Weakest Disciplinas */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span>📖</span> Disciplinas para Melhorar
                </h3>
                <div className="space-y-3">
                  {weakestDisciplinas.slice(0, 4).map(d => (
                    <div key={d.name} className="flex items-center justify-between">
                      <span className="text-gray-300">{d.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${d.accuracy}%` }}
                          />
                        </div>
                        <span className="text-amber-400 font-bold text-sm w-12 text-right">{Math.round(d.accuracy)}%</span>
                      </div>
                    </div>
                  ))}
                  {weakestDisciplinas.length === 0 && (
                    <p className="text-gray-500 text-sm">Continue praticando para identificar pontos de melhoria</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Disciplinas Tab */}
          {activeTab === "disciplinas" && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-6">Desempenho por Disciplina</h3>
              <div className="space-y-4">
                {disciplinaEntries.length > 0 ? disciplinaEntries.map(d => (
                  <div key={d.name} className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{d.name}</span>
                      <span className={`font-bold ${d.accuracy >= 70 ? 'text-emerald-400' : d.accuracy >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {Math.round(d.accuracy)}%
                      </span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-2">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          d.accuracy >= 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                          d.accuracy >= 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                          'bg-gradient-to-r from-red-500 to-pink-500'
                        }`}
                        style={{ width: `${d.accuracy}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{d.answered} questões respondidas</span>
                      <span>{d.correct} acertos</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-8">Responda questões para ver seu desempenho por disciplina</p>
                )}
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-6">Histórico de Simulados</h3>
              <div className="space-y-3">
                {stats.quizHistory.length > 0 ? stats.quizHistory.map(quiz => {
                  const quizAccuracy = Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100);
                  return (
                    <div key={quiz.id} className="p-4 bg-white/5 rounded-xl flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl ${
                        quizAccuracy >= 70 ? 'bg-emerald-500/20 text-emerald-400' :
                        quizAccuracy >= 50 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {quizAccuracy}%
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">
                            {quiz.correctAnswers}/{quiz.totalQuestions} questões
                          </span>
                          {quiz.concurso && (
                            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs">
                              {quiz.concurso}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(quiz.date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">{Math.round(quiz.timeSpent / 60)}min</div>
                        <div className="text-xs text-gray-500">tempo total</div>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-gray-500 text-center py-8">Nenhum simulado realizado ainda</p>
                )}
              </div>
            </div>
          )}

          {/* Ranking Tab */}
          {activeTab === "ranking" && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-6">Ranking de Alunos</h3>
              <div className="space-y-3">
                {allUsers.length > 0 ? allUsers.slice(0, 20).map((userStats, index) => {
                  const userAcc = userStats.totalQuestionsAnswered > 0
                    ? Math.round((userStats.totalCorrect / userStats.totalQuestionsAnswered) * 100)
                    : 0;
                  const isCurrentUser = userStats.username === stats.username;
                  return (
                    <div 
                      key={userStats.username} 
                      className={`p-4 rounded-xl flex items-center gap-4 ${
                        isCurrentUser ? 'bg-orange-500/20 border border-orange-500/30' : 'bg-white/5'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-amber-700 text-white' :
                        'bg-white/10 text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white flex items-center gap-2">
                          {userStats.username}
                          {isCurrentUser && <span className="text-orange-400 text-xs">(você)</span>}
                        </div>
                        <div className="text-sm text-gray-500">
                          {userStats.totalQuestionsAnswered} questões respondidas
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${
                          userAcc >= 70 ? 'text-emerald-400' :
                          userAcc >= 50 ? 'text-amber-400' :
                          'text-red-400'
                        }`}>
                          {userAcc}%
                        </div>
                        <div className="text-xs text-gray-500">acerto</div>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-gray-500 text-center py-8">Nenhum dado de ranking disponível ainda</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* All Badges Section */}
        <div className="mt-8 glass-card rounded-2xl p-6 animate-slide-in-up" style={{ animationDelay: '300ms' }}>
          <h3 className="font-bold text-lg mb-4">Todas as Conquistas</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {["iniciante", "estudante", "dedicado", "veterano", "mestre", "precisao", "expert", "consistente", "persistente", "perfeccionista", "impecavel"].map(badge => {
              const info = getBadgeInfo(badge);
              const unlocked = stats.badges.includes(badge);
              return (
                <div
                  key={badge}
                  className={`p-4 rounded-xl text-center transition-all ${
                    unlocked 
                      ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30' 
                      : 'bg-white/5 opacity-40'
                  }`}
                >
                  <div className={`text-3xl mb-2 ${unlocked ? '' : 'grayscale'}`}>{info.emoji}</div>
                  <div className={`font-medium text-sm ${unlocked ? 'text-white' : 'text-gray-500'}`}>{info.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{info.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
