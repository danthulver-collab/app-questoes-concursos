/**
 * 🔥 SINCRONIZAÇÃO AUTOMÁTICA SUPABASE
 * Garante que TUDO seja salvo no Supabase automaticamente
 */

import { saveQuizData, type QuizData } from './quiz-store';
import { saveAreaSupabase } from './supabase-areas';
import { savePacoteToSupabase } from './supabase-pacotes';

/**
 * Salva TUDO no Supabase + localStorage
 */
export const salvarTudoSupabase = async (data: QuizData) => {
  try {
    // 1. Salvar todas as áreas
    for (const area of data.areas) {
      await saveAreaSupabase(area);
    }
    
    // 2. Salvar todos os pacotes
    for (const pacote of data.pacotes) {
      await savePacoteToSupabase(pacote);
    }
    
    // 3. Salvar no localStorage (backup)
    saveQuizData(data);
    
    console.log('✅ Tudo salvo no Supabase!');
  } catch (error) {
    console.error('❌ Erro ao salvar no Supabase:', error);
    // Mesmo com erro, salva no localStorage
    saveQuizData(data);
  }
};
