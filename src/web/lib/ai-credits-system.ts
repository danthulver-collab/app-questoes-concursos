// Sistema de Créditos de IA e Controle de Mensagens
import { isSuperAdmin, getUserPlan, PLAN_LIMITS, type PlanType } from './access-control';

// Tipos
export interface AIUsageData {
  userId: string;
  messagesUsedToday: number;
  messagesUsedThisMonth: number;
  lastResetDay: string; // YYYY-MM-DD
  lastResetMonth: string; // YYYY-MM
  purchasedCredits: number; // Créditos comprados
  trialStartDate?: string; // Data de início do trial
  trialExpired?: boolean;
}

export interface AICreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
}

// Pacotes de créditos disponíveis para compra
export const AI_CREDIT_PACKAGES: AICreditPackage[] = [
  {
    id: "pack_10",
    name: "Pacote Básico",
    credits: 10,
    price: 9.90
  },
  {
    id: "pack_30",
    name: "Pacote Popular",
    credits: 30,
    price: 24.90,
    popular: true
  },
  {
    id: "pack_100",
    name: "Pacote Pro",
    credits: 100,
    price: 69.90
  }
];

const AI_USAGE_KEY = "ai_usage_data";

// ============ FUNÇÕES DE CONTROLE DE USO ============

// Pega dados de uso de IA do usuário
export const getAIUsageData = (userId: string): AIUsageData => {
  try {
    const allData = JSON.parse(localStorage.getItem(AI_USAGE_KEY) || "{}");
    const userData = allData[userId];
    
    if (!userData) {
      // Criar novo registro
      return {
        userId,
        messagesUsedToday: 0,
        messagesUsedThisMonth: 0,
        lastResetDay: new Date().toISOString().split('T')[0],
        lastResetMonth: new Date().toISOString().substring(0, 7),
        purchasedCredits: 0
      };
    }
    
    return userData;
  } catch {
    return {
      userId,
      messagesUsedToday: 0,
      messagesUsedThisMonth: 0,
      lastResetDay: new Date().toISOString().split('T')[0],
      lastResetMonth: new Date().toISOString().substring(0, 7),
      purchasedCredits: 0
    };
  }
};

// Salva dados de uso
const saveAIUsageData = (userId: string, data: AIUsageData) => {
  try {
    const allData = JSON.parse(localStorage.getItem(AI_USAGE_KEY) || "{}");
    allData[userId] = data;
    localStorage.setItem(AI_USAGE_KEY, JSON.stringify(allData));
  } catch (error) {
    console.error("Erro ao salvar dados de uso de IA:", error);
  }
};

// Reseta contadores se necessário (novo dia/mês)
const resetCountersIfNeeded = (data: AIUsageData): AIUsageData => {
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toISOString().substring(0, 7);
  
  if (data.lastResetDay !== today) {
    data.messagesUsedToday = 0;
    data.lastResetDay = today;
  }
  
  if (data.lastResetMonth !== thisMonth) {
    data.messagesUsedThisMonth = 0;
    data.lastResetMonth = thisMonth;
  }
  
  return data;
};

// ============ VERIFICAÇÃO DE TRIAL ============

// Inicia trial para novo usuário
export const startTrial = (userId: string) => {
  const data = getAIUsageData(userId);
  if (!data.trialStartDate) {
    data.trialStartDate = new Date().toISOString();
    data.trialExpired = false;
    saveAIUsageData(userId, data);
  }
};

// Verifica se trial expirou
export const isTrialExpired = (userId: string): boolean => {
  const data = getAIUsageData(userId);
  
  if (!data.trialStartDate) {
    return false; // Sem trial = não expirou
  }
  
  const trialStart = new Date(data.trialStartDate);
  const now = new Date();
  const daysPassed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysPassed >= 30;
};

// Retorna dias restantes do trial
export const getTrialDaysRemaining = (userId: string): number => {
  const data = getAIUsageData(userId);
  
  if (!data.trialStartDate) {
    return 30; // Trial completo
  }
  
  const trialStart = new Date(data.trialStartDate);
  const now = new Date();
  const daysPassed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
  
  return Math.max(0, 30 - daysPassed);
};

// ============ VERIFICAÇÃO DE MENSAGENS DISPONÍVEIS ============

