import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { AppHeader } from "../components/app-header";
import { useAuth } from "../lib/auth-context-supabase";
import { PasswordInput } from "../components/password-input";

interface UserData {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  fotoPerfil: string | null;
}

const REGISTERED_USERS_KEY = "quiz_registered_users";

export default function PerfilEditarPage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [userData, setUserData] = useState<UserData>({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    fotoPerfil: null
  });
  
  const [passwords, setPasswords] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: ""
  });
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }
    
    // Load user data from localStorage
    const registeredUsers = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || "[]");
    const foundUser = registeredUsers.find((u: any) => u.username === user.username || u.email === user.username);
    
    if (foundUser) {
      setUserData({
        nome: foundUser.nome || foundUser.username || "",
        email: foundUser.email || "",
        telefone: foundUser.telefone || "",
        cpf: foundUser.cpf || "",
        fotoPerfil: foundUser.fotoPerfil || null
      });
      if (foundUser.fotoPerfil) {
        setPhotoPreview(foundUser.fotoPerfil);
      }
    }
  }, [user, setLocation]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("A foto deve ter no máximo 2MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoPreview(base64);
        setUserData(prev => ({ ...prev, fotoPerfil: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Update user data in localStorage
      const registeredUsers = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || "[]");
      const userIndex = registeredUsers.findIndex((u: any) => u.username === user.username || u.email === user.username);
      
      if (userIndex !== -1) {
        registeredUsers[userIndex] = {
          ...registeredUsers[userIndex],
          nome: userData.nome,
          email: userData.email,
          telefone: userData.telefone,
          cpf: userData.cpf,
          fotoPerfil: userData.fotoPerfil
        };
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
        setSuccess("Perfil atualizado com sucesso!");
      }
    } catch (err) {
      setError("Erro ao salvar o perfil. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    
    if (passwords.novaSenha !== passwords.confirmarSenha) {
      setError("As senhas não coincidem");
      return;
    }
    
    if (passwords.novaSenha.length < 6) {
      setError("A nova senha deve ter no mínimo 6 caracteres");
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const registeredUsers = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || "[]");
      const userIndex = registeredUsers.findIndex((u: any) => u.username === user.username || u.email === user.username);
      
      if (userIndex !== -1) {
        // Verify current password
        if (registeredUsers[userIndex].password !== passwords.senhaAtual) {
          setError("Senha atual incorreta");
          return;
        }
        
        registeredUsers[userIndex].password = passwords.novaSenha;
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
        
        setPasswords({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
        setSuccess("Senha alterada com sucesso!");
      }
    } catch (err) {
      setError("Erro ao alterar a senha. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
      
      <AppHeader showAdmin />
      
      <main className="flex-1 flex flex-col items-center py-12 px-4 relative z-10">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="mb-8 animate-slide-in-up">
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </Link>
            <h1 className="text-3xl md:text-4xl font-black">
              <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                📝 Editar Perfil
              </span>
            </h1>
            <p className="text-gray-400 mt-2">Atualize suas informações pessoais</p>
          </div>
          
          {/* Success/Error messages */}
          {success && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 animate-slide-in-up">
              ✅ {success}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 animate-slide-in-up">
              ⚠️ {error}
            </div>
          )}
          
          {/* Photo Upload Section */}
          <div className="glass-card rounded-3xl p-6 md:p-8 mb-6 animate-slide-in-up">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span>📷</span>
              Foto de Perfil
            </h2>
            
            <div className="flex items-center gap-6">
              {/* Photo Preview */}
              <div className="relative">
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt="Foto de perfil" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-orange-500/30"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500/30 to-amber-500/30 flex items-center justify-center border-4 border-orange-500/30">
                    <span className="text-3xl">👤</span>
                  </div>
                )}
              </div>
              
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Alterar Foto
                </button>
                <p className="text-gray-500 text-xs mt-2">JPG, PNG ou GIF. Máx 2MB</p>
              </div>
            </div>
          </div>
          
          {/* Personal Info Section */}
          <div className="glass-card rounded-3xl p-6 md:p-8 mb-6 animate-slide-in-up" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span>⚙️</span>
              Dados Pessoais
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={userData.nome}
                  onChange={(e) => setUserData(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="seu@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Telefone</label>
                <input
                  type="tel"
                  value={userData.telefone}
                  onChange={(e) => setUserData(prev => ({ ...prev, telefone: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="(00) 00000-0000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">CPF (opcional)</label>
                <input
                  type="text"
                  value={userData.cpf}
                  onChange={(e) => setUserData(prev => ({ ...prev, cpf: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="000.000.000-00"
                />
              </div>
              
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Change Password Section */}
          <div className="glass-card rounded-3xl p-6 md:p-8 animate-slide-in-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span>🔒</span>
              Alterar Senha
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Senha Atual</label>
                <PasswordInput
                  value={passwords.senhaAtual}
                  onChange={(e) => setPasswords(prev => ({ ...prev, senhaAtual: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="Digite sua senha atual"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nova Senha</label>
                <PasswordInput
                  value={passwords.novaSenha}
                  onChange={(e) => setPasswords(prev => ({ ...prev, novaSenha: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="Digite a nova senha"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Confirmar Nova Senha</label>
                <PasswordInput
                  value={passwords.confirmarSenha}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="Confirme a nova senha"
                />
              </div>
              
              <button
                onClick={handleChangePassword}
                disabled={saving || !passwords.senhaAtual || !passwords.novaSenha || !passwords.confirmarSenha}
                className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Alterando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Alterar Senha
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
