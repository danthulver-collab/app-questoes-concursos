import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { AppHeader } from "../components/app-header";
import { useAuth } from "../lib/auth-context-supabase";
import { getUserPlan, getUserConcursoOriginal, PLAN_LIMITS, type PlanType, isAdmin, setUserPlan } from "../lib/access-control";
import { setUserPackageStatus as setUserPackageStatusSupabase, saveUserData } from "../lib/supabase-user-data";
import { createPlanRequest, getActiveUserRequest } from "../lib/plan-requests";

interface PlanFeature {
  name: string;
  free: boolean | string;
  individual: boolean | string;
  plus: boolean | string;
}

const PLAN_FEATURES: PlanFeature[] = [
  { name: "Questões por dia", free: "10", individual: "Ilimitadas", plus: "Ilimitadas" },
  { name: "Acesso a concursos", free: "Todos", individual: "1 específico", plus: "Todos" },
  { name: "Disciplinas e filtros", free: "Todas", individual: "Do concurso", plus: "Todas" },
  { name: "Estatísticas pessoais", free: "Básicas", individual: true, plus: true },
  { name: "Estatísticas avançadas", free: false, individual: false, plus: true },
  { name: "Plano de estudos", free: false, individual: true, plus: true },
  { name: "Chat IA para dúvidas", free: "Limitado", individual: "Básico", plus: "Expandido" },
  { name: "Suporte", free: "Comunidade", individual: "Básico", plus: "Prioritário" },
];

