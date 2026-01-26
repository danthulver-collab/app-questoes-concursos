/**
 * Gerenciamento de solicitações de pacotes no Supabase
 * Substitui localStorage para permitir acesso centralizado
 */

import { supabase } from './supabase';

export interface PackageRequest {
  id?: string;
  userId: string;
  nome?: string;
  email?: string;
  telefone?: string;
  concurso: string;
  cargo: string;
  banca: string;
  bancaCustom?: string;
  materias: string[];
  materiasCustom?: string;
  plano: "individual" | "plus";
  numQuestoes?: number;
  editalFile?: string;
  extras?: string;
  extrasResponse?: string;
  status: "aguardando_montagem" | "em_andamento" | "pronto";
  createdAt: string;
  updatedAt?: string;
}

// Criar tabela se não existir (executar uma vez)
export const initPackageRequestsTable = async () => {
  // A tabela já deve existir no Supabase
  // CREATE TABLE package_requests (
  //   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  //   user_id text NOT NULL,
  //   nome text,
  //   email text,
  //   telefone text,
  //   concurso text NOT NULL,
  //   cargo text NOT NULL,
  //   banca text NOT NULL,
  //   banca_custom text,
  //   materias jsonb NOT NULL,
  //   materias_custom text,
  //   plano text NOT NULL,
  //   num_questoes integer DEFAULT 100,
  //   edital_file text,
  //   extras text,
  //   extras_response text,
  //   status text NOT NULL DEFAULT 'aguardando_montagem',
  //   created_at timestamp with time zone DEFAULT now(),
  //   updated_at timestamp with time zone DEFAULT now()
  // );
};

// Salvar solicitação
export const savePackageRequest = async (request: Omit<PackageRequest, 'id' | 'createdAt'>) => {
  try {
    const { data, error } = await supabase
      .from('plan_requests')
      .insert([{
        user_id: request.userId,
        nome: request.nome,
        email: request.email,
        telefone: request.telefone,
        concurso: request.concurso,
        cargo: request.cargo,
        banca: request.banca,
        banca_custom: request.bancaCustom,
        materias: request.materias,
        materias_custom: request.materiasCustom,
        plano: request.plano,
        num_questoes: request.numQuestoes || 100,
        edital_file: request.editalFile,
        extras: request.extras,
        extras_response: request.extrasResponse,
        status: request.status || 'aguardando_montagem'
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar solicitação:', error);
      // Fallback para localStorage
      const requests = JSON.parse(localStorage.getItem("quiz_package_requests") || "[]");
      requests.push({ ...request, createdAt: new Date().toISOString() });
      localStorage.setItem("quiz_package_requests", JSON.stringify(requests));
      return { success: false, error };
    }

    console.log('✅ Solicitação salva no Supabase:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao salvar solicitação:', error);
    return { success: false, error };
  }
};

// Buscar todas as solicitações
export const getPackageRequests = async (): Promise<PackageRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('plan_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar solicitações:', error);
      // Fallback para localStorage
      return JSON.parse(localStorage.getItem("quiz_package_requests") || "[]");
    }

    // Mapear para formato esperado
    const requests: PackageRequest[] = (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      nome: item.nome,
      email: item.email,
      telefone: item.telefone,
      concurso: item.concurso,
      cargo: item.cargo,
      banca: item.banca,
      bancaCustom: item.banca_custom,
      materias: item.materias || [],
      materiasCustom: item.materias_custom,
      plano: item.plano,
      numQuestoes: item.num_questoes,
      editalFile: item.edital_file,
      extras: item.extras,
      extrasResponse: item.extras_response,
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));

    return requests;
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error);
    return JSON.parse(localStorage.getItem("quiz_package_requests") || "[]");
  }
};

// Atualizar status da solicitação
export const updatePackageRequestStatus = async (userId: string, status: PackageRequest["status"]) => {
  try {
    const { error } = await supabase
      .from('plan_requests')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      // Fallback para localStorage
      const requests = JSON.parse(localStorage.getItem("quiz_package_requests") || "[]");
      const updated = requests.map((r: PackageRequest) => 
        r.userId === userId ? { ...r, status } : r
      );
      localStorage.setItem("quiz_package_requests", JSON.stringify(updated));
      return { success: false, error };
    }

    console.log('✅ Status atualizado no Supabase');
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return { success: false, error };
  }
};

// Atualizar resposta de extras
export const updatePackageExtrasResponse = async (userId: string, extrasResponse: string) => {
  try {
    const { error } = await supabase
      .from('plan_requests')
      .update({ 
        extras_response: extrasResponse,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao atualizar resposta:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar resposta:', error);
    return { success: false, error };
  }
};
