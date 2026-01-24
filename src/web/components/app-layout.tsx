import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../lib/auth-context-supabase";
import { getUserPlan, isSuperAdmin, getRemainingQuestions } from "../lib/access-control";
import { 
  Home, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  Crown,
  Shield,
  ChevronRight
} from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const userId = user?.email || user?.username || "";
  const userPlan = getUserPlan(userId) || "free";
  const isAdmin = user?.email === 'danthulver@gmail.com' || user?.username === 'admin' || isSuperAdmin(userId);
  const remaining = getRemainingQuestions(userId);

  const menuItems = [
    { icon: Home, label: "Início", path: "/", badge: null },
    { icon: BarChart3, label: "Estatísticas", path: "/dashboard", badge: null },
    ...(isAdmin ? [{ icon: Shield, label: "Admin", path: "/admin", badge: null }] : []),
  ];

  const menuItemsRight = [
    { icon: Home, label: "Dashboard", path: "/dashboard", badge: null },
    { icon: Settings, label: "Configurações", path: "/configuracoes", badge: null },
  ];

  const planInfo = {
    free: { name: "Grátis", color: "gray", icon: null },
    trial: { name: "Trial", color: "blue", icon: Sparkles },
    individual: { name: "Individual", color: "purple", icon: Crown },
    plus: { name: "Plus", color: "amber", icon: Crown },
  }[userPlan];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-72 border-r border-white/10 bg-slate-900/50 backdrop-blur">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Só Questões</h1>
              <p className="text-xs text-gray-400">de Concursos</p>
            </div>
          </div>
        </div>

        {/* User Info & Plan */}
        <div className="p-4">
          <div className="glass-card rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold">
                {user?.nome?.[0] || user?.username?.[0] || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.nome || user?.username}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            
            {/* Plan Badge */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-${planInfo.color}-500/10 border border-${planInfo.color}-500/20`}>
              {planInfo.icon && <planInfo.icon className={`w-4 h-4 text-${planInfo.color}-400`} />}
              <span className={`text-xs font-semibold text-${planInfo.color}-400`}>
                Plano {planInfo.name}
              </span>
            </div>

            {/* Daily Limit (Free/Trial) */}
            {(userPlan === "free" || userPlan === "trial") && remaining !== Infinity && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400">Questões hoje</span>
                  <span className="text-xs font-semibold text-white">{remaining} restantes</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-800 transition-all"
                    style={{ width: `${(remaining / (userPlan === "trial" ? 50 : 5)) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <a className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all group
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                `}>
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Upgrade CTA (if free) */}
        {userPlan === "free" && (
          <div className="p-4">
            <Link href="/planos">
              <a className="block p-4 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 hover:scale-105 transition-transform">
                <Crown className="w-6 h-6 text-white mb-2" />
                <p className="text-sm font-bold text-white">Upgrade para Plus</p>
                <p className="text-xs text-white/80">Questões ilimitadas + IA</p>
              </a>
            </Link>
          </div>
        )}

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 w-72 bg-slate-900 z-50 transform transition-transform lg:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Same content as desktop sidebar */}
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Só Questões</h1>
                <p className="text-xs text-gray-400">de Concursos</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Rest of mobile sidebar content (same as desktop) */}
          <div className="p-4">
            <div className="glass-card rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                  {user?.nome?.[0] || user?.username?.[0] || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.nome || user?.username}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <a 
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-4 rounded-xl transition-all transform hover:scale-105
                      ${isActive 
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }
                      ${(item as any).highlight ? 'ring-2 ring-orange-500/50 font-bold text-lg' : 'font-medium'}
                    `}
                  >
                    <Icon className={`${(item as any).highlight ? 'w-6 h-6' : 'w-5 h-5'}`} />
                    <span className="flex-1">{item.label}</span>
                    {(item as any).highlight && <span className="text-xs bg-white/20 px-2 py-1 rounded-full">HOT</span>}
                  </a>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-white/10">
          <div className="flex items-center justify-between p-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-white">Só Questões</h1>
            </div>
            <div className="w-6" />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
