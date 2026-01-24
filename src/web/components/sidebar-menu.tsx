import { Link, useLocation } from 'wouter';
import { useAuth } from '../lib/auth-context-supabase';
import { getUserPlan } from '../lib/access-control';

export function SidebarMenu() {
  const [location] = useLocation();
  const { user } = useAuth();
  const userId = user?.email || user?.username || '';
  const userPlan = getUserPlan(userId);
  const isFree = !userPlan || userPlan === 'free' || userPlan === 'gratuito';
  
  const menuItems = [
    { 
      label: 'Início', 
      icon: '🏠', 
      path: '/dashboard',
      active: location === '/dashboard'
    },
    { 
      label: 'Estatísticas', 
      icon: '📊', 
      path: '/dashboard',
      active: location.includes('/stats')
    },
    { 
      label: 'Configurações', 
      icon: '⚙️', 
      path: '/configuracoes',
      active: location === '/configuracoes'
    },
  ];

  return (
    <nav className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden md:block">
      <div className="flex flex-col gap-3 bg-[#1a1f2e]/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl">
        {menuItems.map((item, index) => (
          <Link key={item.label} href={item.path}>
            <button
              style={{ animationDelay: `${index * 100}ms` }}
              className={`
                group relative flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-300 ease-out
                animate-fade-in w-full
                ${item.active
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:scale-105'
                }
              `}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full ${item.active ? '' : 'group-hover:animate-shimmer'} rounded-xl`}></div>
              
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110 relative z-10">
                {item.icon}
              </span>
              
              <span className={`text-sm font-semibold whitespace-nowrap relative z-10 transition-all duration-300 ${
                item.active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto overflow-hidden'
              }`}>
                {item.label}
              </span>
              
              {item.active && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              )}
            </button>
          </Link>
        ))}
        
        {/* Botão Upgrade Plus - só grátis */}
        {isFree && (
          <Link href="/planos">
            <button className="group relative flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/50 hover:scale-110 active:scale-95 transition-all w-full">
              <span className="text-2xl">⭐</span>
              <span className="text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto overflow-hidden transition-all duration-300">
                Upgrade
              </span>
              <div className="absolute -right-1 -top-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
            </button>
          </Link>
        )}
        
        {/* Botão WhatsApp */}
        <a
          href="https://wa.me/5521980645070?text=Olá!%20Vim%20do%20site%20Só%20Questões"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50 hover:scale-110 active:scale-95 transition-all w-full"
        >
          <span className="text-2xl animate-bounce">💬</span>
          <span className="text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto overflow-hidden transition-all duration-300">
            Suporte
          </span>
          <div className="absolute -right-1 -top-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          <div className="absolute -right-1 -top-1 w-3 h-3 bg-red-500 rounded-full"></div>
        </a>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmer {
          to { transform: translateX(200%); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
        .animate-shimmer {
          animation: shimmer 1s ease-in-out;
        }
      `}</style>
    </nav>
  );
}