// Verifica se usuário pode enviar mais mensagens
export const canSendAIMessage = (userId: string): { canSend: boolean; reason?: string; remaining: number } => {
  // Super admins sempre podem enviar
  if (isSuperAdmin(userId)) {
    return { canSend: true, remaining: Infinity };
  }
  
  const plan = getUserPlan(userId) || "free";
  const planLimits = PLAN_LIMITS[plan];
  
  // Plano não tem IA
  if (!planLimits.hasAI) {
    return { 
      canSend: false, 
      reason: "Seu plano não inclui acesso ao Chat IA. Faça upgrade!",
      remaining: 0
    };
  }
  
  let data = getAIUsageData(userId);
  data = resetCountersIfNeeded(data);
  
  // Verifica se trial expirou
  if (plan === "trial" && isTrialExpired(userId)) {
    return {
      canSend: false,
      reason: "Seu trial de 30 dias expirou. Escolha um plano para continuar!",
      remaining: 0
    };
  }
  
  // 1. Usa créditos comprados primeiro
  if (data.purchasedCredits > 0) {
    return { canSend: true, remaining: data.purchasedCredits };
  }
  
  // 2. Usa limite do plano
  // TRIAL: limite diário
  if (plan === "trial") {
    const limit = planLimits.aiMessagesPerDay || 0;
    const remaining = limit - data.messagesUsedToday;
    
    if (remaining <= 0) {
      return {
        canSend: false,
        reason: `Você atingiu seu limite de ${limit} mensagens por dia. Volte amanhã ou faça upgrade!`,
        remaining: 0
      };
    }
    
    return { canSend: true, remaining };
  }
  
  // INDIVIDUAL e PLUS: limite mensal
  const monthlyLimit = planLimits.aiMessagesPerMonth || 0;
  const remaining = monthlyLimit - data.messagesUsedThisMonth;
  
  if (remaining <= 0) {
    return {
      canSend: false,
      reason: `Você atingiu seu limite de ${monthlyLimit} mensagens este mês. Compre créditos ou faça upgrade!`,
      remaining: 0
    };
  }
  
  return { canSend: true, remaining };
};

// Retorna mensagens restantes
export const getAIMessagesRemaining = (userId: string): number => {
  const check = canSendAIMessage(userId);
  return check.remaining;
};

// ============ REGISTRO DE USO ============

// Registra que usuário enviou uma mensagem
export const recordAIMessageSent = (userId: string) => {
  // Super admins não contam
  if (isSuperAdmin(userId)) {
    return;
  }
  
  let data = getAIUsageData(userId);
  data = resetCountersIfNeeded(data);
  
  // 1. Desconta de créditos comprados primeiro
  if (data.purchasedCredits > 0) {
    data.purchasedCredits--;
    saveAIUsageData(userId, data);
    return;
  }
  
  // 2. Desconta do limite do plano
  const plan = getUserPlan(userId) || "free";
  
  if (plan === "trial") {
    data.messagesUsedToday++;
  } else {
    data.messagesUsedThisMonth++;
  }
  
  saveAIUsageData(userId, data);
};

// ============ CRÉDITOS ============

// Comprar créditos
export const purchaseAICredits = (userId: string, packageId: string): boolean => {
  const package_ = AI_CREDIT_PACKAGES.find(p => p.id === packageId);
  
  if (!package_) {
    console.error("Pacote de créditos não encontrado:", packageId);
    return false;
  }
  
  // Aqui você integraria com sistema de pagamento
  // Por enquanto, vamos apenas adicionar os créditos
  
  let data = getAIUsageData(userId);
  data.purchasedCredits += package_.credits;
  saveAIUsageData(userId, data);
  
  console.log(`✅ ${package_.credits} créditos adicionados para ${userId}`);
  return true;
};

// Retorna créditos comprados disponíveis
export const getPurchasedCredits = (userId: string): number => {
  const data = getAIUsageData(userId);
  return data.purchasedCredits;
};

// ============ INFORMAÇÕES PARA UI ============

// Retorna informações completas para exibir na UI
export const getAIUsageInfo = (userId: string) => {
  const plan = getUserPlan(userId) || "free";
  const planLimits = PLAN_LIMITS[plan];
  const data = getAIUsageData(userId);
  const check = canSendAIMessage(userId);
  
  let limitType: "daily" | "monthly" | "none" = "none";
  let totalLimit = 0;
  let used = 0;
  
  if (plan === "trial") {
    limitType = "daily";
    totalLimit = planLimits.aiMessagesPerDay || 0;
    used = resetCountersIfNeeded(data).messagesUsedToday;
  } else if (planLimits.aiMessagesPerMonth) {
    limitType = "monthly";
    totalLimit = planLimits.aiMessagesPerMonth;
    used = resetCountersIfNeeded(data).messagesUsedThisMonth;
  }
  
  return {
    canSend: check.canSend,
    reason: check.reason,
    remaining: check.remaining,
    purchasedCredits: data.purchasedCredits,
    limitType,
    totalLimit,
    used,
    planHasAI: planLimits.hasAI,
    planName: planLimits.name,
    isTrialExpired: plan === "trial" ? isTrialExpired(userId) : false,
    trialDaysRemaining: plan === "trial" ? getTrialDaysRemaining(userId) : 0
  };
};
