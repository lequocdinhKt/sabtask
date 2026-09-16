/**
 * File: components/notifications/NotificationsFooter.tsx
 * Mục đích: Phần chân panel thông báo, chỉ chứa một nút để xem toàn bộ hoạt động;
 * hành vi khi bấm do component cha truyền vào qua prop onViewAll.
 */

import React from 'react';
import { NotificationsFooterProps } from '../../types';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';

/** Component chân panel thông báo với nút xem toàn bộ hoạt động. */
export const NotificationsFooter: React.FC<NotificationsFooterProps> = ({ onViewAll }) => {
  const { state } = useApp();
  const { t } = state;
  return (
    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-3xl border-t border-slate-100 dark:border-slate-700 text-center">
         <Button onClick={onViewAll} variant="ghost" size="sm" className="w-full text-xs text-slate-500">{t('viewAllActivity')}</Button>
    </div>
  );
};
