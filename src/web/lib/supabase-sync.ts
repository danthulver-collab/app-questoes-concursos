/**
 * 🔄 SINCRONIZAÇÃO COMPLETA COM SUPABASE
 * Sincroniza: Áreas, Carreiras, Matérias, Questões, Pacotes
 * Supabase é a SOURCE OF TRUTH
 */

import { supabase } from './supabase';
import { getAreasFromSupabase, getCarreirasFromSupabase } from './supabase-areas';
import { getQuestoesFromSupabase } from './supabase-questoes';
import { getPacotesFromSupabase, getQuestoesFromSupabase as getQuestoesPacotes } from './supabase-pacotes';
import { getQuizData, saveQuizData, type QuizData, type Area, type Carreira } from './quiz-store';

/**
 * 🔥 FUNÇÃO PRINCIPAL: Sincronizar TUDO do Supabase
 * Carrega áreas, carreiras, matérias e questões
 */
export const syncSupabaseToLocalStorage = async (): Promise<QuizData | null> => {
  try {
    console.log('🔄 Iniciando sincronização COMPLETA do Supabase...');
    
    const quizData = getQuizData();
    if (!quizData) {
      console.error('❌ QuizData não encontrado');
      return null;
    }
    
    // 🔥 1. BUSCAR ÁREAS DO SUPABASE
    let areasSupabase: Area[] = [];
    try {
      const { data, error } = await supabase.from('areas').select('*').order('nome');
      if (!error && data) {
        areasSupabase = data.map((a: any) => ({
          id: a.id,
          nome: a.nome,
          descricao: a.descricao || '',
          icone: a.icone || '🎯',
          carreiras: a.carreiras || [],
          materias: a.materias || [],
          createdAt: a.created_at,
          updatedAt: a.updated_at
        }));
        console.log(`📋 ${areasSupabase.length} áreas carregadas do Supabase`);
      }
    } catch (e) {
      console.log('⚠️ Tabela areas não existe ou erro:', e);
    }
    
    // 🔥 2. BUSCAR CARREIRAS DO SUPABASE
    let carreirasSupabase: Carreira[] = [];
    try {
      const { data, error } = await supabase.from('carreiras').select('*').order('nome');
      if (!error && data) {
        carreirasSupabase = data.map((c: any) => ({
          id: c.id,
          nome: c.nome,
          areaId: c.area_id,
          cargos: c.cargos || []
        }));
        console.log(`👔 ${carreirasSupabase.length} carreiras carregadas do Supabase`);
      }
    } catch (e) {
      console.log('⚠️ Tabela carreiras não existe ou erro:', e);
    }
    
    // 🔥 3. BUSCAR MATÉRIAS DO SUPABASE
    let materiasSupabase: {id: string, nome: string}[] = [];
    try {
      const { data, error } = await supabase.from('materias').select('*').order('nome');
      if (!error && data) {
        materiasSupabase = data.map((m: any) => ({
          id: m.id,
          nome: m.nome
        }));
        console.log(`📚 ${materiasSupabase.length} matérias carregadas do Supabase`);
      }
    } catch (e) {
      console.log('⚠️ Tabela materias não existe ou erro:', e);
    }
    
    // 🔥 4. BUSCAR QUESTÕES DE ÁREAS DO SUPABASE
    let questoesAreasCount = 0;
    try {
      const { count, error } = await supabase.from('questoes_areas').select('*', { count: 'exact', head: true });
      if (!error) {
        questoesAreasCount = count || 0;
        console.log(`📝 ${questoesAreasCount} questões de áreas no Supabase`);
      }
    } catch (e) {
      console.log('⚠️ Tabela questoes_areas não existe ou erro:', e);
    }
    
    // 🔥 5. BUSCAR PACOTES DO SUPABASE
    let pacotesSupabase: any[] = [];
    try {
      pacotesSupabase = await getPacotesFromSupabase();
      console.log(`📦 ${pacotesSupabase.length} pacotes carregados do Supabase`);
    } catch (e) {
      console.log('⚠️ Erro ao buscar pacotes:', e);
    }
    
    // 🔥 6. BUSCAR QUESTÕES DE PACOTES DO SUPABASE
    let questoesPacotesSupabase: any[] = [];
    try {
      questoesPacotesSupabase = await getQuestoesPacotes();
      console.log(`📝 ${questoesPacotesSupabase.length} questões de pacotes carregadas`);
    } catch (e) {
      console.log('⚠️ Erro ao buscar questões de pacotes:', e);
    }
    
    // 🔥 7. MONTAR NOVO QUIZDATA ATUALIZADO
    const newData: QuizData = {
      ...quizData,
      // Áreas: Prioriza Supabase
      areas: areasSupabase.length > 0 ? areasSupabase : quizData.areas,
      // Carreiras: Prioriza Supabase
      carreiras: carreirasSupabase.length > 0 ? carreirasSupabase : quizData.carreiras,
      // Disciplinas/Matérias: Prioriza Supabase, merge com locais
      disciplinas: materiasSupabase.length > 0 
        ? [...materiasSupabase, ...quizData.disciplinas.filter(d => !materiasSupabase.find(m => m.id === d.id))]
        : quizData.disciplinas,
      // Pacotes: Prioriza Supabase
      pacotes: pacotesSupabase.length > 0 ? pacotesSupabase : quizData.pacotes,
      // Questões: Prioriza Supabase
      questions: questoesPacotesSupabase.length > 0 ? questoesPacotesSupabase : quizData.questions
    };
    
    // 🔥 8. SALVAR NO LOCALSTORAGE
    await saveQuizData(newData);
    
    console.log('✅ Sincronização COMPLETA finalizada!');
    console.log(`   📋 ${newData.areas.length} áreas`);
    console.log(`   👔 ${newData.carreiras.length} carreiras`);
    console.log(`   📚 ${newData.disciplinas.length} matérias`);
    console.log(`   📦 ${newData.pacotes.length} pacotes`);
    console.log(`   📝 ${newData.questions.length} questões`);
    console.log(`   🎯 ${questoesAreasCount} questões de áreas (no Supabase)`);
    
    return newData;
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    return null;
  }
};

