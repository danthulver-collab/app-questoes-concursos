import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { AppHeader } from "../components/app-header";
import { useAuth } from "../lib/auth-context-supabase";
import { 
  getUserPackageStatus,
  getMercadoPagoCheckoutUrl,
  type PackageStatus 
} from "../lib/access-control";
import { getPackageRequests } from "./onboarding";

interface PackageRequest {
  userId: string;
  concurso: string;
  cargo: string;
  banca: string;
  bancaCustom?: string;
  materias: string[];
  materiasCustom?: string;
  plano: string;
  status: string;
  createdAt: string;
}

export default function AguardandoPagamentoPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [packageStatus, setPackageStatus] = useState<PackageStatus>(null);
  const [packageRequest, setPackageRequest] = useState<PackageRequest | null>(null);

  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }

    const status = getUserPackageStatus(user.username);
    setPackageStatus(status);

    // Get the package request details
    const requests = getPackageRequests();
    const userRequest = requests.find((r: PackageRequest) => r.userId === user.username);
    if (userRequest) {
      setPackageRequest(userRequest);
    }

    // If payment was confirmed, redirect to aguardando-pacote
    if (status === "aguardando_montagem" || status === "em_andamento" || status === "pronto") {
      setLocation("/aguardando-pacote");
      return;
    }
  }, [user, setLocation]);

  if (!user) return null;

  const mercadoPagoUrl = getMercadoPagoCheckoutUrl(user.username);
  const displayBanca = packageRequest?.bancaCustom || packageRequest?.banca || "Não informada";

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
      
      <AppHeader showAdmin />
      
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 relative z-10">
        <div className="max-w-2xl w-full">
          {/* Main payment waiting card */}
          <div className="glass-card rounded-3xl p-8 md:p-10 text-center animate-slide-in-up">
            {/* Payment pending icon */}
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-500/30 to-orange-500/30 flex items-center justify-center">
              <span className="text-5xl">💳</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              Complete seu Pagamento
            </h1>
            
            <p className="text-gray-400 text-lg mb-6">
              {packageRequest?.plano === "plus" 
                ? "Complete o pagamento para ter acesso ilimitado a todos os concursos e módulos!"
                : "Seu pacote está reservado, mas precisa da confirmação do pagamento para iniciar a montagem."
              }
            </p>
            
            {/* Plan info */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full mb-8">
              {packageRequest?.plano === "plus" ? (
                <>
                  <span className="text-amber-400 font-bold">✨ Plano Plus</span>
                  <span className="text-white font-bold">R$ 197,00/mês</span>
                </>
              ) : (
                <>
                  <span className="text-orange-400 font-bold">⭐ Plano Individual</span>
                  <span className="text-white font-bold">R$ 97,00</span>
                </>
              )}
            </div>
            
            {/* Package details */}
            {packageRequest && (
              <div className="bg-white/5 rounded-2xl p-6 text-left mb-8 border border-white/10">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-orange-400">📋</span>
                  Seu Pacote Reservado:
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
                </div>
              </div>
            )}
            
            {/* Payment instructions */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6 text-left">
              <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                <span>💡</span>
                Formas de Pagamento:
              </h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• <strong className="text-white">PIX:</strong> Aprovação imediata</li>
                <li>• <strong className="text-white">Cartão de Crédito:</strong> Aprovação imediata</li>
                <li>• <strong className="text-white">Boleto:</strong> Aprovação em 3-4 dias úteis</li>
              </ul>
            </div>
            
            {/* Main CTA - Go to Mercado Pago */}
            <a
              href={mercadoPagoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-bold text-lg transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/40 mb-4"
            >
              💳 Ir para Checkout
            </a>
            
            <p className="text-gray-500 text-xs mb-8">
              Você será redirecionado para o Mercado Pago (ambiente seguro)
            </p>
            
            {/* Info banner */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
              <p className="text-amber-400 text-sm flex items-center justify-center gap-2">
                <span className="text-lg">⏰</span>
                Após o pagamento, a montagem do seu pacote será iniciada em até 24h!
              </p>
            </div>
            
            {/* Already paid? View tracking */}
            <div className="pt-6 border-t border-white/10">
              <p className="text-gray-500 text-sm mb-4">
                Já fez o pagamento e está aguardando liberação?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setLocation("/aguardando-pacote")}
                  className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 text-emerald-400 font-bold rounded-xl transition-all border border-emerald-500/30"
                >
                  📊 Acompanhar Produção
                </button>
                <a
                  href={`https://api.whatsapp.com/send?phone=5521980645070&text=${encodeURIComponent(`Olá! Já fiz o pagamento do Plano ${packageRequest?.plano === "plus" ? "Plus" : "Individual"} e estou aguardando liberação.\n\nMeu usuário: ${user?.username}${packageRequest?.concurso ? `\nConcurso: ${packageRequest.concurso}` : ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-medium rounded-xl transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Falar com Suporte
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
