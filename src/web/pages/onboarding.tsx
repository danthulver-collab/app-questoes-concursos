import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../lib/auth-context-supabase";
import { getQuizData, type QuizData, getAllAreas, getCarreirasByArea, getCarreiraById, getAreaById, getMateriasByArea } from "../lib/quiz-store";
import { setUserPlan, grantConcursoAccess, setUserPackageStatus, PLAN_LIMITS, type PlanType } from "../lib/access-control";
import { savePackageRequest as savePackageRequestSupabase } from "../lib/supabase-package-requests";
import { notifyPackageRequest, showBrowserNotification } from "../lib/notifications";
import { AreaCarreiraSelector } from "../components/area-carreira-selector";

export type { PlanType };

interface OnboardingData {
  areaId?: string;
  carreiraId?: string;
  concursoObjetivo: string;
  cargoDesejado: string;
  bancaOrganizadora: string;
  materias: string;
  plano: PlanType;
}

const BANCAS = [
  "CESPE / CEBRASPE",
  "FCC",
  "FGV",
  "VUNESP",
  "CESGRANRIO",
  "IBFC",
  "Quadrix",
  "IDECAN",
  "IADES",
  "Outra"
];

const MATERIAS_DISPONIVEIS = [
  "Português",
  "Matemática",
  "Raciocínio Lógico",
  "Inglês",
  "Informática",
  "Direito Constitucional",
  "Direito Administrativo",
  "Direito Penal",
  "Direito Civil",
  "Direito Tributário",
  "Direito do Trabalho",
  "Direito Previdenciário",
  "História do Brasil",
  "Geografia",
  "Atualidades",
  "Ética no Serviço Público",
  "Administração Pública",
  "Contabilidade",
  "Economia",
  "Estatística",
  "Física",
  "Química",
  "Biologia"
];

const CARGOS_DISPONIVEIS = [
  "Analista",
  "Técnico",
  "Auxiliar",
  "Assistente",
  "Agente",
  "Auditor",
  "Fiscal",
  "Professor",
  "Enfermeiro",
  "Médico",
  "Engenheiro",
  "Advogado",
  "Procurador",
  "Promotor",
  "Juiz",
  "Delegado",
  "Policial",
  "Bombeiro",
  "Outro"
];

const ONBOARDING_KEY = "quiz_user_onboarding";

