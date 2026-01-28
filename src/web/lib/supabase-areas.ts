import { supabase } from './supabase';
import type { Area, Carreira } from './quiz-store';

// Salvar área no Supabase
export const saveAreaSupabase = async (area: Area): Promise<boolean> => {
  try {
    console.log('🔥 saveAreaSupabase chamado:', area.id, area.nome, 'materias:', area.materias);
    
    const { data, error } = await supabase
      .from('areas')
      .upsert({
        id: area.id,
        nome: area.nome,
        descricao: area.descricao,
        icone: area.icone,
        carreiras: area.carreiras,
        materias: area.materias,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('❌ Erro ao salvar área:', error);
      return false;
    }
    
    console.log('✅ Área salva no Supabase:', data);
    return true;
  } catch (e) {
    console.error('❌ Exception ao salvar área:', e);
    return false;
  }
};

// Salvar carreira no Supabase
export const saveCarreiraSupabase = async (carreira: Carreira): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('carreiras')
      .upsert({
        id: carreira.id,
        nome: carreira.nome,
        area_id: carreira.areaId,
        cargos: carreira.cargos,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    return !error;
  } catch { return false; }
};

// Deletar área
export const deleteAreaSupabase = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('areas').delete().eq('id', id);
    return !error;
  } catch { return false; }
};

// Deletar carreira
export const deleteCarreiraSupabase = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('carreiras').delete().eq('id', id);
    return !error;
  } catch { return false; }
};

// Buscar todas áreas
export const getAreasFromSupabase = async (): Promise<Area[]> => {
  try {
    const { data } = await supabase.from('areas').select('*');
    return data || [];
  } catch { return []; }
};

// Buscar todas carreiras
export const getCarreirasFromSupabase = async (): Promise<Carreira[]> => {
  try {
    const { data } = await supabase.from('carreiras').select('*');
    return (data || []).map((c: any) => ({
      id: c.id,
      nome: c.nome,
      areaId: c.area_id,
      cargos: c.cargos || []
    }));
  } catch { return []; }
};
