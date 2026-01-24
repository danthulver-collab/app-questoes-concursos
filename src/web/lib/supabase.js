import { createClient } from '@supabase/supabase-js'

// Variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

// Debug: verificar se as variáveis estão carregadas
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key exists:', !!supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO: Variáveis do Supabase não configuradas!')
  console.error('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
  console.error('VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
}

// Conecta ao Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
