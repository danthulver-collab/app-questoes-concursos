import { supabase } from './supabase';

export interface Materia {
  id: string;
  nome: string;
  area_id?: string;
}

// Salvar matéria no Supabase
export const saveMateriaSupabase = async (materia: Materia): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('materias')
      .upsert({
        id: materia.id,
        nome: materia.nome,
        area_id: materia.area_id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.error('❌ Erro ao salvar matéria:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('❌ Exception:', e);
    return false;
  }
};

// Buscar matérias de uma área
export const getMateriasFromSupabase = async (areaId?: string): Promise<Materia[]> => {
  try {
    let query = supabase.from('materias').select('*');
    
    if (areaId) {
      query = query.eq('area_id', areaId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar matérias:', error);
      return [];
    }
    
    return data || [];
  } catch {
    return [];
  }
};

// Deletar matéria
export const deleteMateriaSupabase = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('materias').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
};
