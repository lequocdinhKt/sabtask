/**
 * File: components/NotificationsPanel.tsx
 * Mục đích: Panel thông báo dạng dropdown mở từ biểu tượng chuông trên header. Panel lấy danh
 * sách thông báo thật của người dùng hiện tại trong state chung (nguồn là bảng notifications
 * của Supabase, được đồng bộ realtime), hiển thị trạng thái rỗng khi chưa có thông báo nào và
 * ghép ba phần header, danh sách, footer cùng các hành động đánh dấu đã đọc.
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell } from 'lucide-react';
import { Card } from './ui/Card';
import { NotificationsHeader } from './notifications/NotificationsHeader';
import { NotificationsList } from './notifications/NotificationsList';
import { NotificationsFooter } from './notifications/NotificationsFooter';

/** Component panel thông báo: tính số thông báo chưa đọc và nối các hành động đánh dấu đã đọc, đóng panel. */
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
      
      <NotificationsFooter onViewAll={() => { }} />
    </Card>
  );
};
