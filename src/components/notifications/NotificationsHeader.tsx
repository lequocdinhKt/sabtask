/**
 * File: NotificationsHeader.tsx
 * Trách nhiệm: Header panel thông báo — đếm chưa đọc, mark all, đóng.
 * Liên quan: NotificationsPanel.tsx.
 */

import React from 'react';
import { NotificationsHeaderProps } from '../../types';
import { Check, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

/** Header panel với số unread và nút đánh dấu đã đọc */
export const NotificationsHeader: React.FC<NotificationsHeaderProps> = ({ unreadCount, onMarkAllRead, onClose }) => {
  const { state } = useApp();
  const { t } = state;
  return (
    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-3xl">
        <div>
           <h3 className="font-bold text-slate-900 dark:text-white">{t('notifications')}</h3>
           <p className="text-xs text-slate-600 dark:text-slate-300">{unreadCount} {t('unread')}</p>
        </div>
        <div className="flex gap-1">
            <button 
                onClick={onMarkAllRead}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                title={t('markAllRead')}
            >
                <Check size={16} />
            </button>
            <button 
                onClick={onClose}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
                <X size={16} />
            </button>
        </div>
      </div>
  );
};