export default function PlanosPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [currentPlan, setCurrentPlan] = useState<PlanType | null>(null);
  const [currentConcurso, setCurrentConcurso] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedUpgrade, setSelectedUpgrade] = useState<PlanType | null>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }
    
    // Check by username OR email (for Google login)
    const plan = getUserPlan(user.email || user.username);
    setCurrentPlan(plan || "free");
    
    const concurso = getUserConcursoOriginal(user.username);
    setCurrentConcurso(concurso);
    
    setUserIsAdmin(isAdmin(user.username) || isAdmin(user.email || ''));
  }, [user, setLocation]);

  const openContactModal = (plan: PlanType) => {
    setSelectedUpgrade(plan);
    setShowContactModal(true);
  };

  // Task 82: Immediately redirect to Mercado Pago for Individual plan
  const handleImmediatePayment = async (plan: PlanType) => {
    if (!user?.username) return;
    
    // Criar solicitação de plano no sistema local
    const request = createPlanRequest(
      user.email || user.username,
      user.email || "",
      user.nome || user.username,
      plan as "individual" | "plus",
      {
        observacoes: `Solicitação criada via página de planos em ${new Date().toLocaleString('pt-BR')}`
      }
    );
    
    console.log('📋 Solicitação criada:', request.id);
    
    // Save the package request with "aguardando_pagamento" status to SUPABASE (compatibilidade)
    await setUserPackageStatusSupabase(user.id || user.username, "aguardando_pagamento");
    
    // Também salva informações do usuário
    await saveUserData(user.id || user.username, {
      email: user.email,
      username: user.username,
      nome: user.nome,
      plan: plan
    });
    
    // Redirecionar para página de checkout ao invés de diretamente para Mercado Pago
    setLocation(`/checkout?request=${request.id}&plan=${plan}`);
  };

  if (!user) return null;

  const planOrder: PlanType[] = ["trial", "free", "individual", "plus"];
  const currentPlanIndex = planOrder.indexOf(currentPlan || "free");

  const canUpgradeTo = (plan: PlanType): boolean => {
    const targetIndex = planOrder.indexOf(plan);
    return targetIndex > currentPlanIndex;
  };

  const getPlanColor = (plan: PlanType) => ({
    trial: { text: "text-cyan-400", bg: "bg-cyan-500", bgLight: "bg-cyan-500/20", border: "border-cyan-500", gradient: "from-cyan-500 to-blue-500" },
    free: { text: "text-emerald-400", bg: "bg-emerald-500", bgLight: "bg-emerald-500/20", border: "border-emerald-500", gradient: "from-emerald-500 to-green-500" },
    individual: { text: "text-orange-400", bg: "bg-orange-500", bgLight: "bg-orange-500/20", border: "border-orange-500", gradient: "from-orange-500 to-amber-500" },
    plus: { text: "text-amber-400", bg: "bg-amber-500", bgLight: "bg-amber-500/20", border: "border-amber-400", gradient: "from-amber-400 to-yellow-400" }
  }[plan]);

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
      
      <AppHeader showAdmin />
      
      <main className="flex-1 flex flex-col items-center py-12 px-4 relative z-10">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-in-up">
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                Escolha seu Plano
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              Invista na sua aprovação com o plano ideal para você
            </p>
          </div>
          
          {/* Success message */}
          {success && (
            <div className="mb-8 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-center animate-slide-in-up">
              <span className="text-emerald-400 font-medium">🎉 Parabéns! Seu plano foi atualizado com sucesso!</span>
            </div>
          )}
          
          {/* Current plan badge */}
          {currentPlan && (
            <div className="text-center mb-8 animate-slide-in-up" style={{ animationDelay: "0.1s" }}>
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm border ${getPlanColor(currentPlan).bgLight} ${getPlanColor(currentPlan).border}/30`}>
                <span>{currentPlan === "plus" ? "✨" : currentPlan === "individual" ? "⭐" : currentPlan === "trial" ? "🎉" : "🆓"}</span>
                <span className="text-gray-300">Seu plano atual:</span>
                <span className={`font-bold ${getPlanColor(currentPlan).text}`}>
                  Plano {PLAN_LIMITS[currentPlan].name}
                </span>
                {currentPlan === "individual" && currentConcurso && (
                  <span className="text-gray-500">({currentConcurso})</span>
                )}
              </div>
            </div>
          )}
          
          {/* Plans comparison - 3 columns */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Free Plan */}
            <div 
              className={`glass-card rounded-3xl p-6 relative animate-slide-in-up transition-all ${
                currentPlan === "free" ? "ring-2 ring-emerald-500" : ""
              }`}
              style={{ animationDelay: "0.2s" }}
            >
              {currentPlan === "free" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 rounded-full text-xs font-bold text-white">
                  PLANO ATUAL
                </div>
              )}
              
              <div className="text-center mb-6">
                <span className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/20 rounded-2xl text-2xl mb-4">
                  🆓
                </span>
                <h2 className="text-xl font-bold text-emerald-400 mb-2">Plano Grátis</h2>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-black text-white">R$ 0</span>
                  <span className="text-gray-400">/mês</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Comece a estudar agora</p>
              </div>
              
              <ul className="space-y-2 mb-6">
                {PLAN_LIMITS.free.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <span className="text-emerald-400">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                disabled={currentPlan === "free"}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  currentPlan === "free"
                    ? "bg-emerald-500/30 text-emerald-300 cursor-not-allowed"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                {currentPlan === "free" ? "Plano Atual" : "Selecionar"}
              </button>
            </div>
            
            {/* Individual Plan */}
            <div 
              className={`glass-card rounded-3xl p-6 relative animate-slide-in-up transition-all ${
                currentPlan === "individual" ? "ring-2 ring-orange-500" : ""
              }`}
              style={{ animationDelay: "0.3s" }}
            >
              {currentPlan === "individual" ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-orange-500 rounded-full text-xs font-bold text-white">
                  PLANO ATUAL
                </div>
              ) : (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-xs font-bold text-white">
                  ⭐ POPULAR
                </div>
              )}
              
              <div className="text-center mb-6">
                <span className="inline-flex items-center justify-center w-14 h-14 bg-orange-500/20 rounded-2xl text-2xl mb-4">
                  ⭐
                </span>
                <h2 className="text-xl font-bold text-orange-400 mb-2">Plano Individual</h2>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-black text-white">R$ {PLAN_LIMITS.individual.price}</span>
                  <span className="text-gray-400">/mês</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Focado no seu concurso</p>
              </div>
              
              <ul className="space-y-2 mb-6">
                {PLAN_LIMITS.individual.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <span className="text-orange-400">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="space-y-2">
                <button
                  onClick={() => canUpgradeTo("individual") && setLocation("/individual/configurar")}
                  disabled={!canUpgradeTo("individual")}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    currentPlan === "individual"
                      ? "bg-orange-500/30 text-orange-300 cursor-not-allowed"
                      : canUpgradeTo("individual")
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/30"
                      : "bg-white/10 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {currentPlan === "individual" ? "Plano Atual" : canUpgradeTo("individual") ? "📦 Escolher Pacote" : "—"}
                </button>
                {canUpgradeTo("individual") && (
                  <button
                    onClick={() => openContactModal("individual")}
                    className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Ver detalhes
                  </button>
                )}
              </div>
            </div>
            
            {/* Plus Plan */}
            <div 
              className={`glass-card rounded-3xl p-6 relative animate-slide-in-up border-2 border-amber-500/30 transition-all ${
                currentPlan === "plus" ? "ring-2 ring-amber-400" : ""
              }`}
              style={{ animationDelay: "0.4s" }}
            >
              {currentPlan === "plus" ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 rounded-full text-xs font-bold text-gray-900">
                  PLANO ATUAL
                </div>
              ) : (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full text-xs font-bold text-gray-900">
                  ✨ COMPLETO
                </div>
              )}
              
              <div className="text-center mb-6">
                <span className="inline-flex items-center justify-center w-14 h-14 bg-amber-500/20 rounded-2xl text-2xl mb-4">
                  ✨
                </span>
                <h2 className="text-xl font-bold text-amber-400 mb-2">Plano Plus</h2>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-black text-white">R$ {PLAN_LIMITS.plus.price}</span>
                  <span className="text-gray-400">/mês</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Acesso total</p>
              </div>
              
              <ul className="space-y-2 mb-6">
                {PLAN_LIMITS.plus.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <span className="text-amber-400">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-amber-400">✨</span>
                  <span className="text-gray-300 font-bold">Planejamento de Estudos Avançado com IA</span>
                </li>
              </ul>
              
              {/* Destaque Planejamento Plus */}
              <div className="mb-6 p-4 bg-gradient-to-br from-amber-500/20 to-yellow-500/10 rounded-xl border border-amber-500/30">
                <div className="font-bold text-amber-400 mb-2 flex items-center gap-2">
                  <span>📊</span> Plano de Estudos Personalizado:
                </div>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li>• Cronograma semanal otimizado</li>
                  <li>• Técnica Pomodoro integrada</li>
                  <li>• Sistema de revisão espaçada (24h/7d/30d)</li>
                  <li>• Análise de horários ideais</li>
                  <li>• Metas semanais personalizadas</li>
                  <li>• Gráficos de evolução por matéria</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => {
                    if (canUpgradeTo("plus")) {
                      // 🔥 Redirecionar para assinatura mensal do Mercado Pago
                      window.location.href = "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=7509d70a8c2d44ea9e34c63d98115716";
                    }
                  }}
                  disabled={!canUpgradeTo("plus")}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    currentPlan === "plus"
                      ? "bg-amber-500/30 text-amber-300 cursor-not-allowed"
                      : canUpgradeTo("plus")
                      ? "bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-gray-900 shadow-lg shadow-amber-500/30"
                      : "bg-white/10 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {currentPlan === "plus" ? "Plano Atual" : canUpgradeTo("plus") ? "💳 Assinar Mensal" : "—"}
                </button>
                {canUpgradeTo("plus") && (
                  <button
                    onClick={() => openContactModal("plus")}
                    className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Ver detalhes
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Features comparison table */}
          <div className="glass-card rounded-3xl p-6 md:p-8 animate-slide-in-up" style={{ animationDelay: "0.5s" }}>
            <h3 className="text-xl font-bold mb-6 text-center">Comparação Detalhada</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Recurso</th>
                    <th className="text-center py-3 px-4 text-emerald-400 font-medium">Grátis</th>
                    <th className="text-center py-3 px-4 text-orange-400 font-medium">Individual</th>
                    <th className="text-center py-3 px-4 text-amber-400 font-medium">Plus</th>
                  </tr>
                </thead>
                <tbody>
                  {PLAN_FEATURES.map((feature, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="py-3 px-4 text-gray-300">{feature.name}</td>
                      <td className="py-3 px-4 text-center">
                        {typeof feature.free === "boolean" ? (
                          feature.free ? <span className="text-emerald-400">✓</span> : <span className="text-gray-500">—</span>
                        ) : (
                          <span className="text-gray-400 text-sm">{feature.free}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {typeof feature.individual === "boolean" ? (
                          feature.individual ? <span className="text-emerald-400">✓</span> : <span className="text-gray-500">—</span>
                        ) : (
                          <span className="text-gray-400 text-sm">{feature.individual}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {typeof feature.plus === "boolean" ? (
                          feature.plus ? <span className="text-emerald-400">✓</span> : <span className="text-gray-500">—</span>
                        ) : (
                          <span className="text-gray-400 text-sm">{feature.plus}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Back button */}
          <div className="text-center mt-8">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar para o início
            </Link>
          </div>
        </div>
      </main>
      
      {/* Contact Admin Modal - Task 79: Enhanced upgrade modal */}
      {showContactModal && selectedUpgrade && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="glass-card rounded-3xl p-6 md:p-8 max-w-lg w-full animate-scale-in my-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                <span className="text-3xl">{selectedUpgrade === "plus" ? "✨" : "⭐"}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Upgrade para Plano {PLAN_LIMITS[selectedUpgrade].name}
              </h3>
              <p className="text-3xl font-black text-white">
                R$ {PLAN_LIMITS[selectedUpgrade].price}<span className="text-lg text-gray-400 font-normal">/mês</span>
              </p>
            </div>
            
            {/* Plan Benefits */}
            <div className={`mb-6 p-4 rounded-xl ${getPlanColor(selectedUpgrade).bgLight} border ${getPlanColor(selectedUpgrade).border}/30`}>
              {selectedUpgrade === "individual" ? (
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">✓</span>
                    <span className="text-gray-300"><strong className="text-white">Você escolhe</strong> concurso, cargo, banca e matérias</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">✓</span>
                    <span className="text-gray-300"><strong className="text-white">NÓS montamos</strong> seu pacote personalizado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">✓</span>
                    <span className="text-gray-300"><strong className="text-white">Prazo:</strong> até 7 dias úteis para montagem</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">✓</span>
                    <span className="text-gray-300"><strong className="text-white">Durante a espera:</strong> acesso à plataforma mantido</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">✓</span>
                    <span className="text-gray-300">Comentários detalhados das questões</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">✓</span>
                    <span className="text-gray-300">Chat IA básico para dúvidas</span>
                  </li>
                </ul>
              ) : (
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">✓</span>
                    <span className="text-gray-300"><strong className="text-white">Acesso TOTAL</strong> imediato a todos os concursos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">✓</span>
                    <span className="text-gray-300"><strong className="text-white">TODOS</strong> os concursos disponíveis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">✓</span>
                    <span className="text-gray-300"><strong className="text-white">Questões sob demanda</strong> (solicite quando quiser)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">✓</span>
                    <span className="text-gray-300"><strong className="text-white">ChatGPT incluso</strong> sem limite</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">✓</span>
                    <span className="text-gray-300"><strong className="text-white">Suporte prioritário</strong></span>
                  </li>
                </ul>
              )}
            </div>
            
            {/* Mercado Pago Button - Primary CTA */}
            <a
              href={selectedUpgrade === "individual" 
                ? "https://mpago.la/1ym97zu" 
                : "https://mpago.la/1AtgXnn"}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full py-4 px-4 bg-gradient-to-r ${getPlanColor(selectedUpgrade).gradient} hover:opacity-90 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 mb-4 shadow-lg`}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>
              </svg>
              Pagar com Mercado Pago
            </a>
            
            <div className="text-center text-xs text-gray-400 mb-4">
              <p>Pagamento seguro via PIX, cartão ou boleto</p>
            </div>
            
            {/* What happens after payment - Timeline */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
              <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <span className="text-lg">📋</span>
                O que acontece após o pagamento?
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-emerald-400 text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium">Confirmação do pagamento</p>
                    <p className="text-gray-500 text-xs">PIX/Cartão: imediato | Boleto: 3-4 dias</p>
                  </div>
                </div>
                {selectedUpgrade === "individual" && (
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-orange-400 text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="text-white text-xs font-medium">Montagem do seu pacote</p>
                      <p className="text-gray-500 text-xs">Até 7 dias úteis para prepararmos tudo</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-400 text-xs font-bold">{selectedUpgrade === "individual" ? "3" : "2"}</span>
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium">{selectedUpgrade === "plus" ? "Acesso liberado!" : "Pacote pronto!"}</p>
                    <p className="text-gray-500 text-xs">{selectedUpgrade === "plus" ? "Acesso imediato a tudo" : "Notificação por email/WhatsApp"}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-500 text-xs text-center mb-4">
              Seu usuário: <span className="text-white font-medium">{user?.username}</span>
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowContactModal(false);
                  setSelectedUpgrade(null);
                }}
                className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all"
              >
                Fechar
              </button>
              <a
                href={`https://api.whatsapp.com/send?phone=5521980645070&text=${encodeURIComponent(`Olá! Tenho dúvidas sobre o Plano ${PLAN_LIMITS[selectedUpgrade].name}. Meu usuário é: ${user?.username}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Dúvidas
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
