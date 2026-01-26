import { useEffect, useState } from 'react';
import { getUserPlanFromSupabase, setUserCreationProgress, getUserCreationProgress, type CreationStage } from './access-control';
import { getCreationProgress } from './supabase-user-data';

/**
 * Hook para sincronizar automaticamente o plano E progresso do usuário com o Supabase
 * Verifica a cada 5 segundos se houve mudanças
 * Dispara eventos customizados quando há alterações
 */
export function useSyncPlan(userId: string | undefined) {
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastPlan, setLastPlan] = useState<string | null>(null);
  const [lastStage, setLastStage] = useState<CreationStage | null>(null);

  useEffect(() => {
    if (!userId) return;

    console.log('[Sync] Iniciando sincronização automática para:', userId);

    // Sincronizar imediatamente ao montar
    syncData();

    // Sincronizar a cada 5 segundos (mais rápido para feedback imediato)
    const interval = setInterval(() => {
      syncData();
    }, 5000); // 5 segundos

    return () => {
      console.log('[Sync] Parando sincronização');
      clearInterval(interval);
    };
  }, [userId]);

  async function syncData() {
    if (!userId || isSyncing) return;

    setIsSyncing(true);
    try {
      // Sincronizar plano
      const plan = await getUserPlanFromSupabase(userId);
      
      // Sincronizar progresso de criação
      const progressFromSupabase = await getCreationProgress(userId);
      
      setLastSync(new Date());
      
      // Disparar evento quando o plano mudar
      if (plan && plan !== lastPlan) {
        console.log(`[Sync] ✅ Plano mudou: ${lastPlan} → ${plan}`);
        setLastPlan(plan);
        window.dispatchEvent(new CustomEvent('planUpdated', { 
          detail: { userId, plan } 
        }));
      }
      
      // Disparar evento quando o progresso mudar (SEM REDIRECT - evita loops)
      if (progressFromSupabase && progressFromSupabase.stage !== lastStage) {
        console.log(`[Sync] ✅ Progresso mudou: ${lastStage} → ${progressFromSupabase.stage} (${progressFromSupabase.percentual}%)`);
        setLastStage(progressFromSupabase.stage);
        
        // Atualizar localStorage com o progresso do Supabase (sem await - instantâneo)
        const localProgress = getUserCreationProgress(userId);
        if (!localProgress || localProgress.stage !== progressFromSupabase.stage) {
          setUserCreationProgress(userId, progressFromSupabase.stage);
        }
        
        window.dispatchEvent(new CustomEvent('progressUpdated', { 
          detail: { 
            userId, 
            stage: progressFromSupabase.stage,
            percentual: progressFromSupabase.percentual 
          } 
        }));
      }
    } catch (error) {
      console.error('[Sync] ❌ Erro ao sincronizar:', error);
    } finally {
      setIsSyncing(false);
    }
  }

  return { lastSync, isSyncing, syncNow: syncData };
}
