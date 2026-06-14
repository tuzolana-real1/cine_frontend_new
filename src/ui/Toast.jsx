import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from './Button';

export const ToastContainer = () => {
  const { notifications, removeNotification } = useContext(NotificationContext);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            "flex items-center gap-3 rounded-md p-4 shadow-lg transition-all min-w-[300px]",
            notification.type === 'success' ? 'bg-green-600 text-white' :
            notification.type === 'error' ? 'bg-red-600 text-white' :
            'bg-surface text-text border border-white/10'
          )}
        >
          {notification.type === 'success' && <CheckCircle size={20} />}
          {notification.type === 'error' && <AlertCircle size={20} />}
          {notification.type === 'info' && <Info size={20} />}
          
          <span className="flex-1 text-sm font-medium">{notification.message}</span>
          
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-white/70 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
