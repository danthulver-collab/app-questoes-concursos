import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "../lib/auth-context-supabase";
import { PasswordInput } from "../components/password-input";

// Google icon SVG
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Facebook icon SVG
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "facebook" | null>(null);
  const { login, loginWithGoogle, user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // 🔥 REMOVIDO: verificação causava problema com Google OAuth
  // if (!isLoading && user) {
  //   setLocation("/");
  //   return null;
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await login(username, password);
    
    if (result.success) {
      setLocation("/");
    } else {
      setError(result.error || "Email ou senha incorretos");
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    if (provider === "google") {
      setSocialLoading("google");
      try {
        await loginWithGoogle();
        // Redirecionamento automático para Google
      } catch (error) {
        console.error('Erro ao fazer login com Google:', error);
        setError('Erro ao conectar com Google. Configure o OAuth no Supabase.');
        setSocialLoading(null);
      }
      return;
    }
    
    // Facebook ainda não implementado
    setError('Facebook login em desenvolvimento');
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative z-10 animate-slide-in-up">
        {/* Logo with glow */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            <div className="absolute inset-0 w-40 h-40 md:w-48 md:h-48 bg-orange-500/20 rounded-3xl blur-2xl animate-pulse" />
            <img
              src="./1522a1ec-a823-4b8d-b840-956fc29e2cf8.jpg"
              alt="Só Questões de Concursos"
              className="relative w-40 h-40 md:w-48 md:h-48 rounded-3xl shadow-2xl shadow-orange-500/20 ring-1 ring-white/10"
            />
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-3xl p-7 md:p-9 shadow-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-2">
            Bem-vindo!
          </h1>
          <p className="text-gray-400 text-center mb-8 font-medium">
            Faça login para acessar a plataforma
          </p>

          {/* Login apenas com usuário e senha */}
          <div className="mb-6" style={{ display: 'none' }}>
            <button
              onClick={() => handleSocialLogin("google")}
              disabled={socialLoading !== null || isSubmitting}
              className="w-full py-4 px-5 bg-white/90 hover:bg-white text-gray-800 font-semibold rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {socialLoading === "google" ? (
                <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continuar com Google
            </button>

            <div className="relative">
              <button
                onClick={() => handleSocialLogin("facebook")}
                disabled={socialLoading !== null || isSubmitting}
                className="w-full py-4 px-5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                {socialLoading === "facebook" ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FacebookIcon />
                )}
                Continuar com Facebook
              </button>
              <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-amber-500 text-[10px] text-white font-bold rounded-full">
                DEMO
              </span>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-2">
              ℹ️ Configure as credenciais do Google para ativar o login social.
            </p>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-sm text-gray-500 bg-[#0d1219]">ou entre com sua conta</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                required
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                Senha
              </label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
              />
            </div>

            {error && (
              <div className="glass-card rounded-2xl p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-sm text-center font-medium animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || socialLoading !== null}
              className="w-full py-4.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-xl shadow-orange-500/25 text-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* Registration link */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400 mb-4">
              Não tem uma conta?{" "}
              <Link href="/registro" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
                Cadastre-se
              </Link>
            </p>
          </div>


        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
}

export default LoginPage;
