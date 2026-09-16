/**
 * File: components/notifications/NotificationsList.tsx
 * Mục đích: Danh sách cuộn các thông báo của người dùng, mỗi dòng gồm icon theo loại thông báo,
 * tiêu đề, nội dung và giờ tạo. Thông báo chưa đọc được làm nổi bật và bấm vào một dòng sẽ
 * gọi hành động đánh dấu thông báo đó là đã đọc.
 */

import React from 'react';
import { NotificationsListProps, Notification } from '../../types';
import { User, Clock, AlertCircle, MessageSquare } from 'lucide-react';

/** Component danh sách thông báo: render từng dòng thông báo và cho phép đánh dấu đã đọc khi bấm vào. */
export const NotificationsList: React.FC<NotificationsListProps> = ({ notifications, onMarkRead }) => {
  
  /**
   * Chọn icon và màu tương ứng với loại thông báo để hiển thị ở đầu mỗi dòng.
   * @param type Loại thông báo (giao việc, đổi trạng thái, đến hạn, còn lại là bình luận).
   * @returns Phần tử icon đã gắn màu phù hợp.
   */
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ASSIGNMENT': return <User size={16} className="text-blue-500" />;
      case 'STATUS_CHANGE': return <Clock size={16} className="text-amber-500" />;
      case 'DUE_DATE': return <AlertCircle size={16} className="text-rose-500" />;
      default: return <MessageSquare size={16} className="text-emerald-500" />;
    }
  };

  return (
    <div className="overflow-y-auto custom-scrollbar">
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            onClick={() => onMarkRead(notification.id)}
            className={`
              p-4 border-b border-slate-50 dark:border-slate-700/50 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50
              ${!notification.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}
            `}
          >
            <div className="flex gap-3">
              <div className={`
                mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${!notification.read ? 'bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}
              `}>
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-0.5">
                    <h4 className={`text-sm ${!notification.read ? 'font-bold text-slate-800 dark:text-slate-200' : 'font-medium text-slate-600 dark:text-slate-400'}`}>
                    {notification.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                    {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {notification.message}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
    </div>
  );
};
