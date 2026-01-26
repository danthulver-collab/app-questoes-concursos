import { AppLayout } from "../components/app-layout";
import { useAuth } from "../lib/auth-context-supabase";
import { getUserPlan, getRemainingQuestions, PLAN_LIMITS } from "../lib/access-control";
import { 
  TrendingUp, 
  Target, 
  Award, 
  BookOpen, 
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles
} from "lucide-react";

export default function DashboardNovo() {
  const { user } = useAuth();
  const userId = user?.email || user?.username || "";
  const userPlan = getUserPlan(userId) || "free";
  const remaining = getRemainingQuestions(userId);

  // Mock data - you can replace with real data from your store
  const stats = {
    totalQuestions: 127,
    correctAnswers: 89,
    wrongAnswers: 38,
    accuracy: 70,
    streak: 5,
    studyTime: "2h 34m",
    weekProgress: [45, 60, 55, 70, 65, 80, 75],
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
            Olá, {user?.nome || user?.username}! 👋
          </h1>
          <p className="text-gray-400">
            Veja seu progresso e continue estudando para alcançar seus objetivos
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Questions */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.totalQuestions}</h3>
            <p className="text-sm text-gray-400">Questões Respondidas</p>
          </div>

          {/* Accuracy */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full">
                +5%
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.accuracy}%</h3>
            <p className="text-sm text-gray-400">Taxa de Acerto</p>
          </div>

          {/* Streak */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-orange-400" />
              </div>
              <span className="text-2xl">🔥</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.streak}</h3>
            <p className="text-sm text-gray-400">Dias Seguidos</p>
          </div>

          {/* Study Time */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.studyTime}</h3>
            <p className="text-sm text-gray-400">Tempo de Estudo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Desempenho Semanal</h2>
                <p className="text-sm text-gray-400">Últimos 7 dias</p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-400">Acertos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-gray-400">Erros</span>
                </div>
              </div>
            </div>

            {/* Simple Bar Chart */}
            <div className="flex items-end justify-between gap-2 h-48">
              {stats.weekProgress.map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-white/10 rounded-t-lg overflow-hidden relative">
                    <div 
                      className="bg-gradient-to-t from-orange-500 to-amber-500 rounded-t-lg transition-all"
                      style={{ height: `${value * 2}px` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            {/* Continue Studying */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 bg-gradient-to-br from-orange-500/10 to-amber-500/10">
              <Sparkles className="w-8 h-8 text-orange-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Continue Estudando</h3>
              <p className="text-sm text-gray-400 mb-4">
                Você ainda tem {remaining === Infinity ? "∞" : remaining} questões disponíveis hoje
              </p>

            </div>

            {/* Performance Summary */}
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Resumo</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-400">Acertos</span>
                  </div>
                  <span className="text-sm font-bold text-white">{stats.correctAnswers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span className="text-sm text-gray-400">Erros</span>
                  </div>
                  <span className="text-sm font-bold text-white">{stats.wrongAnswers}</span>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-300">Total</span>
                    <span className="text-sm font-bold text-white">{stats.totalQuestions}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade CTA (if free plan) */}
        {userPlan === "free" && (
          <div className="glass-card rounded-2xl p-8 border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-amber-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Desbloqueie Todo o Potencial!
                  </h3>
                  <p className="text-gray-300">
                    Upgrade para o plano Plus e tenha acesso ilimitado a questões, chat IA, comentários e muito mais.
                  </p>
                </div>
              </div>
              <a 
                href="/planos"
                className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-bold text-white hover:scale-105 transition-transform"
              >
                Ver Planos →
              </a>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
