/**
 * Componente de Notificações Sonoras para Admin
 * Monitora novos cadastros e pagamentos em tempo real
 * Toca sons automaticamente
 */

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

export function AdminNotifications() {
  const [lastCheckedSignup, setLastCheckedSignup] = useState<string>(new Date().toISOString());
  const [lastCheckedPayment, setLastCheckedPayment] = useState<string>(new Date().toISOString());
  const audioMoneyRef = useRef<HTMLAudioElement>(null);
  const audioSignupRef = useRef<HTMLAudioElement>(null);
  
  // Tocar som de dinheiro
  const playMoneySound = () => {
    if (audioMoneyRef.current) {
      audioMoneyRef.current.currentTime = 0;
      audioMoneyRef.current.play().catch(e => console.log('Erro ao tocar som:', e));
    }
  };
  
  // Tocar som de cadastro
  const playSignupSound = () => {
    if (audioSignupRef.current) {
      audioSignupRef.current.currentTime = 0;
      audioSignupRef.current.play().catch(e => console.log('Erro ao tocar som:', e));
    }
  };
  
  // Mostrar notificação visual
  const showNotification = (title: string, body: string, type: 'signup' | 'payment') => {
    // Notificação do navegador se permitido
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: type === 'payment' ? '💰' : '👤'
      });
    }
    
    // Notificação visual na tela
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-[9999] glass-card rounded-xl p-4 border-2 ${
      type === 'payment' 
        ? 'border-green-500/50 bg-green-500/20' 
        : 'border-blue-500/50 bg-blue-500/20'
    } shadow-2xl animate-slide-in-right`;
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="text-3xl">${type === 'payment' ? '💰' : '🎉'}</div>
        <div>
          <div class="font-bold text-white">${title}</div>
          <div class="text-sm text-gray-300">${body}</div>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    
    // Remover após 5 segundos
    setTimeout(() => {
      notification.remove();
    }, 5000);
  };
  
  // Monitorar novos cadastros
  const checkNewSignups = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, created_at')
        .gt('created_at', lastCheckedSignup)
        .order('created_at', { ascending: false });
      
      if (!error && data && data.length > 0) {
        // Novos cadastros detectados!
        for (const profile of data) {
          console.log('🎉 NOVO CADASTRO:', profile.email);
          playSignupSound();
          showNotification(
            '🎉 Mais um cadastro!',
            `${profile.email} acabou de se cadastrar`,
            'signup'
          );
        }
        setLastCheckedSignup(new Date().toISOString());
      }
    } catch (e) {
      console.error('Erro ao verificar cadastros:', e);
    }
  };
  
  // Monitorar novos pagamentos
  const checkNewPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('plan_requests')
        .select('id, email, plano, created_at, status')
        .gt('created_at', lastCheckedPayment)
        .in('status', ['pronto', 'aguardando_montagem', 'em_andamento'])
        .order('created_at', { ascending: false });
      
      if (!error && data && data.length > 0) {
        // Novos pagamentos detectados!
        for (const payment of data) {
          console.log('💰 NOVO PAGAMENTO:', payment.email, payment.plano);
          playMoneySound();
          showNotification(
            '💰 Nova Venda!',
            `${payment.email} comprou o Plano ${payment.plano === 'individual' ? 'Individual' : 'Plus'}!`,
            'payment'
          );
        }
        setLastCheckedPayment(new Date().toISOString());
      }
    } catch (e) {
      console.error('Erro ao verificar pagamentos:', e);
    }
  };
  
  // Solicitar permissão para notificações
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  // Monitoramento em tempo real
  useEffect(() => {
    console.log('🔔 Sistema de notificações do admin ATIVO');
    
    // Verificar a cada 5 segundos
    const interval = setInterval(() => {
      checkNewSignups();
      checkNewPayments();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [lastCheckedSignup, lastCheckedPayment]);
  
  return (
    <>
      {/* Áudios pré-carregados */}
      <audio ref={audioMoneyRef} preload="auto">
        <source src="/audio/som-dinheiro.mp3" type="audio/mpeg" />
      </audio>
      <audio ref={audioSignupRef} preload="auto">
        <source src="/audio/mais-um-cadastro.mp3" type="audio/mpeg" />
      </audio>
      
      {/* Indicador visual (opcional) */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
        <div className="glass-card rounded-full px-4 py-2 border border-green-500/30 bg-green-500/10">
          <span className="text-green-400 text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Monitorando vendas
          </span>
        </div>
      </div>
    </>
  );
}
