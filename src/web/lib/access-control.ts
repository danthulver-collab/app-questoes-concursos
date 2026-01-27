// Access Control System for Concurso-based access management
import { supabase } from './supabase';

export type PlanType = "trial" | "free" | "individual" | "plus";
export type UserRole = "admin" | "user";

// Plan limits - New rules:
// TRIAL (30 dias): TUDO liberado com limites para experimentar
// FREE: All concursos, NO comments, limited stats, 10 questions/day
// INDIVIDUAL (R$ 97): 1 specific concurso, with comments, full stats, unlimited questions, custom package
// PLUS (R$ 197): Everything, unlimited AI, questions on demand
export const PLAN_LIMITS = {
  trial: {
    questionsPerDay: 50, // Limite generoso para trial
    maxConcursos: Infinity,
    hasComments: true, // Trial tem acesso aos comentários
    hasAdvancedStats: true, // Trial tem estatísticas avançadas
    hasAI: true, // Trial tem IA limitada
    aiMessagesPerDay: 3, // ⚠️ LIMITE: 3 mensagens IA por dia
    name: "Trial Grátis",
    price: 0,
    trialDays: 30,
    features: [
      "🎉 30 dias de teste grátis",
      "Acesso TOTAL a todos os concursos",
      "50 questões por dia",
      "Ver comentários",
      "Estatísticas avançadas",
      "Chat IA: 3 mensagens/dia",
      "Todas as funcionalidades"
    ]
  },
  free: {
    questionsPerDay: 10, // 🔥 TOTAL: 10 questões no total, não por dia
    maxConcursos: Infinity,
    hasComments: false,
    hasAdvancedStats: false,
    hasAI: false, // Plano free NÃO tem IA
    hasAudioComments: false, // Sem áudio
    hasNotes: false, // Sem anotações
    aiMessagesPerDay: 0,
    name: "Grátis",
    price: 0,
    features: [
      "10 questões no total",
      "Todas as matérias",
      "Ver respostas corretas",
      "Estatísticas básicas",
      "❌ Sem comentários em áudio",
      "❌ Sem Chat IA",
      "❌ Sem anotações"
    ]
  },
  individual: {
    questionsPerDay: Infinity,
    maxConcursos: 1,
    hasComments: true,
    hasAdvancedStats: true,
    hasAI: false, // Sem IA
    hasAudioComments: false, // Sem áudio
    hasNotes: true, // Com anotações
    aiMessagesPerMonth: 0,
    name: "Individual",
    price: 97,
    features: [
      "Questões ilimitadas do seu pacote",
      "1 concurso específico personalizado",
      "Escolha concurso, cargo, banca e matérias",
      "📦 Pacote montado em até 7 dias",
      "Comentários detalhados",
      "Anotações nas questões",
      "Estatísticas completas",
      "Plano de estudos personalizado",
      "❌ Sem áudio",
      "❌ Sem Chat IA"
    ]
  },
  plus: {
    questionsPerDay: Infinity,
    maxConcursos: Infinity,
    hasComments: true,
    hasAdvancedStats: true,
    hasAI: true, // Full AI access
    hasAudioComments: true, // Com áudio
    hasNotes: true, // Com anotações
    aiMessagesPerMonth: 200, // ⚠️ LIMITE: 200 mensagens IA por mês (bem generoso)
    name: "Plus",
    price: 127, // 🔥 PREÇO PROMOCIONAL (de R$ 197)
    oldPrice: 197, // Preço antigo para mostrar riscado
    features: [
      "Questões ilimitadas",
      "Acesso TOTAL a todos os concursos",
      "Todas as matérias incluídas",
      "🎧 Comentários em áudio",
      "✨ ChatGPT incluso: 200 msgs/mês",
      "📝 Anotações ilimitadas",
      "Questões sob demanda",
      "Comentários completos",
      "Estatísticas avançadas",
      "Plano de estudos avançado",
      "Suporte prioritário"
    ]
  }
};

// Super admin list - these usernames/emails always have admin access
// 👑 SUPER ADMINS - Acesso Total ao Sistema
const SUPER_ADMINS = [
  "danthulver@gmail.com", // 👑 REI - ADMIN PRINCIPAL - Plano Plus, 200 msgs IA/mês, acesso TOTAL
  "ribeiroduda170@gmail.com", // 👑 ADMIN - Plano Plus, 200 msgs IA/mês, acesso TOTAL
  "thiagobassoscontabil@gmail.com", // Owner - always admin
  "admin",
  "admin@soquestoes.com",
  "admin@admin.com",
];

// Task 177: Admin emails with Plus plan (acesso ilimitado, todas bancas, 200 msgs IA/mês)
const PLUS_ADMINS = [
  "danthulver@gmail.com", // Plano Plus automático
  "ribeiroduda170@gmail.com", // Plano Plus automático
];

// Check if current Supabase user has admin role in user_metadata
export const checkSupabaseAdminRole = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Check if user email is in SUPER_ADMINS list
    if (user.email && SUPER_ADMINS.includes(user.email.toLowerCase())) {
      return true;
    }
    
    // Check user_metadata for role='admin'
    if (user.user_metadata?.role === 'admin') {
      return true;
    }
    
    // Check app_metadata for role='admin' (set by Supabase admin)
    if (user.app_metadata?.role === 'admin') {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking Supabase admin role:', error);
    return false;
  }
};

// Synchronous check for admin based on user info passed in
export const isSupabaseAdmin = (user: { email?: string; user_metadata?: { role?: string }; app_metadata?: { role?: string } } | null): boolean => {
  if (!user) return false;
  
  // Check if user email is in SUPER_ADMINS list
  if (user.email && SUPER_ADMINS.includes(user.email.toLowerCase())) {
    return true;
  }
  
  // Check user_metadata for role='admin'
  if (user.user_metadata?.role === 'admin') {
    return true;
  }
  
  // Check app_metadata for role='admin'
  if (user.app_metadata?.role === 'admin') {
    return true;
  }
  
  return false;
};

export interface UserAccess {
  usuarioId: string;
  concursoId: string;
  dataLiberacao: string;
  dataExpiracao?: string;
  status: "ativo" | "expirado" | "revogado";
}

export type UserStatus = "ativo" | "suspenso" | "pendente_aprovacao" | "excluido";
export type PackageStatus = "aguardando_pagamento" | "pagamento_confirmado" | "aguardando_montagem" | "em_andamento" | "pronto" | null;

