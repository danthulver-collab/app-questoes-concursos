/**
 * SINCRONIZAÇÃO TOTAL VIA SUPABASE
 * Remove dependência de localStorage - tudo via Supabase
 */

import { supabase } from './supabase';
import { savePacoteToSupabase, saveQuestaoToSupabase, getPacotesFromSupabase, getQuestoesFromSupabase } from './supabase-pacotes';
import { getQuizData, saveQuizData, type QuizData, type Pacote, type Question } from './quiz-store';

/**
 * Sincronizar TUDO do localStorage para Supabase (migração inicial)
 */
export const syncLocalStorageToSupabase = async () => {
  try {
    console.log('🔄 Iniciando sincronização localStorage → Supabase...');
    
    const quizData = getQuizData();
    if (!quizData) return;
    
    // Sincronizar PACOTES
    if (quizData.pacotes && quizData.pacotes.length > 0) {
      console.log(`📦 Sincronizando ${quizData.pacotes.length} pacotes...`);
      for (const pacote of quizData.pacotes) {
        await savePacoteToSupabase(pacote);
      }
    }
    
    // Sincronizar QUESTÕES
    if (quizData.questions && quizData.questions.length > 0) {
      console.log(`📝 Sincronizando ${quizData.questions.length} questões...`);
      for (const question of quizData.questions) {
        await saveQuestaoToSupabase(question);
      }
    }
    
    console.log('✅ Sincronização completa!');
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  }
};

/**
 * Carregar TUDO do Supabase (sincronização reversa)
 */
export const syncSupabaseToLocalStorage = async () => {
  try {
    console.log('🔄 Carregando dados do Supabase...');
    
    const quizData = getQuizData();
    if (!quizData) return;
    
    // Buscar PACOTES do Supabase
    const pacotesSupabase = await getPacotesFromSupabase();
    console.log(`📦 ${pacotesSupabase.length} pacotes do Supabase`);
    
    // Buscar QUESTÕES do Supabase
    const questoesSupabase = await getQuestoesFromSupabase();
    console.log(`📝 ${questoesSupabase.length} questões do Supabase`);
    
    // Mesclar com dados locais (prioriza Supabase)
    const mergedPacotes = [...pacotesSupabase];
    const mergedQuestoes = [...questoesSupabase];
    
    // Adicionar pacotes locais que não existem no Supabase
    quizData.pacotes.forEach(localPacote => {
      if (!mergedPacotes.find(p => p.id === localPacote.id)) {
        mergedPacotes.push(localPacote);
      }
    });
    
    // Adicionar questões locais que não existem no Supabase
    quizData.questions.forEach(localQ => {
      if (!mergedQuestoes.find(q => q.id === localQ.id)) {
        mergedQuestoes.push(localQ);
      }
    });
    
    // Atualizar localStorage com dados mesclados
    const newData = {
      ...quizData,
      pacotes: mergedPacotes,
      questions: mergedQuestoes
    };
    
    await saveQuizData(newData);
    console.log('✅ Dados sincronizados do Supabase!');
    
    return newData;
  } catch (error) {
    console.error('❌ Erro ao sincronizar:', error);
    return null;
  }
};

/**
 * Auto-sync a cada 10 segundos (para múltiplos admins)
 */
export const startAutoSync = () => {
  // Sincronização inicial
  syncSupabaseToLocalStorage();
  
  // Auto-sync a cada 10 segundos
  setInterval(() => {
    syncSupabaseToLocalStorage();
  }, 10000);
};
