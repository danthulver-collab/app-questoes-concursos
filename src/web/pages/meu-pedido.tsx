import { useState, useEffect } from "react";
import { useSearch, Link, useLocation } from "wouter";
import { AppHeader } from "../components/app-header";
import { useAuth } from "../lib/auth-context-supabase";
import { 
  getActiveUserRequest, 
  getUserRequests, 
  getStatusLabel, 
  getStatusColor, 
  getStatusIcon,
  type PlanRequest 
} from "../lib/plan-requests";
import { CheckCircle, Clock, Package, Sparkles, AlertTriangle, XCircle } from "lucide-react";

export default function MeuPedidoPage() {
  const { user } = useAuth();
  const search = useSearch();
  const [, setLocation] = useLocation();
  const [request, setRequest] = useState<PlanRequest | null>(null);
  const [allRequests, setAllRequests] = useState<PlanRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const urlParams = new URLSearchParams(search);
  const requestId = urlParams.get('id');

  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }

    const userId = user.email || user.username;
    
    // Se tem ID específico, carrega ele
    if (requestId) {
      const req = getUserRequests(userId).find(r => r.id === requestId);
      if (req) {
        setRequest(req);
      }
    } else {
      // Senão, pega o pedido ativo
      const activeReq = getActiveUserRequest(userId);
      setRequest(activeReq);
    }

    // Carregar todos os pedidos do usuário
    const all = getUserRequests(userId);
    setAllRequests(all);
    
    setLoading(false);
  }, [user, requestId, setLocation]);

  // Auto-refresh a cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        const userId = user.email || user.username;
        const activeReq = getActiveUserRequest(userId);
        setRequest(activeReq);
        
        const all = getUserRequests(userId);
        setAllRequests(all);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não tem pedido ativo
  if (!request && allRequests.length === 0) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-50" />
        <AppHeader showAdmin />

        <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-md w-full text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-500/20 flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Nenhuma Solicitação Encontrada</h1>
            <p className="text-gray-400 mb-6">
              Você ainda não fez nenhuma solicitação de plano pago.
            </p>
            <Link href="/planos">
              <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-bold hover:scale-105 transition-all">
                Ver Planos Disponíveis
              </button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const getProgressSteps = (req: PlanRequest) => {
    const baseSteps = [
      { 
        id: "created", 
        label: "Solicitação Criada", 
        icon: "📝",
        completed: true,
        active: req.status === "aguardando_pagamento"
      },
      { 
        id: "payment", 
        label: "Pagamento", 
        icon: "💳",
        completed: ["pagamento_confirmado", "em_criacao", "concluido"].includes(req.status),
        active: req.status === "aguardando_pagamento",
        failed: req.status === "pagamento_abandonado"
      },
    ];

    if (req.planType === "individual") {
      baseSteps.push(
        { 
          id: "creation", 
          label: "Criação do Conteúdo", 
          icon: "🔨",
          completed: req.status === "concluido",
          active: req.status === "em_criacao"
        }
      );
    }

    baseSteps.push(
      { 
        id: "ready", 
        label: "Pronto!", 
        icon: "🎉",
        completed: req.status === "concluido",
        active: false
      }
    );

    return baseSteps;
  };

  const steps = request ? getProgressSteps(request) : [];

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-50" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

      <AppHeader showAdmin />

      <main className="flex-1 flex flex-col items-center py-12 px-4 relative z-10">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Meu Pedido
              </span>
            </h1>
            <p className="text-gray-400">
              Acompanhe o andamento da sua solicitação
            </p>
          </div>

          {/* Active Request Card */}
          {request && (
            <div className="glass-card rounded-3xl p-6 md:p-8 mb-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getStatusIcon(request.status)}</span>
                    <h2 className="text-2xl font-bold">
                      Plano {request.planType === "individual" ? "Individual" : "Plus"}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-400">
                    Pedido #{request.id.slice(-8)} • Criado em {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-xl border text-sm font-bold ${getStatusColor(request.status)}`}>
                  {getStatusLabel(request.status)}
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-8">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex-1 relative">
                      <div className="flex flex-col items-center">
                        {/* Circle */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 transition-all ${
                          step.completed 
                            ? 'bg-emerald-500/20 border-emerald-500' 
                            : step.active
                            ? 'bg-orange-500/20 border-orange-500 animate-pulse'
                            : step.failed
                            ? 'bg-red-500/20 border-red-500'
                            : 'bg-gray-500/20 border-gray-700'
                        }`}>
                          {step.failed ? '❌' : step.icon}
                        </div>
                        
                        {/* Label */}
                        <p className={`text-xs mt-2 text-center max-w-[80px] ${
                          step.completed || step.active ? 'text-white font-medium' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </p>
                      </div>
                      
                      {/* Line */}
                      {index < steps.length - 1 && (
                        <div className={`absolute top-6 left-1/2 w-full h-0.5 -z-10 ${
                          step.completed ? 'bg-emerald-500' : 'bg-gray-700'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Messages */}
              {request.status === "aguardando_pagamento" && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-6">
                  <div className="flex gap-3">
                    <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-300 font-medium mb-1">Aguardando Pagamento</p>
                      <p className="text-sm text-gray-400">
                        Complete o pagamento para dar continuidade ao processo.
                      </p>
                      {request.paymentLink && (
                        <a
                          href={request.paymentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm font-medium transition-all"
                        >
                          💳 Ir para Pagamento
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {request.status === "pagamento_confirmado" && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-6">
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-emerald-300 font-medium mb-1">Pagamento Confirmado!</p>
                      <p className="text-sm text-gray-400">
                        {request.planType === "individual" 
                          ? "Em breve iniciaremos a criação do seu conteúdo personalizado."
                          : "Seu acesso será liberado em breve."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {request.status === "em_criacao" && request.progress && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
                  <div className="flex gap-3">
                    <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-blue-300 font-medium mb-1">Criando Seu Conteúdo</p>
                      <p className="text-sm text-gray-400 mb-3">{request.progress.message}</p>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                          style={{ width: `${request.progress.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">{request.progress.percentage}%</p>
                    </div>
                  </div>
                </div>
              )}

              {request.status === "concluido" && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl mb-6">
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-green-300 font-medium mb-1">Pedido Concluído!</p>
                      <p className="text-sm text-gray-400 mb-3">
                        Seu acesso foi liberado. Você já pode começar a estudar!
                      </p>
                      <Link href="/">
                        <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 text-sm font-medium transition-all">
                          🚀 Começar a Estudar
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {request.status === "pagamento_abandonado" && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
                  <div className="flex gap-3">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-red-300 font-medium mb-1">Pagamento Não Confirmado</p>
                      <p className="text-sm text-gray-400 mb-3">
                        O pagamento não foi confirmado. Você pode tentar novamente.
                      </p>
                      <Link href="/planos">
                        <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium transition-all">
                          🔄 Fazer Nova Solicitação
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Plano Solicitado</p>
                  <p className="text-white font-medium">
                    {request.planType === "individual" ? "Individual" : "Plus"} - R$ {request.amount}/mês
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Última Atualização</p>
                  <p className="text-white font-medium">
                    {new Date(request.updatedAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Histórico de Pedidos */}
          {allRequests.length > 1 && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Histórico de Solicitações</h3>
              <div className="space-y-3">
                {allRequests.map(req => (
                  <div 
                    key={req.id}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      req.id === request?.id 
                        ? 'bg-orange-500/10 border-orange-500/30' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                    onClick={() => setLocation(`/meu-pedido?id=${req.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">
                          {req.planType === "individual" ? "Individual" : "Plus"} - #{req.id.slice(-8)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-lg border text-xs font-bold ${getStatusColor(req.status)}`}>
                        {getStatusLabel(req.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              💡 Em caso de dúvidas, entre em contato com o suporte
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
