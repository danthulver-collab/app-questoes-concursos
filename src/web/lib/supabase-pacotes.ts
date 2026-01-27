/**
 * Funções para gerenciar Pacotes e Questões no Supabase
 */

import { supabase } from './supabase';
import type { Pacote, Question } from './quiz-store';

// ============================================
// PACOTES
// ============================================

export const savePacoteToSupabase = async (pacote: Pacote) => {
  try {
    const { data, error } = await supabase
      .from('pacotes')
      .upsert({
        id: pacote.id,
        nome: pacote.nome,
        banca: pacote.banca,
        ano: pacote.ano,
        orgao: pacote.orgao,
        descricao: pacote.descricao,
        disciplinas: pacote.disciplinas,
        num_questoes: pacote.numQuestoes,
        preco: pacote.preco,
        premium: pacote.premium,
        aluno_atribuido: pacote.alunoAtribuido,
        questions_ids: pacote.questionsIds,
        area_id: pacote.areaId,
        carreira_id: pacote.carreiraId,
        cargo: pacote.cargo,
        expires_at: pacote.expiresAt,
        suspended_at: pacote.suspendedAt,
        canceled_at: pacote.canceledAt,
        status: pacote.status || 'active',
        created_at: pacote.createdAt,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar pacote no Supabase:', error);
      return { success: false, error };
    }

    console.log('✅ Pacote salvo no Supabase:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao salvar pacote:', error);
    return { success: false, error };
  }
};

export const getPacotesFromSupabase = async (): Promise<Pacote[]> => {
  try {
    const { data, error } = await supabase
      .from('pacotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar pacotes:', error);
      return [];
    }

    // Mapear para formato esperado
    const pacotes: Pacote[] = (data || []).map(item => ({
      id: item.id,
      nome: item.nome,
      banca: item.banca || '',
      ano: item.ano || new Date().getFullYear(),
      orgao: item.orgao || '',
      descricao: item.descricao || '',
      disciplinas: item.disciplinas || [],
      numQuestoes: item.num_questoes || 100,
      preco: item.preco,
      premium: item.premium || false,
      alunoAtribuido: item.aluno_atribuido,
      questionsIds: item.questions_ids || [],
      areaId: item.area_id,
      carreiraId: item.carreira_id,
      cargo: item.cargo,
      expiresAt: item.expires_at,
      suspendedAt: item.suspended_at,
      canceledAt: item.canceled_at,
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));

    return pacotes;
  } catch (error) {
    console.error('Erro ao buscar pacotes:', error);
    return [];
  }
};

export const deletePacoteFromSupabase = async (pacoteId: string) => {
  try {
    const { error } = await supabase
      .from('pacotes')
      .delete()
      .eq('id', pacoteId);

    if (error) {
      console.error('Erro ao excluir pacote:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir pacote:', error);
    return { success: false, error };
  }
};

// ============================================
// QUESTÕES
// ============================================

export const saveQuestaoToSupabase = async (questao: any) => {
  try {
    const { data, error } = await supabase
      .from('questoes')
      .upsert({
        id: questao.id,
        pergunta: questao.pergunta,
        alternativas: questao.alternativas,
        correta: questao.correta,
        disciplina: questao.disciplina,
        modulo: questao.modulo,
        banca: questao.banca,
        concurso: questao.concurso,
        ano: questao.ano,
        comentario: questao.comentario,
        dificuldade: questao.dificuldade,
        texto_contexto: questao.texto_contexto || null,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar questão no Supabase:', error);
      return { success: false, error };
    }

    console.log('✅ Questão salva no Supabase');
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao salvar questão:', error);
    return { success: false, error };
  }
};

export const getQuestoesFromSupabase = async (): Promise<Question[]> => {
  try {
    const { data, error } = await supabase
      .from('questoes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar questões:', error);
      return [];
    }

    // Mapear para formato esperado
    const questoes: Question[] = (data || []).map(item => ({
      id: item.id,
      pergunta: item.pergunta,
      alternativas: (typeof item.alternativas === 'string' 
        ? JSON.parse(item.alternativas) 
        : item.alternativas) as [string, string, string, string],
      correta: item.correta as 0 | 1 | 2 | 3,
      disciplina: item.disciplina || '',
      modulo: item.modulo || '',
      banca: item.banca || '',
      concurso: item.concurso || '',
      ano: item.ano || new Date().getFullYear(),
      comentario: item.comentario || '',
      dificuldade: item.dificuldade as 'facil' | 'medio' | 'dificil' || 'medio'
    }));

    return questoes;
  } catch (error) {
    console.error('Erro ao buscar questões:', error);
    return [];
  }
};

export const deleteQuestaoFromSupabase = async (questaoId: string) => {
  try {
    const { error } = await supabase
      .from('questoes')
      .delete()
      .eq('id', questaoId);

    if (error) {
      console.error('Erro ao excluir questão:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir questão:', error);
    return { success: false, error };
  }
};
