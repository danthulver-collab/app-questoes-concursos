import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { AppHeader } from "../components/app-header";
import { useAuth } from "../lib/auth-context-supabase";
import { 
  getUserPackageStatus, 
  getPackageDaysRemaining, 
  getUserPlan,
  getUserCreationProgress,
  canAccessPackage,
  STAGE_PERCENTAGES,
  STAGE_LABELS,
  STAGE_MESSAGES,
  STAGE_ICONS,
  ORDERED_STAGES,
  type PackageStatus,
  type CreationProgress,
  type CreationStage
} from "../lib/access-control";
import { ProgressTimeline } from "../components/progress-timeline";
import { getPackageRequests, getLinkedPackageId } from "./onboarding";
import { getQuizData, type Pacote } from "../lib/quiz-store";
import { useSyncPlan } from "../lib/use-sync-plan";

interface PackageRequest {
  userId: string;
  concurso: string;
  cargo: string;
  banca: string;
  bancaCustom?: string;
  materias: string[];
  materiasCustom?: string;
  materiasExtrasResponse?: string;
  plano: string;
  status: string;
  createdAt: string;
  pacoteId?: string;
  dataPacoteCriado?: string;
}

// Confetti animation component for celebration
const Confetti = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {Array.from({ length: 30 }).map((_, i) => (
      <div
        key={i}
        className="absolute animate-confetti"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${2 + Math.random() * 2}s`,
        }}
      >
        <span className="text-2xl">
          {['🎉', '🎊', '✨', '🌟', '⭐'][Math.floor(Math.random() * 5)]}
        </span>
      </div>
    ))}
    <style>{`
      @keyframes confetti {
        0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
      .animate-confetti {
        animation: confetti 3s linear infinite;
      }
    `}</style>
  </div>
);

export default function AguardandoPacotePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [packageStatus, setPackageStatus] = useState<PackageStatus>(null);
  const [daysRemaining, setDaysRemaining] = useState(7);
  const [packageRequest, setPackageRequest] = useState<PackageRequest | null>(null);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [creationProgress, setCreationProgress] = useState<CreationProgress | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  // Task 109: Track linked package details
  const [linkedPacote, setLinkedPacote] = useState<Pacote | null>(null);
  
  // 🔥 SYNC: Ativar sincronização automática a cada 5 segundos
  useSyncPlan(user?.username);

  // Função para recarregar dados do usuário
  const reloadData = () => {
    if (!user) return;
    
    const status = getUserPackageStatus(user.username);
    const days = getPackageDaysRemaining(user.username);
    const plan = getUserPlan(user.username);
    const progress = getUserCreationProgress(user.username);
    
    setPackageStatus(status);
    setDaysRemaining(days);
    setUserPlan(plan);
    setCreationProgress(progress);
    
    // Get the package request details
    const requests = getPackageRequests();
    const userRequest = requests.find((r: PackageRequest) => r.userId === user.username);
    if (userRequest) {
      setPackageRequest(userRequest);
      
      // Task 109: Get linked package details
      const pacoteId = userRequest.pacoteId || getLinkedPackageId(user.username);
      if (pacoteId) {
        const quizData = getQuizData();
        const pacote = quizData.pacotes.find(p => p.id === pacoteId);
        if (pacote) {
          setLinkedPacote(pacote);
        }
      }
    }
    
    // Task 93: Show confetti when package is ready
    if (status === "pronto") {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  };

  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }

    // Carregar dados iniciais
    reloadData();
    
    // 🔥 LISTENER: Ouvir eventos de atualização de progresso
    const handleProgressUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('[Aguardando Pacote] Progresso atualizado:', customEvent.detail);
      reloadData();
    };
    
    window.addEventListener('progressUpdated', handleProgressUpdate);
    
    return () => {
      window.removeEventListener('progressUpdated', handleProgressUpdate);
    };
  }, [user, setLocation]);

  if (!user) return null;

  // Calculate progress based on creation progress or days remaining
  const currentStage = creationProgress?.stage || "pagamento_pendente";
  const progress = creationProgress?.percentual ?? Math.round(((7 - daysRemaining) / 7) * 100);
  
  // Get display banca (custom or regular)
  const displayBanca = packageRequest?.bancaCustom || packageRequest?.banca || "Não informada";
  
  // Task 109: Handle starting the package
  const handleStartJourney = () => {
    if (linkedPacote) {
      // Check access using canAccessPackage
      const accessCheck = canAccessPackage(user.username, linkedPacote.id);
      if (accessCheck.canAccess) {
        setLocation(`/concurso/${encodeURIComponent(linkedPacote.nome)}`);
      } else {
        alert(accessCheck.reason || "Você não tem acesso a este pacote.");
      }
    } else if (packageRequest?.concurso) {
      setLocation(`/concurso/${encodeURIComponent(packageRequest.concurso)}`);
    } else {
      setLocation("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
      
      {/* Task 93: Confetti when ready */}
      {showConfetti && <Confetti />}
      
      <AppHeader showAdmin />
      
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 relative z-10">
        <div className="max-w-2xl w-full">
          {/* Main waiting card */}
          <div className="glass-card rounded-3xl p-8 md:p-10 text-center animate-slide-in-up">
            {/* Show different UI based on package status */}
            {packageStatus === "aguardando_pagamento" ? (
              <>
                {/* Waiting payment status */}
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-500/30 to-orange-500/30 flex items-center justify-center">
                  <span className="text-5xl">💳</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                  Aguardando Confirmação de Pagamento
                </h1>
                
                <p className="text-gray-400 text-lg mb-6">
                  Assim que o admin confirmar seu pagamento, a produção do seu pacote será iniciada automaticamente!
                </p>
                
                {/* Timeline showing payment pending */}
                <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                  <ProgressTimeline 
                    currentStage="pagamento_pendente" 
                    variant="horizontal" 
                    compact
                  />
                </div>
                
                {/* Package details */}
                {packageRequest && (
                  <div className="bg-white/5 rounded-2xl p-6 text-left mb-6 border border-white/10">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-orange-400">📋</span>
                      Seu Pedido:
                    </h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 w-20">Concurso:</span>
                        <span className="text-white font-medium">{packageRequest.concurso}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 w-20">Cargo:</span>
                        <span className="text-white font-medium">{packageRequest.cargo}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 w-20">Banca:</span>
                        <span className="text-white font-medium">{displayBanca}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Info box */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                  <p className="text-blue-300 text-sm flex items-center justify-center gap-2">
                    <span className="text-lg">⏰</span>
                    A confirmação do pagamento geralmente ocorre em até 24 horas
                  </p>
                </div>
                
                <Link href="/aguardando-pagamento">
                  <a className="block w-full py-3 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 font-medium rounded-xl transition-all">
                    ← Voltar para Pagamento
                  </a>
                </Link>
              </>
            ) : packageStatus === "pronto" ? (
              <>
                {/* Ready icon with celebration */}
                <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500/30 to-green-500/30 flex items-center justify-center animate-pulse">
                  <span className="text-6xl">🎉</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
                  Seu Pacote está Pronto!
                </h1>
                
                <p className="text-gray-400 text-lg mb-6">
                  Seu pacote personalizado foi montado com sucesso! Você já pode começar a estudar.
                </p>
                
                {/* Task 109: Show package details when ready */}
                {linkedPacote && (
                  <div className="bg-white/5 rounded-2xl p-6 text-left mb-6 border border-emerald-500/30">
                    <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2">
                      <span className="text-xl">📦</span>
                      Detalhes do seu Pacote Exclusivo
                    </h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 w-24">Nome:</span>
                        <span className="text-white font-medium">{linkedPacote.nome}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 w-24">Banca:</span>
                        <span className="text-white font-medium">{linkedPacote.banca || displayBanca}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 w-24">Questões:</span>
                        <span className="text-emerald-400 font-bold">
                          {linkedPacote.questionsIds.length} questões disponíveis
                        </span>
                      </div>
                      {linkedPacote.disciplinas.length > 0 && (
                        <div className="flex items-start gap-3">
                          <span className="text-gray-500 w-24 pt-1">Matérias:</span>
                          <div className="flex-1 flex flex-wrap gap-1">
                            {linkedPacote.disciplinas.map((disc, idx) => (
                              <span 
                                key={idx}
                                className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-lg"
                              >
                                {disc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Task 99: Timeline showing completed */}
                <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                  <ProgressTimeline 
                    currentStage="pronto" 
                    variant="horizontal" 
                    showLabels={false}
                    showMessages={false}
                    compact
                  />
                </div>
                
                {/* Task 109: Big "Start Journey" button using handleStartJourney */}
                <button
                  onClick={handleStartJourney}
                  className="w-full py-5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 rounded-2xl font-bold text-xl transition-all shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/40 animate-pulse mb-6"
                >
                  🎉 Começar Jornada!
                </button>
              </>
            ) : (
              <>
                {/* Construction/Hourglass icon */}
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500/30 to-amber-500/30 flex items-center justify-center">
                  <span className="text-5xl">{STAGE_ICONS[currentStage]}</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                  Seu Pacote está sendo preparado!
                </h1>
                
                {/* Task 99: Dynamic message based on stage */}
                <p className="text-gray-400 text-lg mb-4">
                  {STAGE_MESSAGES[currentStage]}
                </p>
                
                {/* Task 99: 8-stage timeline progress visualization */}
                <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                  <ProgressTimeline 
                    currentStage={currentStage} 
                    variant="horizontal" 
                    compact
                    timestamps={creationProgress?.timestamps}
                  />
                </div>
                
                {/* Detailed vertical timeline for smaller screens */}
                <div className="mb-8 md:hidden">
                  <details className="bg-white/5 rounded-xl border border-white/10 p-4">
                    <summary className="text-gray-400 text-sm cursor-pointer hover:text-gray-300">
                      📊 Ver detalhes do progresso
                    </summary>
                    <div className="mt-4">
                      <ProgressTimeline 
                        currentStage={currentStage} 
                        variant="vertical" 
                        showLabels
                        showMessages={false}
                        compact
                        timestamps={creationProgress?.timestamps}
                      />
                    </div>
                  </details>
                </div>
                
                {/* Time estimate */}
                <p className="text-gray-500 text-xs mb-6">
                  {daysRemaining > 0 
                    ? `Faltam ${daysRemaining} dia${daysRemaining > 1 ? 's' : ''} para o prazo máximo`
                    : "Seu pacote está quase pronto!"
                  }
                </p>
              </>
            )}
            
            {/* Package details */}
            {packageRequest && packageStatus !== "pronto" && (
              <div className="bg-white/5 rounded-2xl p-6 text-left mb-8 border border-white/10">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-orange-400">📋</span>
                  Estamos montando questões exclusivas para:
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 w-20">Concurso:</span>
                    <span className="text-white font-medium">{packageRequest.concurso}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 w-20">Cargo:</span>
                    <span className="text-white font-medium">{packageRequest.cargo}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 w-20">Banca:</span>
                    <span className="text-white font-medium">{displayBanca}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-gray-500 w-20 pt-1">Matérias:</span>
                    <div className="flex-1 flex flex-wrap gap-1">
                      {packageRequest.materias.map((materia, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-lg"
                        >
                          {materia}
                        </span>
                      ))}
                    </div>
                  </div>
                  {packageRequest.materiasCustom && (
                    <div className="flex items-start gap-3 pt-2 border-t border-white/10">
                      <span className="text-gray-500 w-20 pt-1">Extras:</span>
                      <span className="text-amber-400 text-xs italic">{packageRequest.materiasCustom}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Info banner */}
            {packageStatus !== "pronto" && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-8">
                <p className="text-emerald-400 text-sm flex items-center justify-center gap-2">
                  <span className="text-lg">🔔</span>
                  Você receberá uma notificação quando seu pacote estiver pronto!
                </p>
              </div>
            )}
            
            {/* WhatsApp CTA */}
            <a
              href={`https://api.whatsapp.com/send?phone=5521980645070&text=${encodeURIComponent(`Olá! Quero tirar dúvidas sobre meu pacote personalizado.\n\nMeu usuário: ${user?.username}\nConcurso: ${packageRequest?.concurso || 'N/A'}\nCargo: ${packageRequest?.cargo || 'N/A'}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 w-full md:w-auto px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/40"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Precisa falar conosco?
            </a>
            
            {/* Access to platform note */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-gray-500 text-sm mb-4">
                Enquanto isso, você já pode explorar a plataforma:
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Acessar Plataforma
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
