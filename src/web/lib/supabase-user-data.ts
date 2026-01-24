import { supabase } from './supabase'

export type PackageStatus = 'aguardando_pagamento' | 'aguardando_montagem' | 'pronto' | null
export type CreationStage = 
  | "pagamento_pendente"
  | "pagamento_confirmado"
  | "aguardando_liberacao"
  | "material_iniciado"
  | "material_em_producao"
  | "material_quase_final"
  | "material_pronto"
  | "pronto"

export interface CreationProgress {
  stage: CreationStage
  percentual: number
  timestamps?: Record<string, string>
}

export interface UserData {
  user_id: string
  email?: string
  username?: string
  nome?: string
  telefone?: string
  plan?: string
  concurso_ativo?: string
  package_status?: PackageStatus
  package_request_date?: string
  package_days_remaining?: number
  creation_progress?: CreationProgress
  payment_confirmed_date?: string
}

/**
 * Salva ou atualiza dados do usuário no Supabase
 */
export async function saveUserData(userId: string, data: Partial<UserData>) {
  try {
    const { data: result, error } = await supabase
      .from('user_data')
      .upsert({
        user_id: userId,
        ...data,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao salvar dados do usuário:', error)
      return null
    }

    return result
  } catch (error) {
    console.error('Erro ao salvar dados:', error)
    return null
  }
}

/**
 * Busca dados do usuário no Supabase
 */
export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Usuário não encontrado - retorna null
        return null
      }
      console.error('Erro ao buscar dados do usuário:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
    return null
  }
}

/**
 * Define o status do pacote do usuário
 */
export async function setUserPackageStatus(userId: string, status: PackageStatus) {
  const updates: Partial<UserData> = {
    package_status: status
  }

  if (status === 'aguardando_montagem') {
    updates.package_request_date = new Date().toISOString()
    updates.package_days_remaining = 7
  }

  return await saveUserData(userId, updates)
}

/**
 * Busca o status do pacote do usuário
 */
export async function getUserPackageStatus(userId: string): Promise<PackageStatus> {
  const userData = await getUserData(userId)
  return userData?.package_status || null
}

/**
 * Define o plano do usuário
 */
export async function setUserPlan(userId: string, plan: string, concursoAtivo?: string) {
  return await saveUserData(userId, {
    plan,
    concurso_ativo: concursoAtivo
  })
}

/**
 * Busca o plano do usuário
 */
export async function getUserPlan(userId: string): Promise<string> {
  const userData = await getUserData(userId)
  return userData?.plan || 'gratuito'
}

/**
 * Concede acesso a um concurso
 */
export async function grantConcursoAccess(userId: string, concurso: string) {
  try {
    const { error } = await supabase
      .from('user_concurso_access')
      .upsert({
        user_id: userId,
        concurso: concurso,
        granted_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,concurso'
      })

    if (error) {
      console.error('Erro ao conceder acesso:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao conceder acesso:', error)
    return false
  }
}

/**
 * Busca todos os usuários (para admin)
 */
export async function getAllUsers(): Promise<UserData[]> {
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar todos os usuários:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return []
  }
}

/**
 * Busca usuários com pacotes pendentes (para admin)
 */
export async function getUsersWithPendingPackages(): Promise<UserData[]> {
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .in('package_status', ['aguardando_pagamento', 'aguardando_montagem'])
      .order('package_request_date', { ascending: true })

    if (error) {
      console.error('Erro ao buscar pacotes pendentes:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar pacotes:', error)
    return []
  }
}

/**
 * Atualiza o progresso de criação do pacote
 */
export async function updateCreationProgress(
  userId: string, 
  stage: CreationStage, 
  percentual: number
) {
  try {
    // Buscar progresso atual para manter timestamps
    const userData = await getUserData(userId)
    const currentProgress = userData?.creation_progress || { timestamps: {} }
    
    const newTimestamps = {
      ...currentProgress.timestamps,
      [stage]: new Date().toISOString()
    }
    
    const updates: Partial<UserData> = {
      creation_progress: {
        stage,
        percentual,
        timestamps: newTimestamps
      }
    }
    
    // Se confirmar pagamento, atualizar data
    if (stage === 'pagamento_confirmado') {
      updates.payment_confirmed_date = new Date().toISOString()
      updates.package_status = 'aguardando_montagem'
    }
    
    // Se pronto, atualizar status
    if (stage === 'pronto') {
      updates.package_status = 'pronto'
    }
    
    const result = await saveUserData(userId, updates)
    console.log(`✅ Progresso atualizado no Supabase: ${stage} (${percentual}%) para ${userId}`)
    return result
  } catch (error) {
    console.error('❌ Erro ao atualizar progresso:', error)
    return null
  }
}

/**
 * Busca o progresso de criação do usuário
 */
export async function getCreationProgress(userId: string): Promise<CreationProgress | null> {
  try {
    const userData = await getUserData(userId)
    return userData?.creation_progress || null
  } catch (error) {
    console.error('Erro ao buscar progresso:', error)
    return null
  }
}
