import { useState, useEffect } from "react";
import { useSearch, useLocation } from "wouter";
import { AppHeader } from "../components/app-header";
import { useAuth } from "../lib/auth-context-supabase";
import { getRequestById, setPaymentLink, type PlanRequest } from "../lib/plan-requests";
import { ArrowRight, CreditCard, CheckCircle, AlertCircle } from "lucide-react";

export default function CheckoutPage() {
  const { user } = useAuth();
  const search = useSearch();
  const [, setLocation] = useLocation();
  const [request, setRequest] = useState<PlanRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  const urlParams = new URLSearchParams(search);
  const requestId = urlParams.get('request');
  const planType = urlParams.get('plan');

  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }

    if (!requestId) {
      setLocation("/planos");
      return;
    }

    // Carregar solicitação
    const req = getRequestById(requestId);
    if (!req) {
      setLocation("/planos");
      return;
    }

    setRequest(req);
    setLoading(false);
  }, [user, requestId, setLocation]);

  const handleProceedToPayment = () => {
    if (!request) return;

    setRedirecting(true);

    // Links de pagamento do Mercado Pago
    const paymentUrl = request.planType === "individual"
      ? "https://mpago.la/1ym97zu"
      : "https://mpago.la/1AtgXnn";

    // Salvar link de pagamento na solicitação
    setPaymentLink(request.id, paymentUrl);

    // Pequeno delay para dar feedback visual
    setTimeout(() => {
      window.location.href = paymentUrl;
    }, 800);
  };

  const handleViewMyRequest = () => {
    // Redirecionar para tela de acompanhamento
    setLocation("/aguardando-pagamento");
  };
  
  const handleAlreadyPaid = () => {
    // Cliente informa que já pagou, redirecionar para acompanhamento
    setLocation("/aguardando-pagamento");
  };

  if (loading || !request) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  const planDetails = {
    individual: {
      name: "Plano Individual",
      price: "R$ 97/mês",
      color: "from-orange-500 to-amber-500",
      features: [
        "Questões ilimitadas",
        "1 concurso específico personalizado",
        "Chat IA com 20 mensagens/mês",
        "Ver comentários e explicações",
        "Estatísticas avançadas",
        "Plano de estudos personalizado"
      ]
    },
    plus: {
      name: "Plano Plus",
      price: "R$ 197/mês",
      color: "from-amber-400 to-yellow-400",
      features: [
        "✅ Questões ilimitadas",
        "✅ TODOS os concursos disponíveis",
        "✅ Chat IA com 200 mensagens/mês",
        "✅ Comentários completos e elaborados",
        "🎧 Comentários em áudio (TTS)",
        "📝 Anotações ilimitadas",
        "✅ Estatísticas avançadas completas",
        "✅ Plano de estudos personalizado",
        "✅ Suporte prioritário"
      ]
    }
  };

  const plan = planDetails[request.planType];

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-50" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

      <AppHeader showBack backUrl="/planos" title="Checkout" />

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="max-w-2xl w-full">
          {/* Success Header */}
          <div className="text-center mb-8 animate-slide-in-up">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Solicitação Criada!
            </h1>
            <p className="text-gray-400">
              Seu pedido #{request.id.slice(-8)} foi registrado com sucesso
            </p>
          </div>

          {/* Plan Details Card */}
          <div className="glass-card rounded-3xl p-6 md:p-8 mb-6 animate-slide-in-up animation-delay-100">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                <p className={`text-3xl font-black bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                  {plan.price}
                </p>
              </div>
              <div className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
                <span className="text-yellow-400 text-sm font-bold">
                  ⏳ Aguardando Pagamento
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-400 font-semibold mb-3">O que está incluído:</p>
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* Info Alert */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-300 font-medium mb-1">
                    Como funciona:
                  </p>
                  <ol className="text-gray-400 space-y-1 list-decimal list-inside">
                    <li>Você será redirecionado para o Mercado Pago</li>
                    <li>Complete o pagamento com segurança</li>
                    <li>Aguarde a confirmação do admin (até 24h)</li>
                    <li>Acompanhe o status em "Meu Pedido"</li>
                    {request.planType === "individual" && (
                      <li>Seu conteúdo personalizado será criado</li>
                    )}
                  </ol>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleProceedToPayment}
                disabled={redirecting}
                className={`w-full py-4 px-6 bg-gradient-to-r ${plan.color} rounded-xl font-bold text-white hover:scale-[1.02] transition-all flex items-center justify-center gap-2 ${
                  redirecting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {redirecting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Redirecionando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Ir para Pagamento
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Botão "Já fiz o pagamento" apenas para Individual */}
              {request.planType === 'individual' && (
                <button
                  onClick={handleAlreadyPaid}
                  className="w-full py-3 px-6 glass-card rounded-xl font-medium text-emerald-400 hover:bg-emerald-500/10 transition-all border border-emerald-500/30"
                >
                  ✅ Já fiz o pagamento
                </button>
              )}

              <button
                onClick={() => setLocation("/planos")}
                className="w-full py-3 px-6 text-gray-400 hover:text-white transition-all text-sm"
              >
                ← Voltar para Planos
              </button>
            </div>
          </div>

          {/* Help Text */}
          <p className="text-center text-xs text-gray-500">
            💡 Após o pagamento, você receberá uma confirmação e poderá acompanhar<br />
            o status da sua solicitação na área "Meu Pedido"
          </p>
        </div>
      </main>
    </div>
  );
}
