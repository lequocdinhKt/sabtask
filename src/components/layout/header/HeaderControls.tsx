/**
 * File: components/layout/header/HeaderControls.tsx
 * Mục đích: Nhóm các nút điều khiển nhanh trên header. Gồm nút đổi giao diện sáng/tối,
 * nút mở panel thông báo kèm chỉ dấu số thông báo chưa đọc, và các nút bật/tắt sidebar
 * cho cả mobile lẫn desktop.
 */

import React from 'react';
import { useApp } from '../../../context/AppContext';
import { Sun, Moon, Bell, PanelLeft, Menu } from 'lucide-react';

/** Component chứa nút đổi theme sáng/tối và nút mở panel thông báo. */
export const HeaderControls: React.FC = () => {
  const { state, actions } = useApp();
  const notificationsCount = state.notifications.filter(n => !n.read).length;

  return (
    <>
        <button 
          onClick={() => actions.setDarkMode(!state.darkMode)}
          className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl md:rounded-2xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all shadow-sm"
        >
          {state.darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button 
          onClick={() => actions.setShowNotifications(!state.showNotifications)}
          className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl md:rounded-2xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all relative shadow-sm"
        >
          <Bell size={20} />
          {notificationsCount > 0 && (
            <span className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-dark-surface animate-pulse"></span>
          )}
        </button>
    </>
  );
};

/** Component nút bật/tắt sidebar: mở sidebar dạng overlay trên mobile, thu gọn cột trên desktop. */
export const SidebarToggle: React.FC = () => {
    const { state, actions } = useApp();
    return (
        <>
            <button onClick={() => actions.setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-colors">
                <Menu size={24} />
            </button>

            <button 
                onClick={() => actions.setIsDesktopSidebarOpen(!state.isDesktopSidebarOpen)} 
                className="hidden lg:flex p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
                title="Toggle Sidebar"
            >
                <PanelLeft size={24} />
            </button>
        </>
    )
}
