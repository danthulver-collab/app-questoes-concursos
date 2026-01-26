import { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead,
  deleteNotification,
  type AdminNotification 
} from '../lib/notifications';

interface SupabaseNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  user_id: string;
  user_name: string;
  user_email: string;
  read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifications = async () => {
    // Busca do localStorage (fallback)
    const localNotifications = getNotifications();
    const localUnread = getUnreadCount();
    
    // Busca do Supabase
    try {
      const { data: supabaseNotifs, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (!error && supabaseNotifs && supabaseNotifs.length > 0) {
        // Converte notificações do Supabase para o formato local
        const convertedNotifs: AdminNotification[] = supabaseNotifs.map((n: SupabaseNotification) => ({
          id: n.id,
          type: n.type as AdminNotification['type'],
          title: n.title,
          message: n.message,
          userId: n.user_id,
          userName: n.user_name,
          userEmail: n.user_email,
          timestamp: n.created_at,
          read: n.read
        }));
        
        // Combina com localStorage sem duplicatas (Supabase tem prioridade)
        const supabaseIds = new Set(convertedNotifs.map(n => n.id));
        const uniqueLocal = localNotifications.filter(n => !supabaseIds.has(n.id));
        
        const allNotifications = [...convertedNotifs, ...uniqueLocal]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        setNotifications(allNotifications);
        setUnreadCount(allNotifications.filter(n => !n.read).length);
        console.log('📬 Notificações carregadas:', allNotifications.length, '(Supabase:', supabaseNotifs.length, ')');
        return;
      }
    } catch (e) {
      console.log('⚠️ Erro ao buscar notificações do Supabase:', e);
    }
    
    // Fallback para localStorage apenas
    setNotifications(localNotifications);
    setUnreadCount(localUnread);
  };

  useEffect(() => {
    refreshNotifications();
    
    // Atualiza a cada 30 segundos
    const interval = setInterval(refreshNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    // Tenta marcar no Supabase primeiro
    try {
      await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('id', notificationId);
    } catch (e) {
      console.log('Erro ao marcar no Supabase, usando localStorage');
    }
    
    // Marca no localStorage também
    markAsRead(notificationId);
    refreshNotifications();
  };

  const handleMarkAllAsRead = async () => {
    // Tenta marcar todas no Supabase
    try {
      await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('read', false);
    } catch (e) {
      console.log('Erro ao marcar todas no Supabase');
    }
    
    markAllAsRead();
    refreshNotifications();
  };

  const handleDelete = async (notificationId: string) => {
    // Tenta deletar do Supabase
    try {
      await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', notificationId);
    } catch (e) {
      console.log('Erro ao deletar do Supabase');
    }
    
    deleteNotification(notificationId);
    refreshNotifications();
  };

  const getNotificationIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'package_request':
        return '🎯';
      case 'plan_request':
        return '💎';
      case 'user_registration':
        return '👤';
      default:
        return '🔔';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="relative">
      {/* Botão do Sino */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-300" />
        
        {/* Badge de contador */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de Notificações */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Painel */}
          <div className="absolute right-0 mt-2 w-96 max-h-[600px] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="sticky top-0 bg-slate-900 border-b border-white/10 p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">Notificações</h3>
                <p className="text-xs text-gray-400">
                  {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : 'Tudo em dia!'}
                </p>
              </div>
              
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <CheckCheck className="w-4 h-4" />
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {/* Lista de Notificações */}
            <div className="overflow-y-auto max-h-[500px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${
                      !notification.read ? 'bg-blue-500/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Ícone */}
                      <div className="flex-shrink-0 text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-white text-sm">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-400 mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.timestamp)}
                          </span>
                          
                          <div className="flex gap-2">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors"
                                title="Marcar como lida"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
