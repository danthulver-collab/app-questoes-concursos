import { Link, useLocation } from 'wouter';

export function SidebarMenu() {
  const [location] = useLocation();
  
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
              {/* Efeito de brilho no hover */}
              <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full ${item.active ? '' : 'group-hover:animate-shimmer'} rounded-xl`}></div>
              
              {/* Ícone */}
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110 relative z-10">
                {item.icon}
              </span>
              
              {/* Label - aparece apenas no hover para não logados */}
              <span className={`text-sm font-semibold whitespace-nowrap relative z-10 transition-all duration-300 ${
                item.active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto overflow-hidden'
              }`}>
                {item.label}
              </span>
              
              {/* Indicador de ativo */}
              {item.active && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              )}
            </button>
          </Link>
        ))}
      </div>

      {/* Estilos de animação */}
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
