import { supabase } from './supabase'

/**
 * Autenticação via Supabase
 * Resolve: login em qualquer dispositivo + Google OAuth
 */

// Login com email/senha
export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

// Registrar com email/senha
export async function signUpWithEmail(email, password, metadata = {}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata, // fullName, username, etc
    },
  })
  return { data, error }
}

// Login com Google
export async function signInWithGoogle() {
  // Pega a URL atual do navegador
  const callbackUrl = `${window.location.origin}/auth/callback`;
  
  console.log('[Google Login] Callback URL:', callbackUrl);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
  
  if (error) {
    console.error('[Google Login] Erro:', error);
  } else {
    console.log('[Google Login] Redirecionando para Google...');
  }
  
  return { data, error }
}

// Logout
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Pegar usuário atual
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Verificar sessão
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

// Listener de mudanças de autenticação
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
  return subscription
}
