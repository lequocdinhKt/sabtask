/**
 * File: NotificationsPanel.tsx
 * Trách nhiệm: Panel dropdown thông báo từ header.
 * Liên quan: notifications/*, useDataFetching, HeaderControls.
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell } from 'lucide-react';
import { Card } from './ui/Card';
import { NotificationsHeader } from './notifications/NotificationsHeader';
import { NotificationsList } from './notifications/NotificationsList';
import { NotificationsFooter } from './notifications/NotificationsFooter';

/** Panel thông báo floating bên cạnh icon bell */
export const NotificationsPanel: React.FC = () => {
  const { state, actions } = useApp();
  const { notifications } = state;

  if (notifications.length === 0) {
    return (
      <Card className="absolute top-20 right-6 w-96 z-50 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl border-slate-200 dark:border-slate-700">
        <div className="flex flex-col items-center justify-center py-10 text-slate-500 dark:text-slate-400">
          <Bell size={48} className="mb-4 opacity-20" />
          <p className="text-sm font-medium">No notifications yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card noPadding className="absolute top-20 right-6 w-96 z-50 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl border-slate-200 dark:border-slate-700 max-h-[80vh] flex flex-col">
      <NotificationsHeader 
          unreadCount={notifications.filter(n => !n.read).length}
          onMarkAllRead={actions.markAllNotificationsAsRead}
          onClose={() => actions.setShowNotifications(false)}
      />
      
      <NotificationsList 
          notifications={notifications}
          onMarkRead={actions.markNotificationAsRead}
      />
      
      <NotificationsFooter onViewAll={() => { /* Navigate to activity view if exists */ }} />
    </Card>
  );
};
