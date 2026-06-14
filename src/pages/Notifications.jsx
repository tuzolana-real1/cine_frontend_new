import { EmptyState } from '../ui/EmptyState';
import { Bell } from 'lucide-react';
import { NotificationPanel } from '../ui/NotificationPanel';

export default function Notifications() {
  return (
    <div className="container mx-auto px-4 py-8 flex-1">
      <h1 className="text-3xl font-bold mb-8">Notificações</h1>
      <NotificationPanel />
    </div>
  );
}
