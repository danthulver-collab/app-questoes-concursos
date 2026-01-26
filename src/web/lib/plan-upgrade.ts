/**
 * Sistema de Upgrade Automático de Plano após Pagamento
 */

import { supabase } from './supabase';
import { setUserPlan } from './access-control';
import { resetQuestionsCounter } from './questions-limit';

/**
 * Atualiza o plano do usuário após confirmação de pagamento
 */
export const upgradePlanAfterPayment = async (
  userId: string,
  userEmail: string,
  newPlan: 'individual' | 'plus'
): Promise<boolean> => {
  try {
    console.log(`🚀 Iniciando upgrade de plano para ${userEmail} -> ${newPlan}`);
    
    // 1. Atualizar no Supabase profiles
    // 🔥 Se for plano individual, também define package_status como 'aguardando'
    const updateData: Record<string, string> = { plan: newPlan };
    if (newPlan === 'individual') {
      updateData.package_status = 'aguardando';
    }
    
    const { error: profileError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);
    
    if (profileError) {
      // Tenta por email se falhou por ID
      const { error: emailError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('email', userEmail);
      
      if (emailError) {
        console.error('Erro ao atualizar profile:', emailError);
        throw emailError;
      }
    }
    
    // 2. Atualizar no localStorage
    setUserPlan(userEmail, newPlan);
    
    // 3. Resetar contador de questões (agora tem acesso ilimitado)
    resetQuestionsCounter(userEmail);
    
    console.log(`✅ Plano atualizado com sucesso para ${newPlan}${newPlan === 'individual' ? ' (package_status: aguardando)' : ''}`);
    return true;
  } catch (error) {
    console.error('Erro no upgrade de plano:', error);
    return false;
  }
};

/**
 * Monitora status de pagamento e faz upgrade automático
 */
export const monitorPaymentStatus = async (userId: string, userEmail: string): Promise<void> => {
  try {
    // Busca último pedido do usuário
    const { data: request } = await supabase
      .from('plan_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (!request) return;
    
    // Se pedido está finalizado/pronto e ainda não teve upgrade
    if (request.status === 'pronto' || request.status === 'finalizado') {
      const requestedPlan = request.requested_plan || request.plano;
      
      if (requestedPlan === 'individual' || requestedPlan === 'plus') {
        await upgradePlanAfterPayment(userId, userEmail, requestedPlan);
      }
    }
  } catch (error) {
    console.error('Erro ao monitorar pagamento:', error);
  }
};

/**
 * Webhook simulado - Admin chama quando confirma pagamento
 */
export const confirmPaymentAndUpgrade = async (
  requestId: string,
  userId: string,
  userEmail: string
): Promise<boolean> => {
  try {
    // 1. Atualizar status do pedido para "pronto"
    const { error: updateError } = await supabase
      .from('plan_requests')
      .update({ status: 'pronto' })
      .eq('id', requestId);
    
    if (updateError) throw updateError;
    
    // 2. Buscar plano solicitado
    const { data: request } = await supabase
      .from('plan_requests')
      .select('*')
      .eq('id', requestId)
      .single();
    
    if (!request) throw new Error('Pedido não encontrado');
    
    const plan = request.requested_plan || request.plano;
    
    if (plan !== 'individual' && plan !== 'plus') {
      throw new Error('Plano inválido');
    }
    
    // 3. Fazer upgrade
    const success = await upgradePlanAfterPayment(userId, userEmail, plan);
    
    if (success) {
      console.log(`✅ Pagamento confirmado e plano atualizado para ${plan}`);
    }
    
    return success;
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    return false;
  }
};
