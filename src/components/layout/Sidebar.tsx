/**
 * File: components/layout/Sidebar.tsx
 * Mục đích: Thanh điều hướng bên trái của ứng dụng. Render danh sách menu từ NAV_CONFIG
 * để đổi view đang hiển thị, hiển thị thông tin người dùng hiện tại để mở modal hồ sơ,
 * và cung cấp nút đăng xuất; đồng thời xử lý trạng thái đóng/mở trên mobile và desktop.
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
    LayoutDashboard, Kanban, List, Calendar, Clock, Users, LogOut, Folder, MessageSquare
} from 'lucide-react';
import { NAV_CONFIG } from '../../constants';
import { ViewMode } from '../../types';

/** Bảng tra icon theo iconId khai báo trong NAV_CONFIG. */
const ICON_MAP = {
    dashboard: LayoutDashboard,
    projects: Folder,
    folder: Folder,
    kanban: Kanban,
    list: List,
    hub: MessageSquare,
    calendar: Calendar,
    time: Clock,
    team: Users,
};

/** Sub-component vẽ logo chữ S của SabTask bằng SVG cho khối thương hiệu ở đầu sidebar. */
const LogoIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
        <path d="M7 6C7 4.89543 7.89543 4 9 4H15C16.1046 4 17 4.89543 17 6V8C17 9.10457 16.1046 10 15 10H9C7.89543 10 7 10.8954 7 12V14C7 15.1046 7.89543 16 9 16H15C16.1046 16 17 15.1046 17 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
        <path d="M17 18C17 19.1046 16.1046 20 15 20H9C7.89543 20 7 19.1046 7 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
    </svg>
);

/** Component sidebar chính: lớp phủ trên mobile, menu điều hướng và khối người dùng ở chân. */
export const Sidebar: React.FC = () => {
    const { state, actions } = useApp();
    const { activeTab, user, isSidebarOpen, isDesktopSidebarOpen, t } = state;
    const { setActiveTab, handleLogout, setIsSidebarOpen, setProfileModalOpen } = actions;

    return (
        <>
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={`
        fixed lg:static inset-y-0 left-0 bg-slate-50/50 dark:bg-dark-surface border-r border-slate-200 dark:border-dark-border z-50
        flex flex-col transition-all duration-300 ease-in-out overflow-hidden
        ${isSidebarOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full lg:translate-x-0'}
        ${isDesktopSidebarOpen ? 'lg:w-[260px]' : 'lg:w-0 lg:border-none'}
      `}>
                <div className="p-6 h-20 flex items-center min-w-[260px]">
                    <div className="flex items-center gap-3 text-primary-600 dark:text-primary-400">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                            <LogoIcon />
                        </div>
                        <span className="font-logo font-bold text-xl tracking-tight text-brand dark:text-brand-bright">
                            SabTask
                        </span>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar min-w-[260px]">
                    <p className="px-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('mainMenu')}</p>
                    {NAV_CONFIG.map(item => {
                        const Icon = ICON_MAP[item.iconId as keyof typeof ICON_MAP] || Folder;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id as ViewMode); setIsSidebarOpen(false); }}
                                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group whitespace-nowrap
                  ${isActive
                                        ? 'bg-white dark:bg-white/10 text-primary-700 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-white/10'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                    }
                `}
                            >
                                <Icon size={18} className={isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} />
                                {t(item.id as any)}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto min-w-[260px] border-t border-slate-200 dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex items-center gap-3 flex-1 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
                            onClick={() => setProfileModalOpen(true)}
                        >
                            <img src={user.avatar} alt="User" className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/10" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleLogout()}
                            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-all"
                            title={t('logout')}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};
