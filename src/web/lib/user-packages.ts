/**
 * Gerenciamento de pacotes atribuídos aos usuários
 */

import { getQuizData } from './quiz-store';

/**
 * Retorna IDs dos pacotes atribuídos ao usuário
 */
export const getUserPackages = (userId: string): string[] => {
  const packages: string[] = [];
  
  // Busca todas as chaves de acesso a pacotes
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`pacote_access_`)) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const accessData = JSON.parse(value);
          if (Array.isArray(accessData) && accessData.includes(userId)) {
            const pacoteId = key.replace('pacote_access_', '');
            packages.push(pacoteId);
          }
        } catch {}
      }
    }
  }
  
  return packages;
};

/**
 * Retorna pacotes completos atribuídos ao usuário
 */
export const getUserPackagesDetails = (userId: string) => {
  const packageIds = getUserPackages(userId);
  const quizData = getQuizData();
  
  return quizData.pacotes.filter(p => packageIds.includes(p.id));
};
