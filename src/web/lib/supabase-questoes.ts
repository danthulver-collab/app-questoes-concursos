import { supabase } from './supabase';

export interface QuestaoArea {
  id: string;
  area_id: string;
  materia_id: string;
  title: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  created_at?: string;
  updated_at?: string;
}

// Buscar todas as questões do Supabase
export const getQuestoesFromSupabase = async (): Promise<Record<string, Record<string, QuestaoArea[]>>> => {
  try {
    const { data, error } = await supabase
      .from('questoes_areas')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar questões:', error);
      return {};
    }

    // Organizar por área e matéria
    const organized: Record<string, Record<string, QuestaoArea[]>> = {};
    
    (data || []).forEach((q: any) => {
      if (!organized[q.area_id]) organized[q.area_id] = {};
      if (!organized[q.area_id][q.materia_id]) organized[q.area_id][q.materia_id] = [];
      
      organized[q.area_id][q.materia_id].push({
        id: q.id,
        area_id: q.area_id,
        materia_id: q.materia_id,
        title: q.title,
        options: q.options || [],
        correct_answer: q.correct_answer,
        explanation: q.explanation || '',
        created_at: q.created_at,
        updated_at: q.updated_at
      });
    });

    return organized;
  } catch (e) {
    console.error('Erro ao buscar questões:', e);
    return {};
  }
};

// Salvar questão no Supabase
export const saveQuestaoSupabase = async (questao: {
  id: string;
  area_id: string;
  materia_id: string;
  title: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('questoes_areas')
      .upsert({
        id: questao.id,
        area_id: questao.area_id,
        materia_id: questao.materia_id,
        title: questao.title,
        options: questao.options,
        correct_answer: questao.correct_answer,
        explanation: questao.explanation,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.error('Erro ao salvar questão:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Erro ao salvar questão:', e);
    return false;
  }
};

// Deletar questão do Supabase
export const deleteQuestaoSupabase = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('questoes_areas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar questão:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Erro ao deletar questão:', e);
    return false;
  }
};

// SQL para criar a tabela (rodar no Supabase):
/*
CREATE TABLE IF NOT EXISTS questoes_areas (
  id TEXT PRIMARY KEY,
  area_id TEXT NOT NULL,
  materia_id TEXT NOT NULL,
  title TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL DEFAULT 0,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para busca rápida
CREATE INDEX idx_questoes_area ON questoes_areas(area_id);
CREATE INDEX idx_questoes_materia ON questoes_areas(materia_id);

-- RLS Policy (permitir tudo para usuários autenticados)
ALTER TABLE questoes_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON questoes_areas
  FOR ALL USING (true);
*/
