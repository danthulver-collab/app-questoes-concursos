import { useState, useEffect } from "react";
import { AppLayout } from "../components/app-layout";
import { useAuth } from "../lib/auth-context-supabase";
import { getUserPlan, getRemainingQuestions, getActiveConcursos, PLAN_LIMITS } from "../lib/access-control";
import { getQuizData, getUniqueConcursos } from "../lib/quiz-store";
import { Link, useLocation } from "wouter";
import { supabase } from "../lib/supabase";
import { 
  Sparkles, 
  Crown, 
  Zap, 
  TrendingUp,
  BookOpen,
  Target,
  Award,
  ArrowRight,
  Check,
  Star,
  Flame
} from "lucide-react";

export default function HomeNovo() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const userId = user?.email || user?.username || "";
  const userPlan = getUserPlan(userId) || "free";
  const remaining = getRemainingQuestions(userId);
  const activeConcursos = getActiveConcursos(userId);
  const [activePedido, setActivePedido] = useState<any>(null);

  // Pega dados reais do quiz
  const quizData = getQuizData();
  const realConcursos = getUniqueConcursos(quizData.questions);
  
  // Buscar pedido ativo
  useEffect(() => {
    if (!user?.email) return;
    
    const checkPedido = async () => {
      try {
        const { data: allPedidos } = await supabase
          .from('plan_requests')
          .select('*')
          .eq('email', user.email)
          .order('created_at', { ascending: false});
        
        console.log('📦 [HOME-NOVO] Pedidos:', allPedidos?.length || 0, allPedidos);
        
        if (allPedidos && allPedidos.length > 0) {
          const pedidoAtivo = allPedidos.find(p => p.status !== 'pronto' && p.status !== 'cancelado');
          setActivePedido(pedidoAtivo || null);
          console.log('✅ [HOME-NOVO] Card:', pedidoAtivo ? 'ATIVADO' : 'OCULTO');
        }
      } catch (e) {
        console.error('[HOME-NOVO] Erro:', e);
      }
    };
    
    checkPedido();
    const interval = setInterval(checkPedido, 3000);
    return () => clearInterval(interval);
  }, [user?.email]);

  // Ler metricas reais do usuario
  const metricas = JSON.parse(localStorage.getItem(`metricas_${userId}`) || '{"total": 0, "acertos": 0}');
  const userStats = {
    totalQuestions: metricas.total || 0,
    accuracy: metricas.total > 0 ? Math.round((metricas.acertos / metricas.total) * 100) : 0,
    streak: 0,
    weeklyProgress: 0,
  };

  // Concursos reais do sistema
  const concursos = realConcursos.slice(0, 8).map((nome, index) => {
    const colors = [
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-pink-500", 
      "from-orange-500 to-red-500",
      "from-green-500 to-emerald-500",
      "from-indigo-500 to-purple-500",
      "from-rose-500 to-pink-500",
      "from-amber-500 to-yellow-500",
      "from-teal-500 to-cyan-500"
    ];
    const icons = ["⚖️", "📝", "🎓", "📚", "🏛️", "⚡", "🎯", "📖"];
    
    const questoesCount = quizData.questions.filter(q => q.concurso === nome).length;
    
    return {
      name: nome,
      color: colors[index % colors.length],
      icon: icons[index % icons.length],
      questions: questoesCount
    };
  });

  const subjects = [
    { name: "Direito Constitucional", icon: "📜", color: "blue", progress: 75 },
    { name: "Direito Administrativo", icon: "🏛️", color: "red", progress: 60 },
    { name: "Informática", icon: "💻", color: "cyan", progress: 85 },
    { name: "Português", icon: "📖", color: "indigo", progress: 70 },
    { name: "Matemática", icon: "🔢", color: "green", progress: 50 },
    { name: "Direito Penal", icon: "⚖️", color: "purple", progress: 65 },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Hero Section with Stats */}
        <div className="relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-12">
            {/* Welcome & Quick Stats */}
            <div className="mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
                Pronto para estudar, {user?.nome?.split(' ')[0] || user?.username}? 🚀
              </h1>
              <p className="text-xl text-gray-400">
                Continue sua jornada rumo à aprovação
              </p>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              <div className="group glass-card rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 hover:scale-105 transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">{remaining === Infinity ? "∞" : remaining}</span>
                </div>
                <p className="text-sm text-gray-400">Questões Hoje</p>
              </div>

              <div className="group glass-card rounded-2xl p-6 border border-white/10 hover:border-emerald-500/50 hover:scale-105 transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">{userStats.accuracy}%</span>
                </div>
                <p className="text-sm text-gray-400">Taxa de Acerto</p>
              </div>

              <div className="group glass-card rounded-2xl p-6 border border-white/10 hover:border-red-500/50 hover:scale-105 transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Flame className="w-5 h-5 text-red-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">{userStats.streak}🔥</span>
                </div>
                <p className="text-sm text-gray-400">Dias Seguidos</p>
              </div>

              <div className="group glass-card rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 hover:scale-105 transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Award className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">{userStats.totalQuestions}</span>
                </div>
                <p className="text-sm text-gray-400">Total Respondidas</p>
              </div>
            </div>

            {/* Cards: Comece as questões + Pedido em andamento */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Big CTA Button - Comece as questões aqui */}
              <Link href="/questoes/escolher">
                <div className="glass-card rounded-3xl p-8 md:p-10 cursor-pointer group hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-orange-500/20 to-amber-500/10 border-2 border-orange-500/30 hover:border-orange-500/60 shadow-2xl shadow-orange-500/20">
                  <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-4xl shadow-xl shadow-orange-500/40 group-hover:scale-110 transition-transform">
                      📚
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white group-hover:text-orange-400 transition-colors">
                      📚 COMECE AS QUESTÕES AQUI 📚
                    </h2>
                    <p className="text-gray-400 text-lg">
                      Pratique com questões de concursos e melhore seu desempenho
                    </p>
                    <div className="flex items-center gap-2 text-orange-400 font-semibold text-xl">
                      <span>Iniciar</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
              
              {/* Card Pedido em Produção */}
              {activePedido && (
                <div className="glass-card rounded-3xl p-8 md:p-10 bg-gradient-to-br from-blue-500/20 to-purple-500/10 border-2 border-blue-500/40 shadow-2xl shadow-blue-500/20 animate-slide-in-up">
                  <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-4xl shadow-xl shadow-blue-500/40 animate-pulse">
                      {activePedido.status === 'em_andamento' ? '🔨' : '⏳'}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white">
                      {activePedido.status === 'em_andamento' ? '🔨 Seu Pacote em Produção!' : '⏳ Pedido Aguardando'}
                    </h2>
                    <p className="text-gray-300 text-base">
                      {activePedido.status === 'em_andamento' 
                        ? 'Estamos montando seu pacote personalizado!'
                        : 'Seu pedido foi recebido com sucesso'}
                    </p>
                    <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-gray-400 text-sm">
                        ⏰ Prazo: <span className="text-white font-bold">até 7 dias úteis</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setLocation('/acompanhar-pedido')}
                      className="mt-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 rounded-2xl text-white font-bold text-xl shadow-2xl shadow-blue-500/40 transition-all active:scale-95 hover:scale-105 flex items-center gap-3"
                    >
                      <span className="text-3xl">👁️</span>
                      <span>Acompanhar Pedido</span>
                    </button>
                    <div className={`px-5 py-2 rounded-full text-base font-bold shadow-lg ${
                      activePedido.status === 'em_andamento' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {activePedido.status === 'em_andamento' ? '🔨 Em Produção' : '⏳ Aguardando'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-12 space-y-12">
          {/* Upgrade Banner (if free) */}
          {userPlan === "free" && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-700 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative glass-card rounded-3xl p-8 lg:p-12 border border-blue-500/30 bg-gradient-to-br from-blue-900/40 via-blue-800/40 to-blue-700/40 overflow-hidden backdrop-blur-xl">
                {/* Animated particles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-600/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" />
                
                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-500/50">
                        <Crown className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-lg">
                          🔥 OFERTA ESPECIAL
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-3xl lg:text-4xl font-bold text-white mb-3 drop-shadow-lg">
                      Desbloqueie o Plano Plus!
                    </h3>
                    <p className="text-lg text-white/90 mb-6 drop-shadow">
                      Questões ilimitadas, Chat IA, comentários completos e muito mais por apenas <span className="text-2xl font-bold text-white drop-shadow-lg">R$ 197</span>
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {[
                        "✨ Questões Ilimitadas",
                        "🤖 Chat IA Integrado",
                        "💬 Comentários Completos",
                        "📊 Estatísticas Avançadas"
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-white drop-shadow">
                          <Check className="w-5 h-5 text-emerald-400 drop-shadow-lg" />
                          <span className="text-sm font-semibold">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Link href="/planos">
                      <a className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl font-bold text-white text-lg hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 transition-all shadow-xl">
                        Fazer Upgrade Agora
                        <ArrowRight className="w-5 h-5" />
                      </a>
                    </Link>
                  </div>

                  {/* Visual Element */}
                  <div className="hidden lg:block">
                    <div className="relative w-48 h-48">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl rotate-6 opacity-30 animate-pulse" />
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl -rotate-6 opacity-30 animate-pulse delay-500" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Star className="w-24 h-24 text-blue-300 animate-spin-slow drop-shadow-2xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Concursos Selection */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Escolha seu Concurso</h2>
                <p className="text-gray-300">Selecione e comece a praticar agora</p>
              </div>
              <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300">
                {concursos.length} disponíveis
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {concursos.map((concurso, index) => (
                <Link key={index} href={`/?concurso=${encodeURIComponent(concurso.name)}&autostart=true`}>
                  <div className="group glass-card rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all hover:scale-105 hover:shadow-2xl relative overflow-hidden cursor-pointer">
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${concurso.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${concurso.color} flex items-center justify-center text-2xl shadow-lg`}>
                          {concurso.icon}
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400">
                        {concurso.name}
                      </h3>
                      
                      <p className="text-sm text-gray-400">
                        {concurso.questions} questões disponíveis
                      </p>

                      {/* Progress Bar */}
                      <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${concurso.color} rounded-full`} style={{ width: '60%' }} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Matérias/Subjects */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Estude por Matéria</h2>
                <p className="text-gray-400">Foque nas disciplinas que mais precisa</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject, index) => (
                <Link key={index} href={`/?disciplina=${encodeURIComponent(subject.name)}&autostart=true`}>
                  <div className="group glass-card rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all hover:scale-105 cursor-pointer">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-${subject.color}-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                        {subject.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-1 group-hover:text-${subject.color}-400 transition-colors">{subject.name}</h3>
                        <p className="text-sm text-gray-400">{subject.progress}% completo</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r from-${subject.color}-500 to-${subject.color}-400 rounded-full transition-all group-hover:h-3`}
                        style={{ width: `${subject.progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Weekly Progress Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card rounded-2xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Seu Progresso</h2>
                  <p className="text-gray-400">Últimos 7 dias</p>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-bold">+12% esta semana</span>
                </div>
              </div>

              {/* Simple Bar Chart */}
              <div className="flex items-end justify-between gap-3 h-48">
                {[65, 78, 82, 75, 88, 92, 85].map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full relative group">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="px-2 py-1 bg-slate-800 rounded text-xs font-bold text-white">
                          {value}%
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-t-xl overflow-hidden">
                        <div 
                          className="bg-gradient-to-t from-orange-500 to-amber-500 rounded-t-xl transition-all hover:from-orange-400 hover:to-amber-400"
                          style={{ height: `${value * 2}px` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {["D", "S", "T", "Q", "Q", "S", "S"][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <Link href="/">
                <a className="block glass-card rounded-2xl p-6 border border-white/10 hover:border-orange-500/50 hover:scale-105 transition-all group">
                  <Zap className="w-8 h-8 text-orange-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-white mb-2">Modo Rápido</h3>
                  <p className="text-sm text-gray-400">Responda questões aleatórias</p>
                </a>
              </Link>

              <Link href="/dashboard">
                <a className="block glass-card rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 hover:scale-105 transition-all group">
                  <TrendingUp className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-white mb-2">Ver Estatísticas</h3>
                  <p className="text-sm text-gray-400">Acompanhe seu desempenho</p>
                </a>
              </Link>

              <Link href="/planos">
                <a className="block glass-card rounded-2xl p-6 border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:scale-105 transition-all group">
                  <Sparkles className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-white mb-2">Upgrade Plus</h3>
                  <p className="text-sm text-gray-400">Acesso ilimitado</p>
                </a>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Botão WhatsApp Fixo */}
        <a
          href="https://wa.me/5521980645070?text=Olá!%20Vim%20do%20site%20Só%20Questões"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/40 rounded-full blur-xl animate-pulse"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-3xl shadow-2xl shadow-green-500/50 hover:scale-110 active:scale-95 transition-all cursor-pointer ring-4 ring-green-400/20">
              <span className="group-hover:scale-125 transition-transform">💬</span>
            </div>
          </div>
          <div className="absolute -top-12 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap shadow-lg">
            Fale Conosco!
          </div>
        </a>
      </div>
    </AppLayout>
  );
}