export const getOnboardingData = (userId: string): OnboardingData | null => {
  try {
    const stored = localStorage.getItem(`${ONBOARDING_KEY}_${userId}`);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const saveOnboardingData = (userId: string, data: OnboardingData) => {
  localStorage.setItem(`${ONBOARDING_KEY}_${userId}`, JSON.stringify(data));
  
  // Save plan to access control system
  setUserPlan(userId, data.plano, data.concursoObjetivo);
  
  // Grant access to the concurso (for individual plan, this sets the only concurso they can access)
  // For plus plan, they have access to all concursos anyway
  if (data.plano === "individual") {
    grantConcursoAccess(userId, data.concursoObjetivo);
  }
  
  // Update user profile with onboardingCompleto flag and plan
  try {
    const registeredUsers = JSON.parse(localStorage.getItem("quiz_registered_users") || "[]");
    const updatedUsers = registeredUsers.map((u: { email: string }) => {
      if (u.email === userId) {
        return { ...u, onboardingCompleto: true, plano: data.plano };
      }
      return u;
    });
    localStorage.setItem("quiz_registered_users", JSON.stringify(updatedUsers));
  } catch {}
};

export const hasCompletedOnboarding = (userId: string): boolean => {
  return getOnboardingData(userId) !== null;
};

export const getUserPlan = (userId: string): PlanType | null => {
  const data = getOnboardingData(userId);
  return data?.plano || null;
};

interface PlanCardProps {
  type: PlanType;
  selected: boolean;
  onSelect: () => void;
  recommended?: boolean;
}

const PlanCard = ({ type, selected, onSelect, recommended }: PlanCardProps) => {
  const planInfo = PLAN_LIMITS[type];
  const isFree = type === "free";
  const isPlus = type === "plus";
  
  const colorScheme = {
    free: {
      border: "border-emerald-400",
      bg: "from-emerald-500/20 to-green-500/10",
      shadow: "shadow-emerald-500/20",
      text: "text-emerald-400",
      priceText: "text-emerald-300",
      checkColor: "text-emerald-400",
      gradientBg: "bg-gradient-to-r from-emerald-500 to-green-500",
      badge: "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
    },
    individual: {
      border: "border-orange-400",
      bg: "from-orange-500/20 to-amber-500/10",
      shadow: "shadow-orange-500/20",
      text: "text-orange-400",
      priceText: "text-orange-300",
      checkColor: "text-orange-400",
      gradientBg: "bg-gradient-to-r from-orange-500 to-amber-500",
      badge: "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
    },
    plus: {
      border: "border-amber-400",
      bg: "from-amber-500/20 to-yellow-500/10",
      shadow: "shadow-amber-500/20",
      text: "text-amber-400",
      priceText: "text-amber-300",
      checkColor: "text-amber-400",
      gradientBg: "bg-gradient-to-r from-amber-400 to-yellow-400",
      badge: "bg-gradient-to-r from-amber-400 to-yellow-400 text-gray-900"
    }
  };
  
  const colors = colorScheme[type];
  const badges: Record<PlanType, string> = {
    free: "🆓 GRÁTIS",
    individual: "⭐ POPULAR",
    plus: "✨ COMPLETO"
  };
  
  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-2xl p-5 transition-all duration-300 border-2 ${
        selected 
          ? `${colors.border} bg-gradient-to-br ${colors.bg} shadow-xl ${colors.shadow}` 
          : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
      } ${recommended ? "scale-105 lg:scale-110" : ""}`}
    >
      {/* Badge */}
      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${colors.badge}`}>
        {badges[type]}
      </div>
      
      {/* Recommended tag */}
      {recommended && (
        <div className="absolute -top-3 -right-2 px-2 py-1 bg-red-500 rounded-full text-[10px] font-bold text-white">
          MELHOR
        </div>
      )}
      
      {/* Selection indicator */}
      <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
        selected ? `${colors.border} ${colors.gradientBg}` : "border-white/30"
      }`}>
        {selected && (
          <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      
      {/* Plan name */}
      <h3 className={`text-lg font-bold mt-3 mb-2 ${colors.text}`}>
        Plano {planInfo.name}
      </h3>
      
      {/* Price */}
      <div className="mb-3">
        {isFree ? (
          <span className={`text-3xl font-black ${colors.priceText}`}>Grátis</span>
        ) : (
          <>
            <span className={`text-3xl font-black ${colors.priceText}`}>
              R$ {planInfo.price}
            </span>
            <span className="text-gray-400 text-sm">/mês</span>
          </>
        )}
      </div>
      
      {/* Features */}
      <ul className="space-y-1.5">
        {planInfo.features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2 text-xs text-gray-300">
            <span className={colors.checkColor}>✓</span> {feature}
          </li>
        ))}
      </ul>
      
      {/* CTA */}
      <div className={`mt-4 py-2 rounded-xl text-center font-semibold text-sm transition-all ${
        selected ? `${colors.gradientBg} text-gray-900` : "bg-white/10 text-gray-400"
      }`}>
        {selected ? "Selecionado" : "Selecionar"}
      </div>
    </div>
  );
};

// Types for package request flow
interface PackageRequest {
  userId: string;
  areaId?: string;
  areaNome?: string;
  carreiraId?: string;
  carreiraNome?: string;
  concurso: string;
  cargo: string;
  banca: string;
  bancaCustom?: string; // Custom banca if "Outra" is selected
  materias: string[];
  materiasCustom?: string; // Custom matérias text
  materiasExtrasResponse?: string; // Task 84: Admin response about extra matérias
  numQuestoes?: number; // Task 96: Number of questions requested
  editalFile?: { name: string; size: number; dataUrl: string }; // Task 119: Edital file attachment
  plano: PlanType;
  status: "aguardando_montagem" | "em_andamento" | "pronto";
  createdAt: string;
  // Task 105: Link to created package
  pacoteId?: string;
  dataPacoteCriado?: string;
}

// Task 84: Update matérias extras response in package request
export const updatePackageExtrasResponse = (userId: string, response: string) => {
  const requests = JSON.parse(localStorage.getItem("quiz_package_requests") || "[]") as PackageRequest[];
  const idx = requests.findIndex(r => r.userId === userId);
  if (idx !== -1) {
    requests[idx].materiasExtrasResponse = response;
    localStorage.setItem("quiz_package_requests", JSON.stringify(requests));
  }
};

// Task 105: Link a package to a request
export const linkPackageToRequest = (userId: string, pacoteId: string) => {
  const requests = JSON.parse(localStorage.getItem("quiz_package_requests") || "[]") as PackageRequest[];
  const idx = requests.findIndex(r => r.userId === userId);
  if (idx !== -1) {
    requests[idx].pacoteId = pacoteId;
    requests[idx].dataPacoteCriado = new Date().toISOString();
    localStorage.setItem("quiz_package_requests", JSON.stringify(requests));
    console.log(`[DEBUG] Package ${pacoteId} linked to request for user ${userId}`);
  }
};

// Task 105: Get linked package for a request
export const getLinkedPackageId = (userId: string): string | null => {
  const requests = JSON.parse(localStorage.getItem("quiz_package_requests") || "[]") as PackageRequest[];
  const request = requests.find(r => r.userId === userId);
  return request?.pacoteId || null;
};

// Save package request to localStorage
const savePackageRequest = async (request: PackageRequest) => {
  // Salvar no localStorage (fallback)
  const requests = JSON.parse(localStorage.getItem("quiz_package_requests") || "[]");
  requests.push(request);
  localStorage.setItem("quiz_package_requests", JSON.stringify(requests));
  
  // Salvar no Supabase (centralizado)
  try {
    await savePackageRequestSupabase(request);
    console.log('✅ Solicitação salva no Supabase');
  } catch (error) {
    console.error('Erro ao salvar no Supabase:', error);
  }
};

// Get package requests for admin
export const getPackageRequests = (): PackageRequest[] => {
  return JSON.parse(localStorage.getItem("quiz_package_requests") || "[]");
};

// Update package request status AND user's package status
export const updatePackageRequestStatus = (userId: string, status: PackageRequest["status"]) => {
  // Update the package request
  const requests = JSON.parse(localStorage.getItem("quiz_package_requests") || "[]");
  const updated = requests.map((r: PackageRequest) => 
    r.userId === userId ? { ...r, status } : r
  );
  localStorage.setItem("quiz_package_requests", JSON.stringify(updated));
  
  // Also update user's packageStatus in access control
  // Map the request status to package status
  const packageStatus = status === "aguardando_montagem" 
    ? "aguardando_montagem" 
    : status === "em_andamento" 
    ? "em_andamento" 
    : status === "pronto" 
    ? "pronto" 
    : null;
  
  if (packageStatus) {
    setUserPackageStatus(userId, packageStatus);
  }
  
  console.log(`[DEBUG] Package request status updated for ${userId}: ${status}`);
  console.log(`[DEBUG] User package status synced: ${packageStatus}`);
};

export default function OnboardingPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"area" | "carreira" | "detalhes" | "plano">("area");
  const [flowType, setFlowType] = useState<"explore" | "custom" | null>(null);
  
  // New: Area and Carreira state
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [selectedCarreiraId, setSelectedCarreiraId] = useState<string>("");
  const [filteredCarreiras, setFilteredCarreiras] = useState<any[]>([]);
  const [autoMaterias, setAutoMaterias] = useState<string[]>([]);
  
  // Separate state for multiselect materias and custom cargo
  const [selectedMaterias, setSelectedMaterias] = useState<string[]>([]);
  const [selectedCargo, setSelectedCargo] = useState<string>("");
  const [customCargo, setCustomCargo] = useState<string>("");
  const [customMaterias, setCustomMaterias] = useState<string>(""); // Task 76: custom matérias text field
  const [customBanca, setCustomBanca] = useState<string>(""); // Task 77: custom banca text field
  const [numQuestoes, setNumQuestoes] = useState<number>(100); // Task 96: number of questions
  const [editalFile, setEditalFile] = useState<{ name: string; size: number; dataUrl: string } | null>(null); // Task 119: Edital file
  
  const [formData, setFormData] = useState<OnboardingData>({
    concursoObjetivo: "",
    cargoDesejado: "",
    bancaOrganizadora: "",
    materias: "",
    plano: "free" // Default to free plan
  });

  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }
    
    // Check if onboarding already completed
    if (hasCompletedOnboarding(user.username)) {
      setLocation("/");
      return;
    }
    
    setQuizData(getQuizData());
  }, [user, setLocation]);

  const handleChange = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Handle area selection
  const handleAreaSelect = (areaId: string) => {
    setSelectedAreaId(areaId);
    setFormData(prev => ({ ...prev, areaId }));
    
    // Load carreiras for this area
    const carreiras = getCarreirasByArea(areaId);
    setFilteredCarreiras(carreiras);
    
    // Load auto matérias for this area
    const materias = getMateriasByArea(areaId);
    const materiasNomes = materias.map(m => m.nome);
    setAutoMaterias(materiasNomes);
    setSelectedMaterias(materiasNomes);
    setFormData(prev => ({ ...prev, materias: materiasNomes.join(", ") }));
    
    // Go to next step
    setStep("carreira");
  };

  // Handle carreira selection
  const handleCarreiraSelect = (carreiraId: string) => {
    setSelectedCarreiraId(carreiraId);
    setFormData(prev => ({ ...prev, carreiraId }));
    
    const carreira = getCarreiraById(carreiraId);
    if (carreira && carreira.cargos.length > 0) {
      // Auto-select first cargo
      setSelectedCargo(carreira.cargos[0]);
      setFormData(prev => ({ ...prev, cargoDesejado: carreira.cargos[0] }));
    }
    
    // Go to next step
    setStep("detalhes");
  };
  
  const toggleMateria = (materia: string) => {
    setSelectedMaterias(prev => {
      const newMaterias = prev.includes(materia)
        ? prev.filter(m => m !== materia)
        : [...prev, materia];
      // Update formData with comma-separated string
      setFormData(p => ({ ...p, materias: newMaterias.join(", ") }));
      if (errors.materias && newMaterias.length > 0) {
        setErrors(prev => ({ ...prev, materias: "" }));
      }
      return newMaterias;
    });
  };
  
  const handleCargoChange = (cargo: string) => {
    setSelectedCargo(cargo);
    if (cargo !== "Outro") {
      setFormData(prev => ({ ...prev, cargoDesejado: cargo }));
      setCustomCargo("");
    } else {
      setFormData(prev => ({ ...prev, cargoDesejado: customCargo }));
    }
    if (errors.cargoDesejado) {
      setErrors(prev => ({ ...prev, cargoDesejado: "" }));
    }
  };
  
  const handleCustomCargoChange = (value: string) => {
    setCustomCargo(value);
    setFormData(prev => ({ ...prev, cargoDesejado: value }));
    if (errors.cargoDesejado && value.trim()) {
      setErrors(prev => ({ ...prev, cargoDesejado: "" }));
    }
  };

  const validateDetalhes = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.concursoObjetivo.trim()) {
      newErrors.concursoObjetivo = "Informe o concurso que deseja fazer";
    }
    if (!selectedCargo) {
      newErrors.cargoDesejado = "Selecione o cargo desejado";
    } else if (selectedCargo === "Outro" && !customCargo.trim()) {
      newErrors.cargoDesejado = "Informe o cargo desejado";
    }
    if (!formData.bancaOrganizadora) {
      newErrors.bancaOrganizadora = "Selecione a banca organizadora";
    }
    if (selectedMaterias.length === 0) {
      newErrors.materias = "Selecione pelo menos uma matéria";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextToPlano = () => {
    if (validateDetalhes()) {
      setStep("plano");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSubmitting(true);
    
    // Simulate a small delay for UX
    await new Promise(r => setTimeout(r, 500));
    
    // Create a package request (always for paid plans)
    if (formData.plano === "individual" || formData.plano === "plus") {
      const area = selectedAreaId ? getAreaById(selectedAreaId) : null;
      const carreira = selectedCarreiraId ? getCarreiraById(selectedCarreiraId) : null;
      
      const request: PackageRequest = {
        userId: user.username,
        areaId: selectedAreaId || undefined,
        areaNome: area?.nome || undefined,
        carreiraId: selectedCarreiraId || undefined,
        carreiraNome: carreira?.nome || undefined,
        concurso: formData.concursoObjetivo,
        cargo: formData.cargoDesejado,
        banca: formData.bancaOrganizadora,
        bancaCustom: formData.bancaOrganizadora === "Outra" ? customBanca : undefined, // Task 77
        materias: selectedMaterias,
        materiasCustom: customMaterias.trim() || undefined, // Task 76
        numQuestoes: numQuestoes, // Task 96: save number of questions
        editalFile: editalFile || undefined, // Task 119: Edital file attachment
        plano: formData.plano,
        status: "aguardando_montagem",
        createdAt: new Date().toISOString()
      };
      savePackageRequest(request);
      
      // 🔔 NOTIFICAR ADMIN sobre nova solicitação
      const userName = user.nome || user.username || "Usuário";
      const userEmail = user.email || "";
      const extras = selectedMaterias.length > 0 ? selectedMaterias.join(", ") : undefined;
      
      notifyPackageRequest(userName, userEmail, user.username, formData.concursoObjetivo, extras);
      
      // Notificação do navegador (se permitido)
      showBrowserNotification(
        "🎯 Nova Solicitação de Pacote",
        `${userName} solicitou: ${formData.concursoObjetivo}`
      );
      
      // Task 89: For Individual and Plus plan, set status to aguardando_pagamento and redirect to Mercado Pago
      if (formData.plano === "individual" || formData.plano === "plus") {
        setUserPackageStatus(user.username, "aguardando_pagamento");
        saveOnboardingData(user.username, formData);
        // Redirect to payment waiting page, then they will be redirected to Mercado Pago
        setLocation("/aguardando-pagamento");
        return;
      } else {
        // Free plan - use original flow
        setUserPackageStatus(user.username, "aguardando_montagem");
      }
    }
    
    saveOnboardingData(user.username, formData);
    
    // Redirect based on plan and flow
    // Plus plan SEMPRE vai para pagamento (tanto custom quanto explore)
    if (formData.plano === "plus" && flowType === "explore") {
      setUserPackageStatus(user.username, "aguardando_pagamento");
      setLocation("/aguardando-pagamento");
      return;
    }
    
    // Task 78: Redirect to waiting page if custom package was requested
    if (flowType === "custom" && (formData.plano === "individual" || formData.plano === "plus")) {
      setLocation("/aguardando-pacote");
    } else {
      setLocation("/");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#070b14] text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="text-center mb-8 animate-slide-in-up">
            <div className="inline-block mb-6">
              <img 
                src="./1522a1ec-a823-4b8d-b840-956fc29e2cf8.jpg" 
                alt="Só Questões de Concursos" 
                className="w-24 h-24 mx-auto rounded-2xl shadow-2xl shadow-orange-500/20 border-2 border-white/10"
              />
            </div>
          </div>
          
          {/* Progress indicator */}
          {(step === "area" || step === "carreira" || step === "detalhes" || step === "plano") && (
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className={`w-3 h-3 rounded-full transition-all ${step === "area" || step === "carreira" ? "bg-orange-500 w-8" : "bg-orange-500"}`} />
              <div className={`w-3 h-3 rounded-full transition-all ${step === "detalhes" ? "bg-orange-500 w-8" : step === "plano" ? "bg-orange-500" : "bg-white/20"}`} />
              <div className={`w-3 h-3 rounded-full transition-all ${step === "plano" ? "bg-orange-500 w-8" : "bg-white/20"}`} />
            </div>
          )}
          
          {/* Area e Carreira Selection */}
          {(step === "area" || step === "carreira") && (
            <div className="glass-card rounded-3xl p-8 md:p-10 animate-slide-in-up">
              <AreaCarreiraSelector
                step={step}
                selectedAreaId={selectedAreaId}
                selectedCarreiraId={selectedCarreiraId}
                onAreaSelect={handleAreaSelect}
                onCarreiraSelect={handleCarreiraSelect}
                onBack={step === "carreira" ? () => setStep("area") : undefined}
              />
            </div>
          )}
          
          {/* Initial Choice Screen (removed - now starts with area) */}
          {step === "choice_DISABLED" && (
            <div className="glass-card rounded-3xl p-8 md:p-10 animate-slide-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                  Bem-vindo ao Só Questões! 🎯
                </h1>
                <p className="text-gray-400 text-lg">
                  Como você deseja começar sua jornada de estudos?
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Option 1: Explore Plans */}
                <button
                  onClick={() => {
                    setFlowType("explore");
                    setStep(2);
                  }}
                  className="p-6 glass-card rounded-2xl border-2 border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left group"
                >
                  <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <h3 className="text-xl font-bold text-emerald-400 mb-2">Ver Planos Atuais</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Navegue pelos concursos e conteúdos já disponíveis. Escolha entre os planos Gratuito, Individual ou Plus.
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      Comece gratuitamente com 10 questões/dia
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      Acesse todos os concursos disponíveis
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      Faça upgrade quando quiser
                    </li>
                  </ul>
                  <div className="mt-4 text-emerald-400 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                    Começar Agora
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
                
                {/* Option 2: Custom Package */}
                <button
                  onClick={() => {
                    setFlowType("custom");
                    setStep(1);
                  }}
                  className="p-6 glass-card rounded-2xl border-2 border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all text-left group"
                >
                  <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">📦</span>
                  </div>
                  <h3 className="text-xl font-bold text-orange-400 mb-2">Pacote Personalizado</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Crie um pacote exclusivo para seu concurso específico. Escolha cargo, banca e matérias.
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="text-orange-400">✓</span>
                      Pacote montado sob medida para você
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-orange-400">✓</span>
                      Questões filtradas para seu concurso
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-orange-400">✓</span>
                      Pronto em até 7 dias
                    </li>
                  </ul>
                  <div className="mt-4 text-orange-400 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                    Criar Meu Pacote
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          )}
          
          {/* Detalhes Screen (previously step 1) */}
          {step === "detalhes" && (
          <div className="glass-card rounded-3xl p-8 md:p-10 animate-slide-in-up" style={{ animationDelay: "0.1s" }}>
                {/* Logo no topo */}
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-500/20 rounded-2xl blur-xl" />
                    <img
                      src="./1522a1ec-a823-4b8d-b840-956fc29e2cf8.jpg"
                      alt="Só Questões de Concursos"
                      className="relative w-32 h-32 md:w-36 md:h-36 rounded-2xl shadow-xl shadow-orange-500/20 ring-1 ring-white/10"
                    />
                  </div>
                </div>

                {/* Welcome message */}
                <div className="text-center mb-10">
                  <h1 className="text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                    Você está a um passo da sua APROVAÇÃO! 🎯
                  </h1>
                  <p className="text-gray-400 text-lg">
                    Vamos personalizar sua experiência de estudos
                  </p>
                </div>
                
                <form onSubmit={e => { e.preventDefault(); handleNextToPlano(); }} className="space-y-6">
                  {/* Concurso objetivo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Qual concurso você vai fazer? *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.concursoObjetivo}
                        onChange={e => handleChange("concursoObjetivo", e.target.value)}
                        placeholder="Ex: ENEM 2025, OAB 2025, Polícia Federal..."
                        className={`w-full px-5 py-4 bg-white/5 border ${errors.concursoObjetivo ? "border-red-500" : "border-white/10"} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all`}
                        list="concursos-list"
                      />
                      <datalist id="concursos-list">
                        {quizData?.concursos?.map(c => (
                          <option key={c.id} value={c.nome} />
                        ))}
                      </datalist>
                    </div>
                    {errors.concursoObjetivo && (
                      <p className="text-red-400 text-sm mt-1">{errors.concursoObjetivo}</p>
                    )}
                  </div>

                  {/* Cargo desejado - dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Qual cargo você deseja? *
                    </label>
                    <select
                      value={selectedCargo}
                      onChange={e => handleCargoChange(e.target.value)}
                      className={`w-full px-5 py-4 bg-white/5 border ${errors.cargoDesejado ? "border-red-500" : "border-white/10"} rounded-xl text-white focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all appearance-none cursor-pointer`}
                    >
                      <option value="" className="bg-gray-900">Selecione o cargo</option>
                      {CARGOS_DISPONIVEIS.map(cargo => (
                        <option key={cargo} value={cargo} className="bg-gray-900">{cargo}</option>
                      ))}
                    </select>
                    
                    {/* Custom cargo input when "Outro" is selected */}
                    {selectedCargo === "Outro" && (
                      <input
                        type="text"
                        value={customCargo}
                        onChange={e => handleCustomCargoChange(e.target.value)}
                        placeholder="Digite o cargo desejado..."
                        className="w-full mt-3 px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                      />
                    )}
                    
                    {errors.cargoDesejado && (
                      <p className="text-red-400 text-sm mt-1">{errors.cargoDesejado}</p>
                    )}
                  </div>

                  {/* Banca organizadora - Task 77: conditional custom field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Qual a banca organizadora? *
                    </label>
                    <select
                      value={formData.bancaOrganizadora}
                      onChange={e => {
                        handleChange("bancaOrganizadora", e.target.value);
                        if (e.target.value !== "Outra") {
                          setCustomBanca("");
                        }
                      }}
                      className={`w-full px-5 py-4 bg-white/5 border ${errors.bancaOrganizadora ? "border-red-500" : "border-white/10"} rounded-xl text-white focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all appearance-none cursor-pointer`}
                    >
                      <option value="" className="bg-gray-900">Selecione a banca</option>
                      {BANCAS.map(banca => (
                        <option key={banca} value={banca} className="bg-gray-900">{banca}</option>
                      ))}
                    </select>
                    
                    {/* Custom banca input when "Outra" is selected */}
                    {formData.bancaOrganizadora === "Outra" && (
                      <input
                        type="text"
                        value={customBanca}
                        onChange={e => setCustomBanca(e.target.value)}
                        placeholder="Qual banca? (especifique)"
                        className="w-full mt-3 px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                      />
                    )}
                    
                    {errors.bancaOrganizadora && (
                      <p className="text-red-400 text-sm mt-1">{errors.bancaOrganizadora}</p>
                    )}
                  </div>

                  {/* Matérias - checkboxes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Quais matérias deseja estudar? *
                      <span className="text-gray-500 font-normal ml-2">({selectedMaterias.length} selecionadas)</span>
                    </label>
                    <div className={`p-4 bg-white/5 border ${errors.materias ? "border-red-500" : "border-white/10"} rounded-xl max-h-64 overflow-y-auto`}>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {MATERIAS_DISPONIVEIS.map(materia => (
                          <label
                            key={materia}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                              selectedMaterias.includes(materia)
                                ? "bg-orange-500/20 border border-orange-500/50"
                                : "hover:bg-white/5 border border-transparent"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedMaterias.includes(materia)}
                              onChange={() => toggleMateria(materia)}
                              className="w-4 h-4 rounded border-gray-600 bg-white/10 text-orange-500 focus:ring-orange-500/50"
                            />
                            <span className="text-sm text-gray-300">{materia}</span>
                          </label>
                        ))}
                      </div>
                      
                      {/* Botão para adicionar matéria customizada */}
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            const novaMateria = prompt("Digite o nome da matéria:");
                            if (novaMateria && novaMateria.trim()) {
                              const materiaTrimmed = novaMateria.trim();
                              if (!selectedMaterias.includes(materiaTrimmed)) {
                                toggleMateria(materiaTrimmed);
                              }
                            }
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 hover:border-orange-500/50 rounded-lg text-orange-400 hover:text-orange-300 transition-all font-medium text-sm"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Não encontrou sua matéria? Clique aqui para adicionar
                        </button>
                      </div>
                    </div>
                    {selectedMaterias.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selectedMaterias.map(materia => (
                          <span
                            key={materia}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-lg"
                          >
                            {materia}
                            <button
                              type="button"
                              onClick={() => toggleMateria(materia)}
                              className="hover:text-orange-300"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {errors.materias && (
                      <p className="text-red-400 text-sm mt-1">{errors.materias}</p>
                    )}
                    
                    {/* Task 76: Custom matérias textarea */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Outras matérias <span className="text-gray-500">(descreva)</span>
                      </label>
                      <textarea
                        value={customMaterias}
                        onChange={e => setCustomMaterias(e.target.value)}
                        placeholder="Digite matérias adicionais que não estão na lista acima, separadas por vírgula. Ex: Direito Tributário Avançado, Matemática Financeira Aplicada..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none text-sm"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Task 96: Number of questions field - only for custom package flow */}
                  {flowType === "custom" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Quantas questões deseja?
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={numQuestoes}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 50;
                            setNumQuestoes(Math.min(500, Math.max(50, val)));
                          }}
                          min={50}
                          max={500}
                          step={10}
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                          questões
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs mt-2">
                        💡 Recomendamos entre 100-200 questões para preparação completa. Mínimo: 50 | Máximo: 500
                      </p>
                    </div>
                  )}

                  {/* Task 119: Edital file upload - only for custom package flow */}
                  {flowType === "custom" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        📄 Anexar Edital ou Conteúdo Programático <span className="text-gray-500">(opcional)</span>
                      </label>
                      <div className="relative">
                        {!editalFile ? (
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 hover:border-orange-500/50 transition-all">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <p className="mb-1 text-sm text-gray-400">
                                <span className="font-semibold text-orange-400">Clique para enviar</span> ou arraste o arquivo
                              </p>
                              <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (máx. 5MB)</p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 5 * 1024 * 1024) {
                                    alert("Arquivo muito grande! Máximo 5MB.");
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setEditalFile({
                                      name: file.name,
                                      size: file.size,
                                      dataUrl: reader.result as string
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        ) : (
                          <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white truncate max-w-[200px]">{editalFile.name}</p>
                                <p className="text-xs text-gray-400">{(editalFile.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditalFile(null)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mt-2">
                        💡 Envie o edital do concurso para montarmos o pacote de acordo com o conteúdo programático oficial
                      </p>
                    </div>
                  )}

                  {/* Next button */}
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 rounded-xl font-bold text-lg text-white shadow-xl shadow-orange-500/30 transition-all hover:shadow-orange-500/40 hover:scale-[1.02] flex items-center justify-center gap-3"
                  >
                    Próximo Passo
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </form>
          </div>
          )}
          
          {/* Plan Selection Screen */}
          {step === "plano" && (
          <div className="glass-card rounded-3xl p-8 md:p-10 animate-slide-in-up">
                {/* Plan selection */}
                <div className="text-center mb-10">
                  <h1 className="text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                    Escolha seu Plano 📚
                  </h1>
                  <p className="text-gray-400 text-lg">
                    Selecione o plano ideal para sua jornada de estudos
                  </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Plan cards - 3 plans grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <PlanCard 
                      type="free" 
                      selected={formData.plano === "free"}
                      onSelect={() => setFormData(prev => ({ ...prev, plano: "free" }))}
                    />
                    <PlanCard 
                      type="individual" 
                      selected={formData.plano === "individual"}
                      onSelect={() => setFormData(prev => ({ ...prev, plano: "individual" }))}
                      recommended
                    />
                    <PlanCard 
                      type="plus" 
                      selected={formData.plano === "plus"}
                      onSelect={() => setFormData(prev => ({ ...prev, plano: "plus" }))}
                    />
                  </div>
                  
                  {/* Comparison text */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">💡</span>
                      </div>
                      <p className="text-gray-400 leading-relaxed">
                        <span className="text-emerald-400 font-medium">Grátis:</span> 10 questões/dia | 
                        <span className="text-orange-400 font-medium"> Individual:</span> Ilimitado, 1 concurso | 
                        <span className="text-amber-400 font-medium"> Plus:</span> Tudo liberado!
                      </p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-lg text-white transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-[2] py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 rounded-xl font-bold text-lg text-white shadow-xl shadow-orange-500/30 transition-all hover:shadow-orange-500/40 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <span className="text-xl">🚀</span>
                          Iniciar Minha Jornada
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
          )}
          
          {/* Motivational text */}
          <p className="text-center text-gray-500 mt-6 text-sm animate-slide-in-up" style={{ animationDelay: "0.2s" }}>
            Sua dedicação é o primeiro passo para a aprovação. Vamos juntos! 💪
          </p>
        </div>
      </div>
    </div>
  );
}