// Task 90 + Task 97: Creation progress stages (8 stages)
export type CreationStage = 
  | "pagamento_pendente"
  | "pagamento_confirmado"
  | "aguardando_liberacao"
  | "material_iniciado"
  | "material_em_producao"
  | "material_quase_final"
  | "material_pronto"
  | "pronto"; // Alias for final - kept for backwards compatibility

export interface CreationProgress {
  stage: CreationStage;
  percentual: number;
  timestamps: {
    pagamento_pendente?: string;
    pagamento_confirmado?: string;
    aguardando_liberacao?: string;
    material_iniciado?: string;
    material_em_producao?: string;
    material_quase_final?: string;
    material_pronto?: string;
    pronto?: string;
  };
}

// Stage to percentage mapping - Task 97: 8 stages
export const STAGE_PERCENTAGES: Record<CreationStage, number> = {
  pagamento_pendente: 0,
  pagamento_confirmado: 15,
  aguardando_liberacao: 25,
  material_iniciado: 40,
  material_em_producao: 55,
  material_quase_final: 75,
  material_pronto: 90,
  pronto: 100
};

// Task 97: Labels for each stage
export const STAGE_LABELS: Record<CreationStage, string> = {
  pagamento_pendente: "Pagamento Pendente",
  pagamento_confirmado: "Pagamento Confirmado",
  aguardando_liberacao: "Aguardando Liberação",
  material_iniciado: "Material Iniciado",
  material_em_producao: "Material em Produção",
  material_quase_final: "Material Quase no Final",
  material_pronto: "Material Pronto",
  pronto: "Pronto"
};

// Task 97: Icons for each stage
export const STAGE_ICONS: Record<CreationStage, string> = {
  pagamento_pendente: "⏳",
  pagamento_confirmado: "✅",
  aguardando_liberacao: "📋",
  material_iniciado: "🔨",
  material_em_producao: "🛠️",
  material_quase_final: "🎯",
  material_pronto: "📦",
  pronto: "🎉"
};

// Task 97: Messages for each stage
export const STAGE_MESSAGES: Record<CreationStage, string> = {
  pagamento_pendente: "Complete seu pagamento para iniciar",
  pagamento_confirmado: "Pagamento recebido! Iniciando processo...",
  aguardando_liberacao: "Estamos organizando a equipe de criação...",
  material_iniciado: "Começamos a criar suas questões!",
  material_em_producao: "Já temos metade pronta!",
  material_quase_final: "Falta pouco para finalizar!",
  material_pronto: "Material pronto! Fazendo revisão final...",
  pronto: "Tudo pronto! Clique para começar!"
};

// Helper to get all stages in order
export const ORDERED_STAGES: CreationStage[] = [
  "pagamento_pendente",
  "pagamento_confirmado",
  "aguardando_liberacao",
  "material_iniciado",
  "material_em_producao",
  "material_quase_final",
  "material_pronto",
  "pronto"
];

export interface UserAccessData {
  userId: string;
  nome?: string;
  email?: string;
  plano?: PlanType;
  role?: UserRole;
  status?: UserStatus;
  motivoSuspensao?: string;
  dataCadastro?: string;
  concursoOriginal?: string; // The concurso selected during onboarding (for individual plan)
  concursosAtivos: string[]; // List of concurso names the user has access to
  acessos: UserAccess[];
  packageStatus?: PackageStatus; // Task 78: waiting status for custom packages
  packageRequestDate?: string; // When the package was requested
  creationProgress?: CreationProgress; // Task 90: Detailed creation progress
  paymentConfirmedDate?: string; // Task 95: When admin confirmed payment
}

const ACCESS_STORAGE_KEY = "quiz_user_accesses";
const ACTIVE_CONCURSO_KEY = "quiz_active_concurso";

