/**
 * Sistema de Controle de Limite de Questões por Plano
 */

import { getUserPlan, PLAN_LIMITS } from './access-control';

const QUESTIONS_ANSWERED_KEY = 'total_questions_answered';
const DAILY_QUESTIONS_KEY = 'daily_questions';

/**
 * Retorna quantas questões o usuário respondeu HOJE
 */
export const getDailyQuestionsAnswered = (userId: string): number => {
  try {
    const key = `${DAILY_QUESTIONS_KEY}_${userId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return 0;
    
    const data = JSON.parse(stored);
    const today = new Date().toDateString();
    
    // Se é de hoje, retorna contador
    if (data.date === today) {
      return data.count || 0;
    }
    
    // Se é de outro dia, reseta
    return 0;
  } catch {
    return 0;
  }
};

/**
 * Retorna quantas questões o usuário já respondeu (total)
 */
export const getTotalQuestionsAnswered = (userId: string): number => {
  try {
    const key = `${QUESTIONS_ANSWERED_KEY}_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
};

/**
 * Incrementa contador de questões respondidas
 */
export const incrementQuestionsAnswered = (userId: string): void => {
  // Total
  const totalKey = `${QUESTIONS_ANSWERED_KEY}_${userId}`;
  const current = getTotalQuestionsAnswered(userId);
  localStorage.setItem(totalKey, (current + 1).toString());
  
  // Diário
  const dailyKey = `${DAILY_QUESTIONS_KEY}_${userId}`;
  const today = new Date().toDateString();
  const dailyCurrent = getDailyQuestionsAnswered(userId);
  
  localStorage.setItem(dailyKey, JSON.stringify({
    date: today,
    count: dailyCurrent + 1
  }));
};

/**
 * Reseta contador (usado quando faz upgrade de plano)
 */
export const resetQuestionsCounter = (userId: string): void => {
  const key = `${QUESTIONS_ANSWERED_KEY}_${userId}`;
  localStorage.removeItem(key);
  const dailyKey = `${DAILY_QUESTIONS_KEY}_${userId}`;
  localStorage.removeItem(dailyKey);
};

/**
 * Verifica se usuário atingiu o limite de questões
 */
export const hasReachedQuestionLimit = (userId: string): boolean => {
  const plan = getUserPlan(userId);
  
  // Planos ilimitados
  if (plan === 'plus' || plan === 'individual') {
    return false;
  }
  
  // Plano grátis: 10 questões POR DIA
  if (plan === 'free' || plan === 'gratuito') {
    const answered = getDailyQuestionsAnswered(userId);
    return answered >= 10;
  }
  
  return false;
};

/**
 * Retorna quantas questões restam para o usuário
 */
export const getRemainingQuestions = (userId: string): number | null => {
  const plan = getUserPlan(userId);
  
  // Planos ilimitados retornam null
  if (plan === 'plus' || plan === 'individual') {
    return null;
  }
  
  // Plano grátis: 10 por dia
  if (plan === 'free' || plan === 'gratuito') {
    const answered = getDailyQuestionsAnswered(userId);
    const remaining = 10 - answered;
    return remaining > 0 ? remaining : 0;
  }
  
  return null;
};

/**
 * Verifica se usuário pode responder questão
 */
export const canAnswerQuestion = (userId: string): boolean => {
  return !hasReachedQuestionLimit(userId);
};

/**
 * Retorna mensagem de limite atingido
 */
export const getLimitMessage = (userId: string): string => {
  const plan = getUserPlan(userId);
  const answered = getDailyQuestionsAnswered(userId);
  
  if (plan === 'free' || plan === 'gratuito') {
    return `Você atingiu o limite de 10 questões por dia do plano grátis. Volte amanhã ou faça upgrade para continuar!`;
  }
  
  return 'Limite de questões atingido.';
};
