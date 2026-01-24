import { Link, useLocation } from "wouter";
import { useAuth } from "../lib/auth-context-supabase";
import { useState, useEffect } from "react";
import { getUserPlan, isAdmin, type PlanType } from "../lib/access-control";
import { TrialBadge } from "./trial-badge";
import { getActiveUserRequest } from "../lib/plan-requests";

interface AppHeaderProps {
  showAdmin?: boolean;
  showBack?: boolean;
  backUrl?: string;
  title?: string;
}

const REGISTERED_USERS_KEY = "quiz_registered_users";

export function AppHeader({ showAdmin = false, showBack = false, backUrl = "/", title }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [location, setLocation] = useLocation();
  const [userPlan, setUserPlan] = useState<PlanType | null>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [hasActivePedido, setHasActivePedido] = useState(false);
  
  useEffect(() => {
    if (user?.username) {
      const plan = getUserPlan(user.username);
      setUserPlan(plan);
      // Check admin by username OR email (for Google login users)
      setUserIsAdmin(isAdmin(user.username) || isAdmin(user.email || ''));
      
      // Verificar se tem pedido ativo
      const userId = user.email || user.username;
      const activePedido = getActiveUserRequest(userId);
      setHasActivePedido(!!activePedido);
      
      // Load profile photo and name from localStorage
      try {
        const registeredUsers = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || "[]");
        const foundUser = registeredUsers.find((u: any) => 
          u.username === user.username || u.email === user.username
        );
        
        if (foundUser) {
          if (foundUser.fotoPerfil) {
            setProfilePhoto(foundUser.fotoPerfil);
          }
          if (foundUser.nome) {
            setUserName(foundUser.nome);
          }
        }
      } catch (e) {
        console.error("Error loading profile photo:", e);
      }
    }
  }, [user]);

  const getProviderIcon = () => {
    if (!user?.provider || user.provider === "local") return null;
    if (user.provider === "google") return (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    );
    if (user.provider === "facebook") return (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    );
    return null;
  };

  return (
    <header className="sticky top-0 z-20 glass border-b border-white/5">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-3 md:p-4">
        <div className="flex items-center gap-4">
          {showBack ? (
            <Link 
              href={backUrl} 
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium px-3 py-2 rounded-xl hover:bg-white/5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-all group">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/30 rounded-xl blur group-hover:bg-orange-500/40 transition-all" />
                <img
                  src="./1522a1ec-a823-4b8d-b840-956fc29e2cf8.jpg"
                  alt="Logo"
                  className="relative w-10 h-10 md:w-11 md:h-11 rounded-xl object-cover ring-1 ring-white/10"
                />
              </div>
              <span className="hidden sm:block font-bold text-white text-lg">
                Só Questões
              </span>
            </Link>
          )}
          
          {title && (
            <>
              <div className="hidden sm:block h-6 w-px bg-white/10" />
              <span className="font-semibold text-gray-300">{title}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Trial Badge */}
          {userPlan === "trial" && user && (
            <div className="hidden sm:block">
              <TrialBadge userId={user.email || user.username} variant="compact" />
            </div>
          )}
          
          {/* AI Badge for Plus users */}
          {userPlan === "plus" && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-xs font-bold text-purple-300">
              <span>✨</span>
              <span>IA Inclusa</span>
            </div>
          )}
          
          {showAdmin && (
            <>
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-all px-3 py-2.5 rounded-xl hover:bg-white/5 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="hidden sm:inline">Meu Perfil</span>
              </Link>
              {/* Admin link only shown to admins */}
              {userIsAdmin && (
                <Link 
                  href="/admin" 
                  className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-all px-3 py-2.5 rounded-xl hover:bg-amber-500/10 font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
            </>
          )}
          
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 md:gap-3 glass-card px-3 py-2 rounded-xl hover:bg-white/[0.08] transition-all"
              >
                <div className="relative">
                  {profilePhoto ? (
                    <img 
                      src={profilePhoto} 
                      alt="Foto de perfil" 
                      className="w-8 h-8 rounded-lg object-cover ring-2 ring-orange-500/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-sm font-bold">
                      {(userName || user.username).charAt(0).toUpperCase()}
                    </div>
                  )}
                  {userPlan === "plus" && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[8px]">
                      ✨
                    </div>
                  )}
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-300 max-w-[120px] truncate">
                    {userName || user.username}
                  </span>
                  {userPlan && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      userPlan === "plus" 
                        ? "bg-amber-500/20 text-amber-400" 
                        : "bg-orange-500/20 text-orange-400"
                    }`}>
                      {userPlan === "plus" ? "Plus" : "Individual"}
                    </span>
                  )}
                  {getProviderIcon()}
                </div>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowUserMenu(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-56 glass-card rounded-2xl py-2 shadow-2xl z-20 animate-scale-in origin-top-right">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                        {getProviderIcon()}
                        {user.provider === "google" && "Conectado via Google"}
                        {user.provider === "facebook" && "Conectado via Facebook"}
                        {(!user.provider || user.provider === "local") && "Conta local"}
                      </p>
                      {userPlan && (
                        <div className={`mt-2 px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1 ${
                          userPlan === "plus" 
                            ? "bg-amber-500/20 text-amber-400" 
                            : "bg-orange-500/20 text-orange-400"
                        }`}>
                          <span>{userPlan === "plus" ? "✨" : "⭐"}</span>
                          Plano {userPlan === "plus" ? "Plus" : "Individual"}
                        </div>
                      )}
                    </div>
                    <div className="py-2">
                      {/* Task 86: Dashboard */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setLocation("/dashboard");
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        📊 Dashboard
                      </button>
                      
                      {/* Task 86: Edit Profile */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setLocation("/perfil/editar");
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        📝 Editar Perfil
                      </button>
                      
                      {/* Task 86: Meus Planos */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setLocation("/planos");
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        {userPlan === "individual" ? "⭐ Fazer Upgrade" : "⭐ Meus Planos"}
                      </button>
                      
                      {/* Task 86: Fale Conosco */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowContactModal(true);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        💬 Fale Conosco
                      </button>
                      
                      <div className="border-t border-white/10 my-2" />
                      
                      {/* Logout */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        🚪 Sair da conta
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Task 86: Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-3xl p-6 md:p-8 max-w-md w-full animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Fale Conosco</h3>
              <p className="text-gray-400">Estamos aqui para ajudar!</p>
            </div>
            
            {/* WhatsApp Button */}
            <a
              href={`https://api.whatsapp.com/send?phone=5521980645070&text=${encodeURIComponent(`Olá! Preciso de ajuda.\n\nMeu usuário: ${user?.username || 'N/A'}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 mb-4 shadow-lg shadow-green-500/30"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Falar via WhatsApp
            </a>
            
            {/* Contact Info */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">📧 Email:</span>
                  <span className="text-white">contato@soquestoes.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">📱 WhatsApp:</span>
                  <span className="text-white">(21) 98064-5070</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">🕐 Horário:</span>
                  <span className="text-white">Seg-Sex, 9h às 18h</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowContactModal(false)}
              className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
