import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../lib/auth-context-supabase';
import { getUserPlan, getRemainingQuestions, isSuperAdmin } from '../lib/access-control';
import { supabase } from '../lib/supabase';
import { LogOut } from 'lucide-react';

export function SidebarMenu() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const userId = user?.email || user?.username || '';
  
  // 🔥 Buscar plano do Supabase dinamicamente
  const [supabasePlan, setSupabasePlan] = useState<string | null>(null);
  const userPlan = supabasePlan || getUserPlan(userId) || 'free';
  
  const remaining = getRemainingQuestions(userId);
  // Verificar admin de múltiplas formas
  const isAdmin = isSuperAdmin(userId) || 
    user?.username?.toLowerCase() === 'admin' || 
    user?.email?.toLowerCase() === 'admin' ||
    userId.toLowerCase() === 'admin';
  const isFree = !isAdmin && (!userPlan || userPlan === 'free' || userPlan === 'gratuito');
  
  // 🔥 Buscar plano do Supabase
  useEffect(() => {
    if (!user?.email) return;
    
    const fetchPlan = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('email', user.email)
          .single();
        
        if (profile?.plan) {
          setSupabasePlan(profile.plan);
        }
      } catch (e) {
        console.error('Erro ao buscar plano:', e);
      }
    };
    
    fetchPlan();
    const interval = setInterval(fetchPlan, 3000);
    return () => clearInterval(interval);
  }, [user?.email]);
  
  const menuItems = [
    { label: 'Início', icon: '🏠', path: '/' },
    { label: 'Estatísticas', icon: '📊', path: '/dashboard' },
    { label: 'Configurações', icon: '⚙️', path: '/configuracoes' },
  ];

  return (
    <nav className="fixed left-4 top-4 z-50 hidden md:block w-56">
      <div className="bg-[#1a1f2e]/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Logo no topo */}
        <Link href="/">
          <div className="p-4 border-b border-white/10 hover:bg-white/5 transition-all cursor-pointer flex justify-center">
            <img src="/logo.png" alt="Só Questões" className="h-16 w-auto" />
          </div>
        </Link>
        
        {/* Card do Usuário */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {user?.email || 'usuario@email.com'}
              </p>
              <p className="text-gray-400 text-xs">{isAdmin ? 'Administrador' : 'Seu email'}</p>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-white/5 rounded-lg text-center">
            <p className={`text-xs font-bold ${
              isAdmin ? 'text-purple-400' :
              userPlan === 'plus' ? 'text-amber-400' : 
              userPlan === 'individual' ? 'text-orange-400' : 
              'text-emerald-400'
            }`}>
              {isAdmin ? '👑 Administrador' :
               userPlan === 'plus' ? '⭐ Plano Plus' : 
               userPlan === 'individual' ? '📦 Plano Individual' : 
               '🆓 Plano Grátis'}
            </p>
          </div>
          {isAdmin ? (
            <div className="mt-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-center">
              <p className="text-purple-400 text-xs font-bold">
                ∞ questões ilimitadas
              </p>
            </div>
          ) : isFree && remaining !== null ? (
            <div className="mt-2 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-lg text-center">
              <p className="text-orange-400 text-xs font-bold">
                {remaining} questões restantes
              </p>
            </div>
          ) : null}
        </div>
        
        {/* Menu Items */}
        <div className="p-3 space-y-2">
          {menuItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.label} href={item.path}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              </Link>
            );
          })}
        </div>
        
        {/* Botões extras */}
        <div className="p-3 space-y-2 border-t border-white/10">
          {/* Upgrade - só grátis */}
          {isFree && (
            <Link href="/planos">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105 transition-all shadow-lg relative">
                <span className="text-xl">⭐</span>
                <span className="font-medium text-sm">Upgrade</span>
                <div className="absolute -right-1 -top-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
              </button>
            </Link>
          )}
          
          {/* WhatsApp */}
          <a
            href="https://wa.me/5521980645070?text=Olá!%20Vim%20do%20site%20Só%20Questões"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:scale-105 transition-all shadow-lg relative"
          >
            <span className="text-xl animate-bounce">💬</span>
            <span className="font-medium text-sm">Suporte</span>
            <div className="absolute -right-1 -top-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            <div className="absolute -right-1 -top-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </a>
          
          {/* Botão Sair */}
          <button
            onClick={async () => {
              if (confirm('Deseja sair?')) {
                await logout();
                window.location.href = '/login';
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 hover:scale-105 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sair</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
