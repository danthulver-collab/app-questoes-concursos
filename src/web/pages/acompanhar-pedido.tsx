import { useState, useEffect } from 'react';
import { AppLayout } from '../components/app-layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context-supabase';
import { useLocation } from 'wouter';

const PROGRESS_STAGES = [
  { id: 'pedido_recebido', label: 'Pedido Recebido', icon: '✅', color: 'emerald' },
  { id: 'aguardando_pagamento', label: 'Aguardando Pagamento', icon: '💳', color: 'yellow' },
  { id: 'em_producao', label: 'Em Produção', icon: '🔨', color: 'blue' },
  { id: 'finalizado', label: 'Finalizado', icon: '🎉', color: 'green' },
];

export default function AcompanharPedido() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [pedido, setPedido] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadPedido();
      const interval = setInterval(loadPedido, 5000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  async function loadPedido() {
    try {
      const { data } = await supabase
        .from('plan_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setPedido(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const getStageIndex = (status: string) => {
    const statusMap: Record<string, number> = {
      'aguardando_montagem': 0,
      'aguardando_inicio': 0,
      'aguardando_pagamento': 1,
      'em_producao': 2,
      'em_andamento': 2,
      'finalizado': 3,
      'pronto': 3,
    };
    return statusMap[status] ?? 0;
  };

  const getStatusInfo = (status: string) => {
    const statusMap: any = {
      'aguardando_montagem': { label: 'Aguardando Início', color: 'yellow', icon: '⏳', description: 'Seu pedido foi recebido e está na fila.' },
      'aguardando_inicio': { label: 'Aguardando Início', color: 'yellow', icon: '⏳', description: 'Seu pedido foi recebido e está na fila.' },
      'aguardando_pagamento': { label: 'Aguardando Pagamento', color: 'amber', icon: '💳', description: 'Realize o pagamento para iniciarmos.' },
      'em_producao': { label: 'Em Produção', color: 'blue', icon: '🔨', description: 'Estamos montando seu pacote personalizado!' },
      'em_andamento': { label: 'Em Andamento', color: 'blue', icon: '🔨', description: 'Seu pacote está sendo preparado.' },
      'finalizado': { label: 'Finalizado!', color: 'green', icon: '🎉', description: 'Seu pacote está pronto para uso!' },
      'pronto': { label: 'Pronto!', color: 'green', icon: '🎉', description: 'Seu pacote está liberado!' },
    };
    return statusMap[status] || statusMap['aguardando_montagem'];
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full" />
        </div>
      </AppLayout>
    );
  }

  if (!pedido) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto p-6 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h1 className="text-3xl font-bold text-white mb-4">Nenhum pedido encontrado</h1>
          <p className="text-gray-400 mb-6">Você ainda não fez nenhum pedido de pacote individual.</p>
          <button
            onClick={() => setLocation('/planos')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white font-bold"
          >
            Ver Planos
          </button>
        </div>
      </AppLayout>
    );
  }

  const statusInfo = getStatusInfo(pedido.status);
  const currentStage = getStageIndex(pedido.status);
  const isPaid = currentStage >= 2;
  const isFinished = pedido.status === 'finalizado' || pedido.status === 'pronto';

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">📦</span>
          <h1 className="text-3xl font-bold text-white">Acompanhar Pedido</h1>
        </div>
        <p className="text-gray-400 mb-8">Status do seu pacote individual</p>

        {/* Status Principal */}
        <div className="glass-card rounded-3xl p-8 mb-6 text-center">
          <div className="text-7xl mb-4">{statusInfo.icon}</div>
          <h2 className={`text-3xl font-bold mb-2 text-${statusInfo.color}-400`}>
            {statusInfo.label}
          </h2>
          <p className="text-gray-400 mb-4">{statusInfo.description}</p>
          <p className="text-sm text-gray-500">
            Pedido realizado em {new Date(pedido.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Detalhes do Pedido */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>📋</span> Detalhes do Pedido
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <span className="text-gray-400 text-sm">Banca(s)</span>
              <div className="text-orange-400 font-bold mt-1">{pedido.banca || 'N/A'}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <span className="text-gray-400 text-sm">Matérias</span>
              <div className="text-emerald-400 font-bold mt-1">
                {Array.isArray(pedido.materias) ? pedido.materias.length : 0}
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <span className="text-gray-400 text-sm">Questões</span>
              <div className="text-blue-400 font-bold mt-1">{pedido.num_questoes || 100}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <span className="text-gray-400 text-sm">Plano</span>
              <div className="text-amber-400 font-bold mt-1 capitalize">{pedido.plano || pedido.requested_plan || 'Individual'}</div>
            </div>
          </div>

          {Array.isArray(pedido.materias) && pedido.materias.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <span className="text-gray-400 text-sm">Matérias selecionadas:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {pedido.materias.map((m: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botão de Pagamento */}
        {!isPaid && (
          <div className="glass-card rounded-2xl p-6 mb-6 border-2 border-amber-500/30">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <span>💳</span> Realizar Pagamento
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Clique no botão abaixo para pagar via Mercado Pago
            </p>
            <a
              href={pedido.plano === 'plus' ? 'https://mpago.la/1AtgXnn' : 'https://mpago.la/1ym97zu'}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-bold text-center hover:opacity-90 transition-all"
            >
              💳 Pagar R$ {pedido.plano === 'plus' ? '197' : '97'} via Mercado Pago
            </a>
          </div>
        )}

        {/* Timeline de Progresso Visual - Estilo Rastreamento */}
        <div className="glass-card rounded-2xl p-8 mb-6">
          <h3 className="text-white font-bold text-xl mb-8 text-center">Acompanhamento do Pedido</h3>
          <div className="relative">
            {/* Linha vertical */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-white/10"></div>
            
            <div className="space-y-8">
              {PROGRESS_STAGES.map((stage, index) => {
                const isCompleted = index <= currentStage;
                const isCurrent = index === currentStage;
                
                return (
                  <div key={stage.id} className="relative flex items-start gap-6">
                    {/* Ícone */}
                    <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all ${
                      isCompleted 
                        ? 'bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/50 scale-110' 
                        : 'bg-white/10 text-gray-500'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                      {isCurrent && (
                        <>
                          <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl animate-pulse"></div>
                          <div className="absolute -inset-2 border-4 border-emerald-400/30 rounded-full animate-ping"></div>
                        </>
                      )}
                    </div>
                    
                    {/* Conteúdo */}
                    <div className="flex-1 pt-2">
                      <div className={`font-bold text-lg mb-1 ${isCompleted ? 'text-white' : 'text-gray-500'}`}>
                        {stage.label}
                      </div>
                      {isCurrent && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-400 text-xs font-bold animate-pulse">
                            ← VOCÊ ESTÁ AQUI
                          </div>
                        </div>
                      )}
                      {isCompleted && !isCurrent && (
                        <div className="text-sm text-emerald-400 flex items-center gap-2">
                          <span>✓</span> Concluído
                        </div>
                      )}
                      {!isCompleted && (
                        <div className="text-sm text-gray-500">Aguardando</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Botão Ir para Questões (quando finalizado) */}
        {isFinished && (
          <div className="glass-card rounded-2xl p-6 border-2 border-emerald-500/30">
            <div className="text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-emerald-400 mb-2">Pacote Liberado!</h3>
              <p className="text-gray-400 mb-6">Seu pacote está pronto. Comece a estudar agora!</p>
              <button
                onClick={() => setLocation('/dashboard')}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl text-white font-bold text-lg hover:opacity-90 transition-all"
              >
                📚 Ir para Minhas Questões
              </button>
            </div>
          </div>
        )}

        {/* Botão Voltar */}
        <button
          onClick={() => setLocation('/dashboard')}
          className="w-full mt-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-gray-300 font-medium transition-all"
        >
          ← Voltar ao Dashboard
        </button>
      </div>
    </AppLayout>
  );
}
