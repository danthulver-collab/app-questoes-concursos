import { useEffect } from "react";
import { BookOpen } from "lucide-react";

function AuthCallbackPage() {
  useEffect(() => {
    console.log('[Callback] Página de callback carregada');
    console.log('[Callback] URL completa:', window.location.href);
    
    // O Supabase detecta automaticamente o hash e processa via onAuthStateChange
    // Apenas aguarda e redireciona
    const timer = setTimeout(() => {
      console.log('[Callback] Redirecionando para home após 3 segundos...');
      window.location.href = "/";
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-2xl shadow-blue-500/50">
            <BookOpen className="w-9 h-9 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Só Questões</h1>
            <p className="text-sm text-gray-400">de Concursos</p>
          </div>
        </div>

        {/* Loading spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-blue-400/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>

        {/* Message */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-white">
            Autenticando...
          </h2>
          <p className="text-gray-400 max-w-sm">
            Aguarde enquanto validamos suas credenciais
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}

export default AuthCallbackPage;
