/**
 * Resetar estatísticas do usuário
 */

export const resetUserStats = (userId: string): void => {
  // Limpar stats
  localStorage.removeItem(`quiz_user_stats_${userId}`);
  
  // Limpar histórico
  localStorage.removeItem(`historico_${userId}`);
  
  // Limpar métricas
  localStorage.removeItem(`metricas_${userId}`);
  
  // Limpar questões respondidas
  localStorage.removeItem(`total_questions_answered_${userId}`);
  
  // Limpar progresso de pacotes
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes(`quiz_answered_${userId}`) || 
        key.includes(`package_progress_${userId}`)) {
      localStorage.removeItem(key);
    }
  });
  
  console.log('✅ Estatísticas resetadas para:', userId);
};
