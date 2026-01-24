/**
 * Sistema de Notificações para Admin
 * Envia notificações quando há novas solicitações de pacotes/planos
 */

export interface AdminNotification {
  id: string;
  type: 'package_request' | 'plan_request' | 'user_registration';
  title: string;
  message: string;
  userId: string;
  userName: string;
  userEmail: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

const NOTIFICATIONS_KEY = 'admin_notifications';
const LAST_CHECK_KEY = 'admin_last_check';

/**
 * Salva notificação no localStorage
 */
export const saveNotification = (notification: Omit<AdminNotification, 'id' | 'timestamp' | 'read'>): AdminNotification => {
  const notifications = getNotifications();
  
  const newNotification: AdminNotification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    read: false
  };
  
  notifications.unshift(newNotification); // Adiciona no início
  
  // Mantém apenas as últimas 100 notificações
  const limited = notifications.slice(0, 100);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(limited));
  
  return newNotification;
};

/**
 * Busca todas as notificações
 */
export const getNotifications = (): AdminNotification[] => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return [];
  }
};

/**
 * Busca notificações não lidas
 */
export const getUnreadNotifications = (): AdminNotification[] => {
  return getNotifications().filter(n => !n.read);
};

/**
 * Conta notificações não lidas
 */
export const getUnreadCount = (): number => {
  return getUnreadNotifications().length;
};

/**
 * Marca notificação como lida
 */
export const markAsRead = (notificationId: string): void => {
  const notifications = getNotifications();
  const updated = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
};

/**
 * Marca todas como lidas
 */
export const markAllAsRead = (): void => {
  const notifications = getNotifications();
  const updated = notifications.map(n => ({ ...n, read: true }));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
};

/**
 * Deleta notificação
 */
export const deleteNotification = (notificationId: string): void => {
  const notifications = getNotifications();
  const filtered = notifications.filter(n => n.id !== notificationId);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filtered));
};

/**
 * Limpa todas as notificações
 */
export const clearAllNotifications = (): void => {
  localStorage.removeItem(NOTIFICATIONS_KEY);
};

/**
 * Atualiza timestamp da última verificação
 */
export const updateLastCheck = (): void => {
  localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());
};

/**
 * Busca timestamp da última verificação
 */
export const getLastCheck = (): Date | null => {
  const stored = localStorage.getItem(LAST_CHECK_KEY);
  return stored ? new Date(stored) : null;
};

/**
 * Cria notificação de nova solicitação de pacote
 */
export const notifyPackageRequest = (
  userName: string,
  userEmail: string,
  userId: string,
  concurso: string,
  extras?: string
): AdminNotification => {
  return saveNotification({
    type: 'package_request',
    title: '🎯 Nova Solicitação de Pacote',
    message: `${userName} solicitou o pacote "${concurso}"${extras ? ` com extras: ${extras}` : ''}`,
    userId,
    userName,
    userEmail,
    data: { concurso, extras }
  });
};

/**
 * Cria notificação de novo registro de usuário
 */
export const notifyUserRegistration = (
  userName: string,
  userEmail: string,
  userId: string
): AdminNotification => {
  return saveNotification({
    type: 'user_registration',
    title: '👤 Novo Usuário Registrado',
    message: `${userName} (${userEmail}) criou uma conta`,
    userId,
    userName,
    userEmail
  });
};

/**
 * Exibe notificação do navegador (Web Notification API)
 */
export const showBrowserNotification = (title: string, message: string, icon?: string) => {
  if (!('Notification' in window)) {
    console.warn('Este navegador não suporta notificações');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'admin-notification',
      requireInteraction: false
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: icon || '/favicon.ico'
        });
      }
    });
  }
};

/**
 * Solicita permissão para notificações do navegador
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

/**
 * Verifica se há permissão para notificações
 */
export const hasNotificationPermission = (): boolean => {
  return 'Notification' in window && Notification.permission === 'granted';
};
