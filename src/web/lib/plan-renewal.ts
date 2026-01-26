/**
 * Sistema de Renovação Mensal Automática de Planos
 * Verifica planos expirando e envia notificações
 */

import { supabase } from './supabase';

export interface PlanSubscription {
  user_id: string;
  email: string;
  plan: 'individual' | 'plus';
  started_at: string;
  expires_at: string;
  status: 'active' | 'expiring_soon' | 'expired';
  auto_renew: boolean;
}

/**
 * Verificar se o plano do usuário está próximo de vencer
 * Retorna dias restantes
 */
export const checkPlanExpiration = (expiresAt: string): number => {
  const now = new Date();
  const expiration = new Date(expiresAt);
  const diffTime = expiration.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Buscar planos que expiram em X dias
 */
export const getExpiringPlans = async (daysBeforeExpiration: number = 7): Promise<PlanSubscription[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, plan, plan_expires_at, auto_renew')
      .in('plan', ['individual', 'plus'])
      .not('plan_expires_at', 'is', null);
    
    if (error) {
      console.error('Erro ao buscar planos:', error);
      return [];
    }
    
    const expiring = (data || [])
      .filter(profile => {
        if (!profile.plan_expires_at) return false;
        const daysRemaining = checkPlanExpiration(profile.plan_expires_at);
        return daysRemaining <= daysBeforeExpiration && daysRemaining > 0;
      })
      .map(profile => ({
        user_id: profile.id,
        email: profile.email,
        plan: profile.plan as 'individual' | 'plus',
        started_at: '', // Pode adicionar campo se necessário
        expires_at: profile.plan_expires_at,
        status: 'expiring_soon' as const,
        auto_renew: profile.auto_renew || false
      }));
    
    return expiring;
  } catch (error) {
    console.error('Erro ao verificar expirações:', error);
    return [];
  }
};

/**
 * Renovar plano do usuário (adiciona +30 dias)
 */
export const renewUserPlan = async (userId: string, userEmail: string): Promise<boolean> => {
  try {
    const now = new Date();
    const newExpiration = new Date(now);
    newExpiration.setDate(newExpiration.getDate() + 30);
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        plan_expires_at: newExpiration.toISOString(),
        last_renewed_at: now.toISOString()
      })
      .eq('email', userEmail);
    
    if (error) {
      console.error('Erro ao renovar plano:', error);
      return false;
    }
    
    console.log(`✅ Plano renovado para ${userEmail} até ${newExpiration.toLocaleDateString()}`);
    return true;
  } catch (error) {
    console.error('Erro na renovação:', error);
    return false;
  }
};

/**
 * Enviar email de lembrete de renovação
 * (Precisa configurar serviço de email)
 */
export const sendRenewalReminder = async (userEmail: string, daysRemaining: number, plan: string) => {
  console.log(`📧 Email de lembrete enviado para ${userEmail}: Plano ${plan} expira em ${daysRemaining} dias`);
  
  // TODO: Integrar com serviço de email (SendGrid, Mailgun, etc)
  // Exemplo de corpo do email:
  const emailBody = `
    Olá!
    
    Seu plano ${plan} expira em ${daysRemaining} dias.
    
    Para continuar aproveitando:
    - Questões ilimitadas
    - Comentários detalhados
    - Chat com IA
    
    Acesse a plataforma e renove seu plano.
    
    Atenciosamente,
    Equipe Só Questões
  `;
  
  // Por enquanto, apenas loga
  return emailBody;
};

/**
 * Processo automático de verificação e notificação
 * Deve ser chamado periodicamente (ex: diariamente via cron job ou função serverless)
 */
export const checkAndNotifyExpirations = async () => {
  console.log('🔍 Verificando planos próximos de expirar...');
  
  // Buscar planos que expiram em 7 dias
  const expiring7Days = await getExpiringPlans(7);
  
  // Buscar planos que expiram em 3 dias
  const expiring3Days = await getExpiringPlans(3);
  
  // Buscar planos que expiram amanhã
  const expiring1Day = await getExpiringPlans(1);
  
  // Enviar notificações
  for (const plan of expiring7Days) {
    await sendRenewalReminder(plan.email, 7, plan.plan);
  }
  
  for (const plan of expiring3Days) {
    await sendRenewalReminder(plan.email, 3, plan.plan);
  }
  
  for (const plan of expiring1Day) {
    await sendRenewalReminder(plan.email, 1, plan.plan);
  }
  
  console.log(`📊 Notificações enviadas: ${expiring7Days.length + expiring3Days.length + expiring1Day.length} usuários`);
  
  return {
    expiring7Days: expiring7Days.length,
    expiring3Days: expiring3Days.length,
    expiring1Day: expiring1Day.length
  };
};

/**
 * Expirar planos vencidos (mudar para 'free')
 */
export const expireOverduePlans = async () => {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ plan: 'free', package_status: null })
      .in('plan', ['individual', 'plus'])
      .lt('plan_expires_at', now)
      .select();
    
    if (error) {
      console.error('Erro ao expirar planos:', error);
      return 0;
    }
    
    console.log(`⏰ ${data?.length || 0} planos expirados foram revertidos para gratuito`);
    return data?.length || 0;
  } catch (error) {
    console.error('Erro ao expirar planos:', error);
    return 0;
  }
};
