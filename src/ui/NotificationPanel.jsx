import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { notificationsApi } from '../api/notifications';
import { Button } from './Button';

export const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await notificationsApi.getAll();
        setNotifications(response.data || []);
      } catch (error) {
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-surface p-6 text-center text-sm text-muted">
        Carregando notificações...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-surface p-6 text-center text-muted">
        Sem notificações no momento.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-surface p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Bell size={18} /> Notificações
        </div>
        <Button variant="secondary" size="sm" onClick={async () => {
          await notificationsApi.markAllAsRead();
          setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
        }}>
          Marcar todas
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <div key={notification.id} className={`rounded-2xl border p-4 ${notification.read ? 'border-white/10 bg-background' : 'border-white/20 bg-surface'} transition-colors`}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{notification.title || 'Nova notificação'}</p>
              {notification.read ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">
                  <Check size={14} /> Lida
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                  Nova
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-muted">{notification.message || notification.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
