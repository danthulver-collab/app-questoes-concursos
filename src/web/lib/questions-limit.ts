/**
 * Sistema de Controle de Limite de Questões por Plano
 */

import { getUserPlan, PLAN_LIMITS } from './access-control';

const QUESTIONS_ANSWERED_KEY = 'total_questions_answered';

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
  const key = `${QUESTIONS_ANSWERED_KEY}_${userId}`;
  const current = getTotalQuestionsAnswered(userId);
  localStorage.setItem(key, (current + 1).toString());
};

/**
 * Reseta contador (usado quando faz upgrade de plano)
 */
export const resetQuestionsCounter = (userId: string): void => {
  const key = `${QUESTIONS_ANSWERED_KEY}_${userId}`;
  localStorage.removeItem(key);
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
  
  // Plano grátis: 10 questões no total
  if (plan === 'free' || plan === 'gratuito') {
    const answered = getTotalQuestionsAnswered(userId);
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
  
  // Plano grátis
  if (plan === 'free' || plan === 'gratuito') {
    const answered = getTotalQuestionsAnswered(userId);
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
  const answered = getTotalQuestionsAnswered(userId);
  
  if (plan === 'free' || plan === 'gratuito') {
    return `Você atingiu o limite de 10 questões do plano grátis. Faça upgrade para continuar estudando!`;
  }
  
  return 'Limite de questões atingido.';
};
