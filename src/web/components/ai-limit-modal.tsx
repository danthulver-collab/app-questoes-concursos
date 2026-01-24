import React from 'react';
import { useLocation } from 'wouter';
import { X, AlertCircle, Sparkles, CreditCard } from 'lucide-react';
import { getUserPlan, PLAN_LIMITS } from '../lib/access-control';
import { getAIUsageInfo } from '../lib/ai-credits-system';

interface AILimitModalProps {
  show: boolean;
  onClose: () => void;
  reason: string;
  userId: string;
}

export function AILimitModal({ show, onClose, reason, userId }: AILimitModalProps) {
  const [, setLocation] = useLocation();
  const plan = getUserPlan(userId);
  const usageInfo = getAIUsageInfo(userId);

  if (!show) return null;

  const planName = {
    'trial': 'Trial Grátis',
    'free': 'Free',
    'individual': 'Individual',
    'plus': 'Plus'
  }[plan] || 'Free';

  const handleUpgrade = () => {
    onClose();
    setLocation('/planos');
  };

  const handleBuyCredits = () => {
    onClose();
    // Futura página de compra de créditos
    setLocation('/planos');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md glass-card rounded-2xl p-6 shadow-2xl border border-gray-700/50">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-800/50 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-orange-500/20">
            <AlertCircle className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
          Limite de Mensagens Atingido
        </h2>

        {/* Reason */}
        <p className="text-center text-gray-400 mb-6">
          {reason}
        </p>

        {/* Plan info */}
        <div className="mb-6 p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Seu plano atual:</span>
            <span className="text-sm font-bold text-cyan-400">{planName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Mensagens usadas:</span>
            <span className="text-sm font-bold text-white">
              {usageInfo.messagesUsed} / {usageInfo.limit === Infinity ? '∞' : usageInfo.limit}
            </span>
          </div>
          {usageInfo.resetTime && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              Limite renova: {usageInfo.resetTime}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3">
          {plan !== 'plus' && (
            <button
              onClick={handleUpgrade}
              className="w-full px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Upgrade para Plus
              <span className="text-xs opacity-75">200 msgs/mês</span>
            </button>
          )}

          <button
            onClick={handleBuyCredits}
            className="w-full px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Comprar Créditos
            <span className="text-xs opacity-75">A partir de R$ 9,90</span>
          </button>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl font-medium text-gray-400 bg-gray-800/50 hover:bg-gray-700/50 transition-all"
          >
            Voltar
          </button>
        </div>

        {/* Info text */}
        <p className="mt-4 text-xs text-center text-gray-500">
          💡 Com o plano Plus você tem 200 mensagens por mês e acesso ilimitado a todos os concursos
        </p>
      </div>
    </div>
  );
}
