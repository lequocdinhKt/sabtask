
/**
 * File: HeaderControls.tsx
 * Trách nhiệm: Nút theme sáng/tối, thông báo và toggle sidebar.
 * Liên quan: useUIState.ts, NotificationsPanel.tsx, Header.tsx.
 */

import React from 'react';
import { useApp } from '../../../context/AppContext';
import { Sun, Moon, Bell, PanelLeft, Menu } from 'lucide-react';

/** Nút chuyển theme và mở panel thông báo */
export const HeaderControls: React.FC = () => {
  const { state, actions } = useApp();
  const notificationsCount = state.notifications.filter(n => !n.read).length;

  return (
    <>
        {/* Theme Toggle */}
        <button 
          onClick={() => actions.setDarkMode(!state.darkMode)}
          className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl md:rounded-2xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all shadow-sm"
        >
          {state.darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
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

/** Nút mở/đóng sidebar trên mobile và desktop */
export const SidebarToggle: React.FC = () => {
    const { state, actions } = useApp();
    return (
        <>
            {/* Mobile Toggle */}
            <button onClick={() => actions.setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-colors">
                <Menu size={24} />
            </button>

            {/* Desktop Toggle */}
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
