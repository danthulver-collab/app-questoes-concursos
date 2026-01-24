import { useState, useEffect } from 'react';
import { AppLayout } from '../components/app-layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context-supabase';

export default function AcompanharPedido() {
  const { user } = useAuth();
  const [pedido, setPedido] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPedido();
    const interval = setInterval(loadPedido, 5000); // Atualiza a cada 5s
    return () => clearInterval(interval);
  }, []);

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

  const getStatusInfo = (status: string) => {
    const statusMap: any = {
      'aguardando_inicio': { label: 'Aguardando Início', color: 'yellow', icon: '⏳' },
      'em_producao': { label: 'Em Produção', color: 'blue', icon: '🔨' },
      'finalizado': { label: 'Finalizado', color: 'green', icon: '✅' },
      'pendente': { label: 'Pendente', color: 'gray', icon: '📋' }
    };
    return statusMap[status] || statusMap['pendente'];
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-white">Carregando...</div>
        </div>
      </AppLayout>
    );
  }

  if (!pedido) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto p-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Nenhum pedido encontrado</h1>
          <p className="text-gray-400">Você ainda não fez nenhum pedido de pacote individual.</p>
        </div>
      </AppLayout>
    );
  }

  const statusInfo = getStatusInfo(pedido.status);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-white mb-2">📦 Acompanhar Pedido</h1>
        <p className="text-gray-400 mb-8">Status do seu pacote individual</p>

        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          {/* Status */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{statusInfo.icon}</div>
            <h2 className={`text-2xl font-bold mb-2 text-${statusInfo.color}-400`}>
              {statusInfo.label}
            </h2>
            <p className="text-gray-400">
              Pedido realizado em {new Date(pedido.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Detalhes */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Banca(s):</span>
                <div className="text-white font-semibold">{pedido.banca}</div>
              </div>
              <div>
                <span className="text-gray-400">Matérias:</span>
                <div className="text-white font-semibold">{pedido.materias?.length || 0}</div>
              </div>
            </div>

            {pedido.materias && pedido.materias.length > 0 && (
              <div>
                <div className="text-gray-400 text-sm mb-2">Matérias selecionadas:</div>
                <div className="flex flex-wrap gap-2">
                  {pedido.materias.map((m: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {pedido.observacoes && (
              <div className="p-4 bg-white/5 rounded-xl">
                <div className="text-gray-400 text-sm mb-1">Observações:</div>
                <div className="text-white">{pedido.observacoes}</div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="font-semibold text-white mb-4">Progresso:</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">✓</div>
                <div className="text-white">Pedido recebido</div>
              </div>
              <div className={`flex items-center gap-3 ${pedido.status === 'aguardando_inicio' ? 'opacity-50' : ''}`}>
                <div className={`w-8 h-8 rounded-full ${pedido.status !== 'aguardando_inicio' ? 'bg-blue-500' : 'bg-white/20'} flex items-center justify-center text-white`}>
                  {pedido.status !== 'aguardando_inicio' ? '✓' : '2'}
                </div>
                <div className="text-white">Em produção</div>
              </div>
              <div className={`flex items-center gap-3 ${pedido.status !== 'finalizado' ? 'opacity-50' : ''}`}>
                <div className={`w-8 h-8 rounded-full ${pedido.status === 'finalizado' ? 'bg-green-500' : 'bg-white/20'} flex items-center justify-center text-white`}>
                  {pedido.status === 'finalizado' ? '✓' : '3'}
                </div>
                <div className="text-white">Finalizado</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
