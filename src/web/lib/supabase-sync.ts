/**
 * SINCRONIZAÇÃO TOTAL VIA SUPABASE
 * Remove dependência de localStorage - tudo via Supabase
 */

import { supabase } from './supabase';
import { savePacoteToSupabase, saveQuestaoToSupabase, getPacotesFromSupabase, getQuestoesFromSupabase } from './supabase-pacotes';
import { getAreasFromSupabase, getCarreirasFromSupabase } from './supabase-areas';
import { getMateriasFromSupabase } from './supabase-materias';
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
    console.log('🔄 Carregando TUDO do Supabase...');
    
    const quizData = getQuizData();
    if (!quizData) return;
    
    // Buscar ÁREAS do Supabase
    const areasSupabase = await getAreasFromSupabase();
    console.log(`📋 ${areasSupabase.length} áreas do Supabase`);
    
    // Buscar CARREIRAS do Supabase
    const carreirasSupabase = await getCarreirasFromSupabase();
    console.log(`👔 ${carreirasSupabase.length} carreiras do Supabase`);
    
    // Buscar MATÉRIAS do Supabase
    const materiasSupabase = await getMateriasFromSupabase();
    console.log(`📚 ${materiasSupabase.length} matérias do Supabase`);
    
    // Buscar PACOTES do Supabase
    const pacotesSupabase = await getPacotesFromSupabase();
    console.log(`📦 ${pacotesSupabase.length} pacotes do Supabase`);
    
    // Buscar QUESTÕES do Supabase
    const questoesSupabase = await getQuestoesFromSupabase();
    console.log(`📝 ${questoesSupabase.length} questões do Supabase`);
    
    // Converter matérias para formato do quiz-store
    const disciplinas = materiasSupabase.map(m => ({
      id: m.id,
      nome: m.nome
    }));
    
    // Atualizar com dados do Supabase (Supabase é source of truth)
    const newData = {
      ...quizData,
      areas: areasSupabase.length > 0 ? areasSupabase : quizData.areas,
      carreiras: carreirasSupabase.length > 0 ? carreirasSupabase : quizData.carreiras,
      disciplinas: disciplinas.length > 0 ? disciplinas : quizData.disciplinas,
      pacotes: pacotesSupabase,
      questions: questoesSupabase
    };
    
    await saveQuizData(newData);
    console.log('✅ Tudo sincronizado do Supabase!');
    
    return newData;
  } catch (error) {
    console.error('❌ Erro ao sincronizar:', error);
    return null;
  }
};

/**
 * Auto-sync a cada 3 segundos (para múltiplos admins/PCs)
 */
export const startAutoSync = () => {
  // Sincronização inicial
  syncSupabaseToLocalStorage();
  
  // Auto-sync a cada 3 segundos
  setInterval(() => {
    syncSupabaseToLocalStorage();
  }, 3000);
};