/**
 * 🔄 Sincronizar LOCAL → SUPABASE (migração)
 */
export const syncLocalStorageToSupabase = async () => {
  try {
    console.log('🔄 Iniciando migração localStorage → Supabase...');
    
    const quizData = getQuizData();
    if (!quizData) return;
    
    // Sincronizar áreas
    if (quizData.areas && quizData.areas.length > 0) {
      console.log(`📋 Migrando ${quizData.areas.length} áreas...`);
      for (const area of quizData.areas) {
        await supabase.from('areas').upsert({
          id: area.id,
          nome: area.nome,
          descricao: area.descricao,
          icone: area.icone,
          carreiras: area.carreiras,
          materias: area.materias,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      }
    }
    
    // Sincronizar carreiras
    if (quizData.carreiras && quizData.carreiras.length > 0) {
      console.log(`👔 Migrando ${quizData.carreiras.length} carreiras...`);
      for (const carr of quizData.carreiras) {
        await supabase.from('carreiras').upsert({
          id: carr.id,
          nome: carr.nome,
          area_id: carr.areaId,
          cargos: carr.cargos,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      }
    }
    
    // Sincronizar matérias
    if (quizData.disciplinas && quizData.disciplinas.length > 0) {
      console.log(`📚 Migrando ${quizData.disciplinas.length} matérias...`);
      for (const mat of quizData.disciplinas) {
        await supabase.from('materias').upsert({
          id: mat.id,
          nome: mat.nome,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      }
    }
    
    console.log('✅ Migração completa!');
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
};

/**
 * 🔄 AUTO-SYNC: Sincronizar automaticamente a cada intervalo
 */
let syncInterval: ReturnType<typeof setInterval> | null = null;

export const startAutoSync = (intervalMs: number = 30000) => {
  if (syncInterval) {
    clearInterval(syncInterval);
  }
  
  console.log(`🔄 Auto-sync ativado (a cada ${intervalMs/1000}s)`);
  
  // Sincronização inicial
  syncSupabaseToLocalStorage();
  
  // Auto-sync periódico
  syncInterval = setInterval(() => {
    syncSupabaseToLocalStorage();
  }, intervalMs);
};

export const stopAutoSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('⏹️ Auto-sync desativado');
  }
};