// Get all user accesses from localStorage
export const getAllUserAccesses = (): Record<string, UserAccessData> => {
  try {
    const stored = localStorage.getItem(ACCESS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Save all user accesses to localStorage
const saveAllUserAccesses = (data: Record<string, UserAccessData>) => {
  localStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify(data));
};

// Get access data for a specific user
export const getUserAccessData = (userId: string): UserAccessData | null => {
  const allAccesses = getAllUserAccesses();
  return allAccesses[userId] || null;
};

// Create or update user access data
export const setUserAccessData = (userId: string, data: Partial<UserAccessData>) => {
  const allAccesses = getAllUserAccesses();
  allAccesses[userId] = {
    ...allAccesses[userId],
    userId,
    ...data,
  } as UserAccessData;
  saveAllUserAccesses(allAccesses);
};

// Grant access to a concurso for a user
export const grantConcursoAccess = (
  userId: string, 
  concursoNome: string,
  expiraDias?: number
): UserAccess => {
  const allAccesses = getAllUserAccesses();
  const userData = allAccesses[userId] || { userId, concursosAtivos: [], acessos: [] };
  
  // Check if already has access
  const existingIndex = userData.acessos.findIndex(
    a => a.concursoId === concursoNome && a.status === "ativo"
  );
  
  const now = new Date();
  const newAccess: UserAccess = {
    usuarioId: userId,
    concursoId: concursoNome,
    dataLiberacao: now.toISOString(),
    dataExpiracao: expiraDias 
      ? new Date(now.getTime() + expiraDias * 24 * 60 * 60 * 1000).toISOString() 
      : undefined,
    status: "ativo"
  };
  
  if (existingIndex >= 0) {
    // Update existing access
    userData.acessos[existingIndex] = newAccess;
  } else {
    userData.acessos.push(newAccess);
  }
  
  // Update concursosAtivos list
  if (!userData.concursosAtivos.includes(concursoNome)) {
    userData.concursosAtivos.push(concursoNome);
  }
  
  allAccesses[userId] = userData;
  saveAllUserAccesses(allAccesses);
  
  return newAccess;
};

// Revoke access to a concurso for a user
export const revokeConcursoAccess = (userId: string, concursoNome: string) => {
  const allAccesses = getAllUserAccesses();
  const userData = allAccesses[userId];
  
  if (!userData) return;
  
  // Update access status
  userData.acessos = userData.acessos.map(a => 
    a.concursoId === concursoNome && a.status === "ativo"
      ? { ...a, status: "revogado" as const }
      : a
  );
  
  // Remove from active list
  userData.concursosAtivos = userData.concursosAtivos.filter(c => c !== concursoNome);
  
  allAccesses[userId] = userData;
  saveAllUserAccesses(allAccesses);
};

// Check if user has access to a specific concurso
export const hasAccessToConcurso = (userId: string, concursoNome: string): boolean => {
  // Super admins have access to all concursos
  if (isSuperAdmin(userId)) {
    return true;
  }
  
  // 🔓 ACESSO LIBERADO: Todos têm acesso às questões gerais
  // A restrição é apenas para pacotes individuais exclusivos
  const userPlan = getUserPlan(userId);
  
  // Plano Plus tem acesso TOTAL a tudo
  if (userPlan === "plus" || userPlan === "trial") {
    return true;
  }
  
  // Plano Free também tem acesso a todos os concursos (limitado por questões/dia)
  if (userPlan === "free") {
    return true;
  }
  
  // Plano Individual: verifica se tem acesso específico
  const userData = getUserAccessData(userId);
  if (!userData) {
    // Se não tem dados, libera acesso (usuário novo)
    return true;
  }
  
  const access = userData.acessos.find(
    a => a.concursoId === concursoNome && a.status === "ativo"
  );
  
  if (!access) {
    // Se não tem acesso específico mas tem plano, libera
    return true;
  }
  
  // Check expiration
  if (access.dataExpiracao && new Date(access.dataExpiracao) < new Date()) {
    // Update status to expired
    const allAccesses = getAllUserAccesses();
    allAccesses[userId].acessos = allAccesses[userId].acessos.map(a =>
      a.concursoId === concursoNome && a.status === "ativo"
        ? { ...a, status: "expirado" as const }
        : a
    );
    allAccesses[userId].concursosAtivos = allAccesses[userId].concursosAtivos.filter(
      c => c !== concursoNome
    );
    saveAllUserAccesses(allAccesses);
    return false;
  }
  
  return true;
};

// Get list of active concursos for a user
export const getActiveConcursos = (userId: string): string[] => {
  const userData = getUserAccessData(userId);
  if (!userData) return [];
  
  // Clean up expired accesses and return active ones
  const activeConcursos: string[] = [];
  const now = new Date();
  
  for (const access of userData.acessos) {
    if (access.status !== "ativo") continue;
    
    if (access.dataExpiracao && new Date(access.dataExpiracao) < now) {
      // Mark as expired
      revokeConcursoAccess(userId, access.concursoId);
    } else {
      activeConcursos.push(access.concursoId);
    }
  }
  
  return activeConcursos;
};

// Get user's currently selected active concurso
export const getActiveConcurso = (userId: string): string | null => {
  try {
    const stored = localStorage.getItem(`${ACTIVE_CONCURSO_KEY}_${userId}`);
    if (stored) {
      // Verify user still has access
      if (hasAccessToConcurso(userId, stored)) {
        return stored;
      }
    }
    
    // Return first available concurso
    const activeConcursos = getActiveConcursos(userId);
    return activeConcursos.length > 0 ? activeConcursos[0] : null;
  } catch {
    return null;
  }
};

// Set user's currently selected active concurso
export const setActiveConcurso = (userId: string, concursoNome: string) => {
  if (hasAccessToConcurso(userId, concursoNome)) {
    localStorage.setItem(`${ACTIVE_CONCURSO_KEY}_${userId}`, concursoNome);
  }
};

// Get all users with their access data (for admin)
export const getAllUsersWithAccess = (): UserAccessData[] => {
  const allAccesses = getAllUserAccesses();
  return Object.values(allAccesses);
};

// Delete user access data
export const deleteUserAccess = (userId: string) => {
  const allAccesses = getAllUserAccesses();
  delete allAccesses[userId];
  saveAllUserAccesses(allAccesses);
};

// Get statistics about accesses
export const getAccessStatistics = () => {
  const allAccesses = getAllUserAccesses();
  const users = Object.values(allAccesses);
  
  const concursoCount: Record<string, number> = {};
  let totalActiveAccesses = 0;
  
  for (const user of users) {
    for (const concurso of user.concursosAtivos) {
      concursoCount[concurso] = (concursoCount[concurso] || 0) + 1;
      totalActiveAccesses++;
    }
  }
  
  return {
    totalUsers: users.length,
    totalActiveAccesses,
    concursoDistribution: concursoCount,
    usersWithoutAccess: users.filter(u => u.concursosAtivos.length === 0).length
  };
};

// Grant access to multiple users at once
export const grantBulkAccess = (
  userIds: string[], 
  concursoNome: string, 
  expiraDias?: number
) => {
  for (const userId of userIds) {
    grantConcursoAccess(userId, concursoNome, expiraDias);
  }
};

// Initialize user access data on first login (called from auth context)
export const initializeUserAccess = (userId: string, nome?: string, email?: string) => {
  const existingData = getUserAccessData(userId);
  if (!existingData) {
    setUserAccessData(userId, {
      userId,
      nome,
      email,
      concursosAtivos: [],
      acessos: []
    });
  }
};

// ============ PLAN MANAGEMENT ============

// Set user's plan
export const setUserPlan = async (userId: string, plano: PlanType, concursoOriginal?: string) => {
  // Salvar no localStorage (cache local)
  const allAccesses = getAllUserAccesses();
  const userData = allAccesses[userId] || { userId, concursosAtivos: [], acessos: [] };
  
  userData.plano = plano;
  if (concursoOriginal) {
    userData.concursoOriginal = concursoOriginal;
  }
  
  allAccesses[userId] = userData;
  saveAllUserAccesses(allAccesses);
  
  // Salvar no Supabase (nuvem) - IMPORTANTE para funcionar em qualquer dispositivo
  try {
    const { saveUserData } = await import('./supabase-user-data');
    await saveUserData(userId, {
      plan: plano,
      concurso_ativo: concursoOriginal
    });
    console.log(`✅ Plano ${plano} salvo no Supabase para ${userId}`);
  } catch (error) {
    console.error('❌ Erro ao salvar plano no Supabase:', error);
  }
};

// Get user's plan (síncrono - usa cache do localStorage)
export const getUserPlan = (userId: string): PlanType | null => {
  // Super admins always have Plus plan
  if (isSuperAdmin(userId)) {
    return "plus";
  }
  const userData = getUserAccessData(userId);
  return userData?.plano || null;
};

// Get user's plan from Supabase (assíncrono - busca da nuvem)
export const getUserPlanFromSupabase = async (userId: string): Promise<PlanType | null> => {
  // Super admins always have Plus plan
  if (isSuperAdmin(userId)) {
    return "plus";
  }
  
  try {
    const { getUserData } = await import('./supabase-user-data');
    const userData = await getUserData(userId);
    
    if (userData?.plan) {
      // Mapear nomes antigos para novos
      const planMap: Record<string, PlanType> = {
        'gratuito': 'free',
        'free': 'free',
        'trial': 'trial',
        'individual': 'individual',
        'plus': 'plus'
      };
      
      const plan = planMap[userData.plan as string] || 'free';
      
      // Atualizar localStorage com o plano do Supabase
      const allAccesses = getAllUserAccesses();
      const localUserData = allAccesses[userId] || { userId, concursosAtivos: [], acessos: [] };
      localUserData.plano = plan;
      allAccesses[userId] = localUserData;
      saveAllUserAccesses(allAccesses);
      
      console.log(`✅ Plano ${plan} carregado do Supabase para ${userId}`);
      return plan;
    }
  } catch (error) {
    console.error('❌ Erro ao carregar plano do Supabase:', error);
  }
  
  // Fallback para localStorage
  return getUserPlan(userId);
};

// Check if user has Plus plan
export const isUserPlus = (userId: string): boolean => {
  // Super admins always have Plus plan
  if (isSuperAdmin(userId)) {
    return true;
  }
  const userData = getUserAccessData(userId);
  return userData?.plano === "plus";
};

// Check if user can view comments based on their plan
export const canViewComments = (userId: string): boolean => {
  // Super admins always can view comments
  if (isSuperAdmin(userId)) {
    return true;
  }
  
  const plan = getUserPlan(userId) || "free";
  return PLAN_LIMITS[plan].hasComments;
};

// Check if user has full AI access (Plus plan)
export const hasFullAIAccess = (userId: string): boolean => {
  // Super admins always have full AI access
  if (isSuperAdmin(userId)) {
    return true;
  }
  const userData = getUserAccessData(userId);
  return userData?.plano === "plus";
};

// Get user's original concurso (for individual plan)
export const getUserConcursoOriginal = (userId: string): string | null => {
  const userData = getUserAccessData(userId);
  return userData?.concursoOriginal || null;
};

// Check if user can access a specific concurso based on their plan
export const canAccessConcursoByPlan = (userId: string, concursoNome: string): boolean => {
  // Super admins have access to all concursos
  if (isSuperAdmin(userId)) {
    return true;
  }
  
  const userData = getUserAccessData(userId);
  if (!userData) return false;
  
  // Plus plan has access to all concursos
  if (userData.plano === "plus") {
    return true;
  }
  
  // Individual plan only has access to their original concurso
  if (userData.plano === "individual") {
    return userData.concursoOriginal === concursoNome;
  }
  
  // Legacy check: use concursosAtivos
  return userData.concursosAtivos.includes(concursoNome);
};

// Get concursos available for user based on their plan
export const getAvailableConcursosByPlan = (userId: string, allConcursos: string[]): string[] => {
  // Super admins have access to all concursos
  if (isSuperAdmin(userId)) {
    return allConcursos;
  }
  
  const userData = getUserAccessData(userId);
  if (!userData) return allConcursos; // Free users without data get full access
  
  // Plus plan has access to all concursos
  if (userData.plano === "plus") {
    return allConcursos;
  }
  
  // Individual plan only has their original concurso
  if (userData.plano === "individual" && userData.concursoOriginal) {
    return [userData.concursoOriginal];
  }
  
  // Free plan: Full access to all concursos (just limited by daily questions)
  if (userData.plano === "free" || !userData.plano) {
    return allConcursos;
  }
  
  // Legacy: use concursosAtivos
  return userData.concursosAtivos;
};

// Upgrade user to Plus plan
export const upgradeToPlus = (userId: string) => {
  setUserPlan(userId, "plus");
};

// Downgrade user to Individual plan
export const downgradeToIndividual = (userId: string, concurso: string) => {
  setUserPlan(userId, "individual", concurso);
};

// Get plan statistics
export const getPlanStatistics = () => {
  const allAccesses = getAllUserAccesses();
  const users = Object.values(allAccesses);
  
  let freeCount = 0;
  let individualCount = 0;
  let plusCount = 0;
  
  for (const user of users) {
    if (user.plano === "plus") plusCount++;
    else if (user.plano === "individual") individualCount++;
    else freeCount++; // Free or no plan
  }
  
  return {
    totalUsers: users.length,
    freeCount,
    individualCount,
    plusCount,
    potentialRevenue: (individualCount * 97) + (plusCount * 197)
  };
};

// ============ PACKAGE STATUS MANAGEMENT (Task 78) ============

// Set user's package status
export const setUserPackageStatus = (userId: string, status: PackageStatus) => {
  const allAccesses = getAllUserAccesses();
  const userData = allAccesses[userId] || { userId, concursosAtivos: [], acessos: [] };
  
  userData.packageStatus = status;
  if (status === "aguardando_montagem" && !userData.packageRequestDate) {
    userData.packageRequestDate = new Date().toISOString();
  }
  
  allAccesses[userId] = userData;
  saveAllUserAccesses(allAccesses);
};

// Get user's package status
export const getUserPackageStatus = (userId: string): PackageStatus => {
  const userData = getUserAccessData(userId);
  return userData?.packageStatus || null;
};

// Get days remaining for package (7 day deadline)
export const getPackageDaysRemaining = (userId: string): number => {
  const userData = getUserAccessData(userId);
  if (!userData?.packageRequestDate) return 7;
  
  const requestDate = new Date(userData.packageRequestDate);
  const deadline = new Date(requestDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const remaining = Math.ceil((deadline.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  return Math.max(0, remaining);
};

// Check if user is waiting for package
export const isWaitingForPackage = (userId: string): boolean => {
  const status = getUserPackageStatus(userId);
  return status === "aguardando_montagem" || status === "em_andamento";
};

// Check if user is waiting for payment confirmation
export const isWaitingForPayment = (userId: string): boolean => {
  const status = getUserPackageStatus(userId);
  return status === "aguardando_pagamento";
};

// ============ DAILY QUESTION TRACKING (for free plan) ============

const DAILY_QUESTIONS_KEY = "quiz_daily_questions";

interface DailyQuestionCount {
  date: string; // YYYY-MM-DD
  count: number;
}

const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Get user's daily question count
export const getDailyQuestionCount = (userId: string): number => {
  try {
    const stored = localStorage.getItem(`${DAILY_QUESTIONS_KEY}_${userId}`);
    if (!stored) return 0;
    
    const data: DailyQuestionCount = JSON.parse(stored);
    const today = getTodayString();
    
    if (data.date !== today) {
      // 🔥 FIX: Reset for new day AND clear localStorage
      localStorage.removeItem(`${DAILY_QUESTIONS_KEY}_${userId}`);
      console.log(`[Question Count] Nova data - contador resetado para ${userId}`);
      return 0;
    }
    return data.count;
  } catch {
    return 0;
  }
};

// Increment user's daily question count
export const incrementDailyQuestionCount = (userId: string): void => {
  const today = getTodayString();
  const currentCount = getDailyQuestionCount(userId);
  
  const data: DailyQuestionCount = {
    date: today,
    count: currentCount + 1
  };
  
  localStorage.setItem(`${DAILY_QUESTIONS_KEY}_${userId}`, JSON.stringify(data));
  console.log(`[Question Count] User ${userId}: ${currentCount} → ${currentCount + 1}`);
};

// Reset daily question count (for debugging or admin use)
export const resetDailyQuestionCount = (userId: string): void => {
  localStorage.removeItem(`${DAILY_QUESTIONS_KEY}_${userId}`);
  console.log(`[Question Count] Reset for user ${userId}`);
};

// Check if user can answer more questions today
export const canAnswerMoreQuestions = (userId: string): boolean => {
  // Super admins have unlimited questions
  if (isSuperAdmin(userId)) {
    return true;
  }
  
  const userData = getUserAccessData(userId);
  const plan = userData?.plano || "free";
  
  // Paid plans have unlimited questions
  if (plan === "individual" || plan === "plus") {
    return true;
  }
  
  // Trial and Free plans have daily limit
  const dailyCount = getDailyQuestionCount(userId);
  const limit = plan === "trial" ? PLAN_LIMITS.trial.questionsPerDay : PLAN_LIMITS.free.questionsPerDay;
  return dailyCount < limit;
};

// Get remaining questions for the day
export const getRemainingQuestions = (userId: string): number => {
  // Super admins have unlimited questions
  if (isSuperAdmin(userId)) {
    return Infinity;
  }
  
  const userData = getUserAccessData(userId);
  const plan = userData?.plano || "free";
  
  if (plan === "individual" || plan === "plus") {
    return Infinity;
  }
  
  const dailyCount = getDailyQuestionCount(userId);
  const limit = plan === "trial" ? PLAN_LIMITS.trial.questionsPerDay : PLAN_LIMITS.free.questionsPerDay;
  return Math.max(0, limit - dailyCount);
};

// ============ ROLE/PERMISSION MANAGEMENT ============

// Check if a user is a super admin (by userId or email)
export const isSuperAdmin = (userId: string | undefined): boolean => {
  if (!userId) return false;
  
  // Check if userId is in SUPER_ADMINS
  if (SUPER_ADMINS.includes(userId.toLowerCase())) {
    return true;
  }
  
  // Also check if user's email is in SUPER_ADMINS list
  const userData = getUserAccessData(userId);
  if (userData?.email && SUPER_ADMINS.includes(userData.email.toLowerCase())) {
    return true;
  }
  
  // Check if userId (which might be an email from Google login) is in SUPER_ADMINS
  if (userId.includes('@') && SUPER_ADMINS.includes(userId.toLowerCase())) {
    return true;
  }
  
  // Hardcoded admin user always has admin access
  if (userId === "admin" || userId.toLowerCase() === "admin") {
    return true;
  }
  
  return false;
};

// Check if user has admin role
export const isAdmin = (userId: string): boolean => {
  // Super admins always have admin access
  if (isSuperAdmin(userId)) {
    return true;
  }
  
  // Check if user's email is in SUPER_ADMINS list (for Supabase users)
  const userData = getUserAccessData(userId);
  if (userData?.email && SUPER_ADMINS.includes(userData.email.toLowerCase())) {
    return true;
  }
  
  // Check if user has been granted admin role in localStorage
  return userData?.role === "admin";
};

// Async version of isAdmin that checks Supabase user metadata
export const isAdminAsync = async (userId: string): Promise<boolean> => {
  // First check synchronous methods
  if (isAdmin(userId)) {
    return true;
  }
  
  // Then check Supabase user metadata
  return await checkSupabaseAdminRole();
};

// Get user role
export const getUserRole = (userId: string): UserRole => {
  if (isSuperAdmin(userId)) {
    return "admin";
  }
  
  const userData = getUserAccessData(userId);
  return userData?.role || "user";
};

// Set user role (only super admins can do this)
export const setUserRole = (userId: string, role: UserRole) => {
  // Cannot change super admin roles
  if (isSuperAdmin(userId)) {
    return;
  }
  
  const allAccesses = getAllUserAccesses();
  const userData = allAccesses[userId] || { userId, concursosAtivos: [], acessos: [] };
  
  userData.role = role;
  
  allAccesses[userId] = userData;
  saveAllUserAccesses(allAccesses);
};

// Grant admin role to a user
export const grantAdminRole = (userId: string) => {
  setUserRole(userId, "admin");
};

// Revoke admin role from a user
export const revokeAdminRole = (userId: string) => {
  setUserRole(userId, "user");
};

// Get all admins
export const getAllAdmins = (): string[] => {
  const allAccesses = getAllUserAccesses();
  const admins: string[] = [...SUPER_ADMINS];
  
  for (const [userId, data] of Object.entries(allAccesses)) {
    if (data.role === "admin" && !admins.includes(userId)) {
      admins.push(userId);
    }
  }
  
  return admins;
};

// ============ USER MANAGEMENT (SUSPENSION, DELETION, STATUS) ============

// Get user status
export const getUserStatus = (userId: string): UserStatus => {
  const userData = getUserAccessData(userId);
  return userData?.status || "ativo";
};

// Suspend user
export const suspendUser = (userId: string, motivo?: string) => {
  const allAccesses = getAllUserAccesses();
  const userData = allAccesses[userId];
  
  if (!userData) return;
  
  userData.status = "suspenso";
  userData.motivoSuspensao = motivo;
  
  allAccesses[userId] = userData;
  saveAllUserAccesses(allAccesses);
};

// Reactivate user
export const reactivateUser = (userId: string) => {
  const allAccesses = getAllUserAccesses();
  const userData = allAccesses[userId];
  
  if (!userData) return;
  
  userData.status = "ativo";
  userData.motivoSuspensao = undefined;
  
  allAccesses[userId] = userData;
  saveAllUserAccesses(allAccesses);
};

// Task 87: Mark user as excluded instead of deleting
export const deleteUser = (userId: string) => {
  console.log("[deleteUser] Marking user as excluded:", userId);
  
  // Update user access data with excluded status
  const allAccesses = getAllUserAccesses();
  if (allAccesses[userId]) {
    allAccesses[userId].status = "excluido";
    saveAllUserAccesses(allAccesses);
    console.log("[deleteUser] Marked as excluded in user accesses");
  } else {
    // Create entry if doesn't exist
    allAccesses[userId] = {
      userId,
      status: "excluido",
      concursosAtivos: [],
      acessos: []
    };
    saveAllUserAccesses(allAccesses);
    console.log("[deleteUser] Created excluded entry in user accesses");
  }
  
  // Also update in registered users (quiz_registered_users)
  try {
    const storedUsers = localStorage.getItem("quiz_registered_users");
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const updatedUsers = users.map((u: any) => {
        if (u.email === userId || u.username === userId || u.nome === userId) {
          return { ...u, status: "excluido" };
        }
        return u;
      });
      localStorage.setItem("quiz_registered_users", JSON.stringify(updatedUsers));
      console.log("[deleteUser] Marked as excluded in quiz_registered_users");
    }
  } catch (e) {
    console.error("[deleteUser] Error updating quiz_registered_users:", e);
  }
    
  // Also update in global users list (users)
  try {
    const globalUsers = localStorage.getItem("users");
    if (globalUsers) {
      const users = JSON.parse(globalUsers);
      const updatedUsers = users.map((u: any) => {
        if (u.id === userId || u.email === userId || u.username === userId) {
          return { ...u, status: "excluido" };
        }
        return u;
      });
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      console.log("[deleteUser] Marked as excluded in global users list");
    }
  } catch (e) {
    console.error("[deleteUser] Error updating global users:", e);
  }
  
  // Check if the currently logged user is being deleted - log them out
  try {
    const currentAuth = localStorage.getItem("quiz_auth_user");
    if (currentAuth) {
      const currentUser = JSON.parse(currentAuth);
      if (currentUser.username === userId || currentUser.email === userId) {
        localStorage.removeItem("quiz_auth_user");
        console.log("[deleteUser] Current user was excluded, logged out");
        // Force page reload to trigger logout
        window.location.href = "/login";
      }
    }
  } catch (e) {
    console.error("[deleteUser] Error checking current user:", e);
  }
  
  console.log("[deleteUser] User exclusion completed:", userId);
};

// Task 125: Permanently delete user from all localStorage
export const permanentlyDeleteUser = (userId: string) => {
  console.log("[permanentlyDeleteUser] Permanently removing:", userId);
  
  // 1. Remove from quiz_user_accesses
  const allAccesses = getAllUserAccesses();
  delete allAccesses[userId];
  saveAllUserAccesses(allAccesses);
  console.log("[permanentlyDeleteUser] Removed from user accesses");
  
  // 2. Remove from quiz_registered_users
  try {
    const storedUsers = localStorage.getItem("quiz_registered_users");
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const filteredUsers = users.filter((u: any) => 
        u.email !== userId && u.username !== userId && u.nome !== userId && u.id !== userId
      );
      localStorage.setItem("quiz_registered_users", JSON.stringify(filteredUsers));
      console.log("[permanentlyDeleteUser] Removed from quiz_registered_users");
    }
  } catch (e) {
    console.error("[permanentlyDeleteUser] Error updating quiz_registered_users:", e);
  }
  
  // 3. Remove from global users list
  try {
    const globalUsers = localStorage.getItem("users");
    if (globalUsers) {
      const users = JSON.parse(globalUsers);
      const filteredUsers = users.filter((u: any) => 
        u.id !== userId && u.email !== userId && u.username !== userId
      );
      localStorage.setItem("users", JSON.stringify(filteredUsers));
      console.log("[permanentlyDeleteUser] Removed from global users");
    }
  } catch (e) {
    console.error("[permanentlyDeleteUser] Error updating global users:", e);
  }
  
  // 4. Remove user-specific keys (daily questions, active concurso, etc.)
  try {
    localStorage.removeItem(`quiz_daily_questions_${userId}`);
    localStorage.removeItem(`quiz_active_concurso_${userId}`);
    localStorage.removeItem(`quiz_study_plan_${userId}`);
    localStorage.removeItem(`quiz_error_history_${userId}`);
    localStorage.removeItem(`quiz_chat_history_${userId}`);
    console.log("[permanentlyDeleteUser] Removed user-specific localStorage keys");
  } catch (e) {
    console.error("[permanentlyDeleteUser] Error removing user keys:", e);
  }
  
  // 5. Remove from package requests
  try {
    const requests = localStorage.getItem("package_requests");
    if (requests) {
      const parsedRequests = JSON.parse(requests);
      const filteredRequests = parsedRequests.filter((r: any) => 
        r.userId !== userId && r.email !== userId
      );
      localStorage.setItem("package_requests", JSON.stringify(filteredRequests));
      console.log("[permanentlyDeleteUser] Removed from package requests");
    }
  } catch (e) {
    console.error("[permanentlyDeleteUser] Error removing from package requests:", e);
  }
  
  console.log("[permanentlyDeleteUser] User permanently deleted:", userId);
};

// Task 131: Bulk cleanup test users based on criteria
export interface BulkCleanupCriteria {
  noRequests?: boolean;         // Users without package requests
  createdWithin24h?: boolean;   // Users created in last 24 hours
  createdWithin7d?: boolean;    // Users created in last 7 days
  emailContainsTest?: boolean;  // Email contains 'test' or 'teste'
  neverLoggedIn?: boolean;      // Users who never logged in after creation
}

export const getTestUsersForCleanup = (criteria: BulkCleanupCriteria): string[] => {
  const allAccesses = getAllUserAccesses();
  const users = Object.values(allAccesses);
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Get package requests to check if user has any
  let packageRequests: any[] = [];
  try {
    const stored = localStorage.getItem("package_requests");
    packageRequests = stored ? JSON.parse(stored) : [];
  } catch { }
  
  const usersWithRequests = new Set(packageRequests.map((r: any) => r.userId || r.email));
  
  return users.filter(user => {
    // Skip admins
    if (user.role === "admin" || isSuperAdmin(user.userId)) return false;
    
    let matches = true;
    
    if (criteria.noRequests && usersWithRequests.has(user.userId)) {
      matches = false;
    }
    
    if (criteria.emailContainsTest) {
      const email = (user.email || user.userId || "").toLowerCase();
      if (!email.includes("test") && !email.includes("teste")) {
        matches = false;
      }
    }
    
    if (criteria.createdWithin24h && user.dataCadastro) {
      const createdDate = new Date(user.dataCadastro);
      if (createdDate < oneDayAgo) matches = false;
    }
    
    if (criteria.createdWithin7d && user.dataCadastro) {
      const createdDate = new Date(user.dataCadastro);
      if (createdDate < sevenDaysAgo) matches = false;
    }
    
    return matches;
  }).map(u => u.userId);
};

export const bulkPermanentlyDeleteUsers = (userIds: string[]): number => {
  let deleted = 0;
  for (const userId of userIds) {
    try {
      permanentlyDeleteUser(userId);
      deleted++;
    } catch (e) {
      console.error("[bulkPermanentlyDeleteUsers] Error deleting:", userId, e);
    }
  }
  return deleted;
};

// Check if user is suspended
export const isUserSuspended = (userId: string): boolean => {
  const userData = getUserAccessData(userId);
  return userData?.status === "suspenso";
};

// Task 87: Check if user is excluded
export const isUserExcluded = (userId: string): boolean => {
  const userData = getUserAccessData(userId);
  return userData?.status === "excluido";
};

// Check if user is pending approval
export const isUserPendingApproval = (userId: string): boolean => {
  const userData = getUserAccessData(userId);
  return userData?.status === "pendente_aprovacao";
};

// Set user as pending approval
export const setUserPendingApproval = (userId: string) => {
  const allAccesses = getAllUserAccesses();
  const userData = allAccesses[userId] || { userId, concursosAtivos: [], acessos: [] };
  
  userData.status = "pendente_aprovacao";
  
  allAccesses[userId] = userData;
  saveAllUserAccesses(allAccesses);
};

// Approve user (change from pending to active)
export const approveUser = (userId: string, plano: PlanType = "free", concurso?: string) => {
  const allAccesses = getAllUserAccesses();
  const userData = allAccesses[userId];
  
  if (!userData) return;
  
  userData.status = "ativo";
  userData.plano = plano;
  
  if (concurso && plano !== "plus") {
    userData.concursoOriginal = concurso;
    if (!userData.concursosAtivos.includes(concurso)) {
      userData.concursosAtivos.push(concurso);
    }
  }
  
  allAccesses[userId] = userData;
  saveAllUserAccesses(allAccesses);
};

// Get pending approval users
export const getPendingApprovalUsers = (): UserAccessData[] => {
  const allAccesses = getAllUserAccesses();
  return Object.values(allAccesses).filter(u => u.status === "pendente_aprovacao");
};

// Get suspended users
export const getSuspendedUsers = (): UserAccessData[] => {
  const allAccesses = getAllUserAccesses();
  return Object.values(allAccesses).filter(u => u.status === "suspenso");
};

// Cancel all access for a user
export const cancelAllAccess = (userId: string) => {
  const allAccesses = getAllUserAccesses();
  const userData = allAccesses[userId];
  
  if (!userData) return;
  
  // Revoke all active accesses
  userData.acessos = userData.acessos.map(a => ({
    ...a,
    status: "revogado" as const
  }));
  userData.concursosAtivos = [];
  userData.concursoOriginal = undefined;
  userData.plano = "free";
  
  allAccesses[userId] = userData;
  saveAllUserAccesses(allAccesses);
};


// ============ TASK 89-95: PACKAGE PAYMENT AND PROGRESS SYSTEM ============

// Task 90 + Task 97: Set user's creation progress stage (8 stages)
export const setUserCreationProgress = (userId: string, stage: CreationStage) => {
  // Atualizar localStorage IMEDIATAMENTE
  const allAccesses = getAllUserAccesses();
  const userData = allAccesses[userId] || { userId, concursosAtivos: [], acessos: [] };
  
  if (!userData.creationProgress) {
    userData.creationProgress = {
      stage: "pagamento_pendente",
      percentual: 0,
      timestamps: {}
    };
  }
  
  userData.creationProgress.stage = stage;
  userData.creationProgress.percentual = STAGE_PERCENTAGES[stage];
  userData.creationProgress.timestamps[stage] = new Date().toISOString();
  
  // Also update packageStatus when progress changes - Task 97: Map to new stages
  if (stage === "pronto" || stage === "material_pronto") {
    userData.packageStatus = "pronto";
  } else if (stage === "pagamento_pendente") {
    userData.packageStatus = "aguardando_pagamento";
  } else if (stage === "pagamento_confirmado") {
    userData.packageStatus = "pagamento_confirmado";
  } else if (stage === "aguardando_liberacao") {
    userData.packageStatus = "aguardando_montagem";
  } else {
    userData.packageStatus = "em_andamento";
  }
  
  allAccesses[userId] = userData;
  saveAllUserAccesses(allAccesses);
  
  // 🔥 SALVAR NO SUPABASE EM BACKGROUND (não espera)
  (async () => {
    try {
      const { updateCreationProgress } = await import('./supabase-user-data');
      await updateCreationProgress(userId, stage, STAGE_PERCENTAGES[stage]);
      console.log(`✅ Progresso ${stage} salvo no Supabase para ${userId}`);
    } catch (error) {
      console.error('❌ Erro ao salvar progresso no Supabase:', error);
    }
  })();
};

// Task 90: Get user's creation progress
export const getUserCreationProgress = (userId: string): CreationProgress | null => {
  const userData = getUserAccessData(userId);
  return userData?.creationProgress || null;
};

// Task 95: Confirm payment for a user
export const confirmUserPayment = (userId: string) => {
  // Atualizar localStorage IMEDIATAMENTE
  const allAccesses = getAllUserAccesses();
  const userData = allAccesses[userId];
  
  if (!userData) return;
  
  userData.packageStatus = "aguardando_montagem";
  userData.paymentConfirmedDate = new Date().toISOString();
  userData.packageRequestDate = new Date().toISOString(); // Start 7-day countdown
  
  // Initialize creation progress
  userData.creationProgress = {
    stage: "pagamento_confirmado",
    percentual: 15,
    timestamps: {
      pagamento_pendente: userData.packageRequestDate,
      pagamento_confirmado: new Date().toISOString()
    }
  };
  
  allAccesses[userId] = userData;
  saveAllUserAccesses(allAccesses);
  
  // 🔥 SALVAR NO SUPABASE EM BACKGROUND (não espera)
  (async () => {
    try {
      const { updateCreationProgress } = await import('./supabase-user-data');
      await updateCreationProgress(userId, "pagamento_confirmado", 15);
      console.log('✅ Confirmação de pagamento salva no Supabase para:', userId);
    } catch (error) {
      console.error('❌ Erro ao salvar confirmação no Supabase:', error);
    }
  })();
};

// Task 89: Check if user is blocked waiting for payment
export const isBlockedWaitingPayment = (userId: string): boolean => {
  const userData = getUserAccessData(userId);
  return userData?.packageStatus === "aguardando_pagamento";
};

// Task 89: Get Mercado Pago checkout URL
export const getMercadoPagoCheckoutUrl = (username?: string): string => {
  // Check user's plan to determine the correct payment link
  if (username) {
    const packageRequests = JSON.parse(localStorage.getItem("quiz_package_requests") || "[]");
    const userRequest = packageRequests.find((req: any) => req.userId === username);
    
    if (userRequest && userRequest.plano === "individual") {
      return "https://mpago.la/1ym97zu"; // Individual plan
    }
  }
  
  return "https://mpago.la/1AtgXnn"; // Plus plan (default)
};

// ============ TASK 110: ROBUST PACKAGE ACCESS CONTROL ============

/**
 * Task 110: Check if user can access a specific package
 * Returns { canAccess: boolean, reason?: string }
 */
export const canAccessPackage = (userId: string, pacoteId: string): { canAccess: boolean; reason?: string } => {
  // Super admins have access to all packages
  if (isSuperAdmin(userId)) {
    console.log(`[canAccessPackage] User ${userId} is super admin - full access granted`);
    return { canAccess: true };
  }
  
  const userData = getUserAccessData(userId);
  
  // Check if user exists
  if (!userData) {
    console.log(`[canAccessPackage] User ${userId} not found`);
    return { canAccess: false, reason: "Usuário não encontrado" };
  }
  
  // Check if user is suspended or excluded
  if (userData.status === "suspenso") {
    return { canAccess: false, reason: "Sua conta está suspensa. Entre em contato com o suporte." };
  }
  if (userData.status === "excluido") {
    return { canAccess: false, reason: "Sua conta foi excluída." };
  }
  
  // 1. Plus plan users have access to everything
  if (userData.plano === "plus") {
    console.log(`[canAccessPackage] User ${userId} has Plus plan - full access granted`);
    return { canAccess: true };
  }
  
  // 2. Check if user has direct package assignment
  const pacoteAccessKey = `pacote_access_${pacoteId}`;
  try {
    const assignedUsers = JSON.parse(localStorage.getItem(pacoteAccessKey) || "[]") as string[];
    if (assignedUsers.includes(userId)) {
      console.log(`[canAccessPackage] User ${userId} has direct assignment to package ${pacoteId}`);
      return { canAccess: true };
    }
  } catch (e) {
    console.error("[canAccessPackage] Error checking package assignment:", e);
  }
  
  // 3. Check if user has Individual plan and this package was created for them
  if (userData.plano === "individual") {
    // Get the package request to see if this package was created for them
    try {
      const requests = JSON.parse(localStorage.getItem("quiz_package_requests") || "[]");
      const userRequest = requests.find((r: { userId: string; pacoteId?: string }) => r.userId === userId);
      
      if (userRequest && userRequest.pacoteId === pacoteId) {
        console.log(`[canAccessPackage] User ${userId} has Individual plan and package ${pacoteId} was created for them`);
        return { canAccess: true };
      }
    } catch (e) {
      console.error("[canAccessPackage] Error checking package request:", e);
    }
    
    // Individual users can only access their assigned packages
    return { canAccess: false, reason: "Este pacote não está disponível no seu plano. Faça upgrade para ter acesso." };
  }
  
  // 4. Free users don't have package access
  return { canAccess: false, reason: "Faça upgrade para o plano Individual ou Plus para acessar pacotes exclusivos." };
};

/**
 * Task 106: Assign package to user (called when creating package from request)
 */
export const assignPackageToUser = (userId: string, pacoteId: string): boolean => {
  try {
    const pacoteAccessKey = `pacote_access_${pacoteId}`;
    const existingAccess = JSON.parse(localStorage.getItem(pacoteAccessKey) || "[]") as string[];
    
    if (!existingAccess.includes(userId)) {
      existingAccess.push(userId);
      localStorage.setItem(pacoteAccessKey, JSON.stringify(existingAccess));
      console.log(`[assignPackageToUser] Successfully assigned package ${pacoteId} to user ${userId}`);
    }
    
    return true;
  } catch (e) {
    console.error("[assignPackageToUser] Error:", e);
    return false;
  }
};

/**
 * Get all packages assigned to a user
 */
export const getUserAssignedPackages = (userId: string): string[] => {
  const assignedPackages: string[] = [];
  
  // Scan localStorage for package access keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("pacote_access_")) {
      try {
        const users = JSON.parse(localStorage.getItem(key) || "[]") as string[];
        if (users.includes(userId)) {
          const pacoteId = key.replace("pacote_access_", "");
          assignedPackages.push(pacoteId);
        }
      } catch (e) {
        // Skip invalid entries
      }
    }
  }
  
  return assignedPackages;
};
