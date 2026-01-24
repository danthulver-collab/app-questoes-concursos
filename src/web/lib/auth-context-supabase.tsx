import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "./supabase";
import { signInWithEmail, signUpWithEmail, signInWithGoogle, signOut as supabaseSignOut, getCurrentUser, onAuthStateChange } from "./supabase-auth";
import { saveUserData } from "./supabase-user-data";
import { isSuperAdmin, getUserPlan, setUserPlan, getUserPlanFromSupabase } from "./access-control";
import { startTrial, isTrialExpired } from "./ai-credits-system";

interface User {
  id: string;
  username: string;
  email: string;
  nome?: string;
  telefone?: string;
  provider?: "google" | "email";
  avatar?: string;
}

interface RegisterData {
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  senha: string;
}

interface RegisterResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  register: (data: RegisterData) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  socialLogin: (provider: string) => boolean; // Compatibilidade com código antigo
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar usuário ao montar
  useEffect(() => {
    console.log('[AuthProvider] Iniciando verificação de usuário...');
    checkUser();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthProvider] Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          console.log('[AuthProvider] Processando usuário da sessão...');
          const userData = {
            id: session.user.id,
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || '',
            email: session.user.email || '',
            nome: session.user.user_metadata?.nome || session.user.user_metadata?.full_name,
            telefone: session.user.user_metadata?.telefone,
            provider: session.user.app_metadata?.provider === 'google' ? 'google' : 'email',
            avatar: session.user.user_metadata?.avatar_url,
          };
          
          setUser(userData);
          console.log('[AuthProvider] ✅ User state atualizado:', userData.email);
          
          // Se for login com Google, salva na tabela user_data
          if (event === 'SIGNED_IN' && session.user.app_metadata?.provider === 'google') {
            console.log('[AuthProvider] Login com Google detectado, salvando dados...');
            try {
              // Verifica se é admin antes de salvar
              const isAdmin = isSuperAdmin(session.user.email || '');
              
              await saveUserData(session.user.id, {
                user_id: session.user.id,
                email: session.user.email || '',
                username: userData.username,
                nome: userData.nome,
                plan: isAdmin ? 'plus' : 'gratuito', // Admins sempre têm plan Plus
                role: isAdmin ? 'admin' : 'user'
              });
              
              if (isAdmin) {
                console.log('✅ ADMIN detectado! Acesso total concedido:', session.user.email);
              } else {
                console.log('✅ Usuário do Google salvo na tabela user_data');
              }
              
              // 🔥 AUTO-COMPLETAR ONBOARDING para usuários Google (evita tela branca)
              const onboardingKey = `onboarding_${userData.username}`;
              if (!localStorage.getItem(onboardingKey)) {
                const autoOnboarding = {
                  concursoObjetivo: 'Concurso Público',
                  bancaOrganizadora: 'Geral',
                  tempoDisponivel: '60',
                  nivelDificuldade: 'medio'
                };
                localStorage.setItem(onboardingKey, JSON.stringify(autoOnboarding));
                console.log('✅ Onboarding automático criado para usuário Google');
              }
            } catch (error) {
              console.error('Erro ao salvar usuário do Google:', error);
            }
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      console.log('[checkUser] Verificando usuário...');
      
      // Verifica Supabase primeiro (Google OAuth ou email/senha)
      console.log('[checkUser] Verificando Supabase...');
      const { user: supabaseUser } = await getCurrentUser();
      
      if (supabaseUser) {
        console.log('[checkUser] ✅ Usuário Supabase encontrado:', supabaseUser.email);
        const userData = {
          id: supabaseUser.id,
          username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || '',
          email: supabaseUser.email || '',
          nome: supabaseUser.user_metadata?.nome || supabaseUser.user_metadata?.full_name,
          telefone: supabaseUser.user_metadata?.telefone,
          provider: supabaseUser.app_metadata?.provider === 'google' ? 'google' : 'email',
          avatar: supabaseUser.user_metadata?.avatar_url,
        };
        setUser(userData);
        console.log('[checkUser] User state atualizado:', userData.email);
        
        // 🔥 AUTO-COMPLETAR ONBOARDING para usuários Google (se não tiver)
        if (userData.provider === 'google') {
          const onboardingKey = `onboarding_${userData.username}`;
          if (!localStorage.getItem(onboardingKey)) {
            const autoOnboarding = {
              concursoObjetivo: 'Concurso Público',
              bancaOrganizadora: 'Geral',
              tempoDisponivel: '60',
              nivelDificuldade: 'medio'
            };
            localStorage.setItem(onboardingKey, JSON.stringify(autoOnboarding));
            console.log('✅ Onboarding automático criado para usuário Google (checkUser)');
          }
        }
        
        // SINCRONIZAR PLANO DO SUPABASE (importante para funcionar em qualquer dispositivo)
        const userId = userData.email || userData.id;
        
        // Carregar plano do Supabase
        const planFromSupabase = await getUserPlanFromSupabase(userId);
        console.log(`[checkUser] Plano carregado: ${planFromSupabase || 'nenhum'}`);
        
        // Se não tem plano no Supabase, verificar se precisa iniciar trial
        if (!planFromSupabase || planFromSupabase === 'free') {
          const trialData = localStorage.getItem(`trial_${userId}`);
          if (!trialData && userData.provider === 'google') {
            await setUserPlan(userId, 'trial');
            startTrial(userId);
            console.log('🎉 Trial iniciado para novo usuário Google!');
          }
        }
        
        // Verificar se o trial expirou e mudar para free
        const currentPlan = getUserPlan(userId);
        if (currentPlan === "trial" && isTrialExpired(userId)) {
          await setUserPlan(userId, "free");
          console.log('⏰ Trial expirou. Usuário movido para plano Free.');
        }
        
        setIsLoading(false);
        return;
      }
      
      // Se não houver Supabase, verifica usuário local (admin/usuario)
      const localUserStr = localStorage.getItem('local_user');
      if (localUserStr) {
        const localUser = JSON.parse(localUserStr);
        console.log('[checkUser] Usuário local encontrado:', localUser.username);
        setUser({
          id: localUser.username,
          username: localUser.username,
          email: localUser.email,
          nome: localUser.nome,
          provider: 'email',
        });
        setIsLoading(false);
        return;
      }

      console.log('[checkUser] ❌ Nenhum usuário encontrado');
    } catch (error) {
      console.error('[checkUser] Erro ao verificar usuário:', error);
    } finally {
      console.log('[checkUser] Finalizando, isLoading = false');
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      // Primeiro tenta login com usuários hardcoded (admin/usuario)
      const hardcodedUsers = [
        { username: "admin", password: "admin123", email: "admin@local.com", nome: "Administrador" },
        { username: "usuario", password: "senha123", email: "usuario@local.com", nome: "Usuário Teste" },
      ];

      const hardcodedUser = hardcodedUsers.find(
        u => (u.username === email || u.email === email) && u.password === password
      );

      if (hardcodedUser) {
        // Login local bem-sucedido
        setUser({
          id: hardcodedUser.username,
          username: hardcodedUser.username,
          email: hardcodedUser.email,
          nome: hardcodedUser.nome,
          provider: 'email',
        });
        
        // Salva no localStorage para persistência
        localStorage.setItem('local_user', JSON.stringify({
          username: hardcodedUser.username,
          email: hardcodedUser.email,
          nome: hardcodedUser.nome,
        }));
        
        return { success: true };
      }

      // Se não for usuário hardcoded, tenta com Supabase
      const { data, error } = await signInWithEmail(email, password);
      
      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          username: data.user.user_metadata?.username || email.split('@')[0],
          email: data.user.email || email,
          nome: data.user.user_metadata?.nome,
          telefone: data.user.user_metadata?.telefone,
          provider: 'email',
        });
        return { success: true };
      }

      return { success: false, error: 'Erro ao fazer login' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async function loginWithGoogle() {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('Google login error:', error);
        throw error;
      }
      // O redirecionamento acontece automaticamente
    } catch (error) {
      console.error('Error in loginWithGoogle:', error);
      throw error;
    }
  }

  async function register(data: RegisterData): Promise<RegisterResult> {
    try {
      const { data: result, error } = await signUpWithEmail(data.email, data.senha, {
        username: data.email.split('@')[0],
        nome: data.nome,
        telefone: data.telefone,
        cpf: data.cpf,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (result.user) {
        // Salva dados do usuário na tabela user_data para o admin ver
        await saveUserData(result.user.id, {
          user_id: result.user.id,
          email: result.user.email || data.email,
          username: data.email.split('@')[0],
          nome: data.nome,
          telefone: data.telefone,
          plan: 'gratuito'
        });

        console.log('✅ Usuário salvo na tabela user_data:', result.user.id);

        // Iniciar trial de 30 dias automaticamente para novo usuário
        startTrial(result.user.email || result.user.id);
        console.log('🎉 Trial de 30 dias iniciado automaticamente!');

        // Usuário criado com sucesso
        // Supabase envia email de confirmação automaticamente
        return { 
          success: true, 
        };
      }

      return { success: false, error: 'Erro ao criar conta' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async function logout() {
    console.log('[Logout] Iniciando logout completo...');
    
    // 🔥 LIMPEZA COMPLETA DO LOCALSTORAGE
    // Limpa usuário local
    localStorage.removeItem('local_user');
    
    // Limpa todos os dados de sessão/cache que podem causar problemas
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        // Remove dados temporários, cache, quiz progress, etc
        if (key.includes('quiz_') || 
            key.includes('trial_') || 
            key.includes('ai_') ||
            key.includes('daily_') ||
            key.includes('last_')) {
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => {
      console.log(`[Logout] Removendo: ${key}`);
      localStorage.removeItem(key);
    });
    
    // Faz logout do Supabase
    await supabaseSignOut();
    
    // Limpa state
    setUser(null);
    
    console.log('[Logout] ✅ Logout completo realizado');
    
    // 🔥 FORÇA RELOAD DA PÁGINA para limpar cache em memória
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  }

  // Compatibilidade com código antigo
  function socialLogin(provider: string): boolean {
    console.log('socialLogin chamado (legado), use loginWithGoogle()');
    return false;
  }

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout, socialLogin, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
