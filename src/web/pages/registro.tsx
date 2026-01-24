import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "../lib/auth-context-supabase";
import { PasswordInput } from "../components/password-input";
import { notifyUserRegistration, showBrowserNotification } from "../lib/notifications";

// CPF Validation
const validateCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleaned[10]);
};

// Email Validation
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Phone mask for Brazilian format
const formatPhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  if (cleaned.length <= 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

// CPF mask
const formatCPF = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
};

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  senha: string;
  confirmarSenha: string;
}

interface FormErrors {
  nome?: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  senha?: string;
  confirmarSenha?: string;
}

function RegistroPage() {
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    senha: "",
    confirmarSenha: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const [, setLocation] = useLocation();

  const handleChange = (field: keyof FormData, value: string) => {
    let formattedValue = value;
    
    if (field === "telefone") {
      formattedValue = formatPhone(value);
    } else if (field === "cpf") {
      formattedValue = formatCPF(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nome.trim() || formData.nome.trim().length < 3) {
      newErrors.nome = "Nome deve ter pelo menos 3 caracteres";
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = "Email inválido";
    }

    const phoneDigits = formData.telefone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      newErrors.telefone = "Telefone inválido (DDD + número)";
    }

    if (formData.cpf && !validateCPF(formData.cpf)) {
      newErrors.cpf = "CPF inválido";
    }

    if (formData.senha.length < 6) {
      newErrors.senha = "Senha deve ter pelo menos 6 caracteres";
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = "As senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);

    const result = await register({
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      cpf: formData.cpf || undefined,
      senha: formData.senha,
    });

    if (result.success) {
      // 🔔 NOTIFICAR ADMIN sobre novo registro
      notifyUserRegistration(
        formData.nome,
        formData.email,
        formData.email // userId é o email
      );
      
      // Notificação do navegador
      showBrowserNotification(
        "👤 Novo Usuário Registrado",
        `${formData.nome} criou uma conta`
      );
      
      setSuccess(true);
      setTimeout(() => setLocation("/login"), 2000);
    } else {
      setErrors({ email: result.error || "Erro ao criar conta. Tente novamente." });
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse" />
        
        <div className="relative z-10 max-w-md mx-auto animate-scale-in">
          <div className="glass-card rounded-3xl p-8 text-center">
            <div className="text-7xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold text-white mb-4">Conta criada com sucesso!</h1>
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📧</span>
                <div className="text-left">
                  <p className="text-blue-300 font-semibold mb-1">Email de confirmação enviado!</p>
                  <p className="text-gray-400 text-sm">
                    Verifique sua caixa de entrada em <span className="text-white font-medium">{formData.email}</span>
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    💡 Não esquece de verificar a pasta de spam
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm">Redirecionando para login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-[120px]" />

      <div className="w-full max-w-lg relative z-10 animate-slide-in-up">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 w-28 h-28 bg-orange-500/20 rounded-3xl blur-2xl animate-pulse" />
            <img
              src="./1522a1ec-a823-4b8d-b840-956fc29e2cf8.jpg"
              alt="Só Questões de Concursos"
              className="relative w-28 h-28 rounded-3xl shadow-2xl shadow-orange-500/20 ring-1 ring-white/10"
            />
          </div>
        </div>

        {/* Register Card */}
        <div className="glass-card rounded-3xl p-7 md:p-9 shadow-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-2">
            Criar Conta
          </h1>
          <p className="text-gray-400 text-center mb-8 font-medium">
            Preencha seus dados para começar
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome Completo */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Nome Completo <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                placeholder="Seu nome completo"
                className={`w-full px-5 py-4 bg-white/5 border rounded-2xl text-white placeholder-gray-500 focus:outline-none transition-all font-medium ${
                  errors.nome ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                }`}
              />
              {errors.nome && <p className="text-red-400 text-xs mt-1.5">{errors.nome}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="seu@email.com"
                className={`w-full px-5 py-4 bg-white/5 border rounded-2xl text-white placeholder-gray-500 focus:outline-none transition-all font-medium ${
                  errors.email ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                }`}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Telefone <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => handleChange("telefone", e.target.value)}
                placeholder="(11) 99999-9999"
                className={`w-full px-5 py-4 bg-white/5 border rounded-2xl text-white placeholder-gray-500 focus:outline-none transition-all font-medium ${
                  errors.telefone ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                }`}
              />
              {errors.telefone && <p className="text-red-400 text-xs mt-1.5">{errors.telefone}</p>}
            </div>

            {/* CPF */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                CPF <span className="text-gray-500 text-xs font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => handleChange("cpf", e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
                className={`w-full px-5 py-4 bg-white/5 border rounded-2xl text-white placeholder-gray-500 focus:outline-none transition-all font-medium ${
                  errors.cpf ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                }`}
              />
              {errors.cpf && <p className="text-red-400 text-xs mt-1.5">{errors.cpf}</p>}
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Senha <span className="text-red-400">*</span>
              </label>
              <PasswordInput
                value={formData.senha}
                onChange={(e) => handleChange("senha", e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className={`w-full px-5 py-4 bg-white/5 border rounded-2xl text-white placeholder-gray-500 focus:outline-none transition-all font-medium ${
                  errors.senha ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                }`}
              />
              {errors.senha && <p className="text-red-400 text-xs mt-1.5">{errors.senha}</p>}
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Confirmar Senha <span className="text-red-400">*</span>
              </label>
              <PasswordInput
                value={formData.confirmarSenha}
                onChange={(e) => handleChange("confirmarSenha", e.target.value)}
                placeholder="Repita sua senha"
                className={`w-full px-5 py-4 bg-white/5 border rounded-2xl text-white placeholder-gray-500 focus:outline-none transition-all font-medium ${
                  errors.confirmarSenha ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                }`}
              />
              {errors.confirmarSenha && <p className="text-red-400 text-xs mt-1.5">{errors.confirmarSenha}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-xl shadow-orange-500/25 text-lg mt-6"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Criando conta...
                </span>
              ) : (
                "Criar Conta"
              )}
            </button>
          </form>

          {/* Link to login */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistroPage;
