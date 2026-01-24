import { Link } from "wouter";
import { getTrialDaysRemaining } from "../lib/ai-credits-system";

interface TrialBadgeProps {
  userId: string;
  variant?: "full" | "compact";
}

export function TrialBadge({ userId, variant = "full" }: TrialBadgeProps) {
  const daysRemaining = getTrialDaysRemaining(userId);
  
  if (daysRemaining <= 0) {
    return null; // Trial expirado, não mostra
  }
  
  if (variant === "compact") {
    return (
      <Link href="/planos">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-full cursor-pointer hover:scale-105 transition-transform">
          <span className="text-lg">🎉</span>
          <span className="text-sm font-semibold text-emerald-400">
            Trial: {daysRemaining} dias restantes
          </span>
        </div>
      </Link>
    );
  }
  
  return (
    <div className="relative overflow-hidden glass-card rounded-2xl p-6 border-2 border-emerald-500/30 animate-fade-in">
      {/* Background decorativo */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
      
      <div className="relative z-10 flex items-start gap-4">
        <div className="flex-shrink-0">
          <span className="text-4xl">🎉</span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-emerald-400">
              Teste Grátis por 30 Dias
            </h3>
            <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-bold text-emerald-400">
              ATIVO
            </span>
          </div>
          
          <p className="text-gray-300 mb-3">
            Você tem acesso <span className="text-white font-semibold">TOTAL</span> a todas as funcionalidades! 
            Aproveite para testar tudo.
          </p>
          
          {/* Barra de progresso */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-400">Tempo restante</span>
              <span className="font-bold text-emerald-400">{daysRemaining} dias</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${(daysRemaining / 30) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <span>✅</span>
              <span>Todos os concursos</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <span>✅</span>
              <span>50 questões/dia</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <span>✅</span>
              <span>Chat IA (3/dia)</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <span>✅</span>
              <span>Estatísticas avançadas</span>
            </div>
          </div>
        </div>
        
        <Link href="/planos">
          <button className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-xl font-bold text-white transition-all hover:scale-105 shadow-lg shadow-emerald-500/20">
            Ver Planos
          </button>
        </Link>
      </div>
      
      {/* Aviso se estiver terminando */}
      {daysRemaining <= 7 && (
        <div className="relative z-10 mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <p className="text-sm text-amber-400">
              <span className="font-bold">Seu trial termina em breve!</span> Escolha um plano para não perder acesso.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
