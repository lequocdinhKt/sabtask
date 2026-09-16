
/**
 * File: useUIState.ts
 * Trách nhiệm: Quản lý state giao diện (tab, modal, theme, ngôn ngữ, toast, selection).
 * Liên quan: useAppLogic.ts, translations.ts, các component layout/modal.
 */
/**
 * File: useUIState.ts
 * Trách nhiệm: Quản lý trạng thái UI (tab, sidebar, theme, ngôn ngữ, modal, toast).
 * Liên quan: useAppLogic.ts, translations.ts, AppContext.tsx.
 */

import { useState, useEffect } from 'react';
import { ViewMode, ToastMessage, Language, TaskStatus, Task, Project, User } from '../../types';
import { translations } from '../../translations';

/** Hook giữ toàn bộ UI state và action setter tương ứng */
/** Hook trạng thái UI toàn cục: tab, modal, theme, ngôn ngữ, toast */
export const useUIState = () => {
  // --- Global UI ---
  const [activeTab, setActiveTab] = useState<ViewMode>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // --- Sidebar & Layout ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true); // Desktop

  // --- Theme & Language ---
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('SabTask-theme') === 'dark'; } catch { return false; }
  });
  
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('SabTask-lang');
      if (stored === 'vi' || stored === 'en') return stored;
      return 'vi'; // mặc định tiếng Việt; bỏ qua 'de' cũ nếu còn trong localStorage
    } catch {
      return 'vi';
    }
  });

  // --- Modals State ---
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isMemberModalOpen, setMemberModalOpen] = useState(false); 
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);

  // --- Selection / Editing State ---
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>(TaskStatus.TODO);

  // --- Notifications Panel ---
  const [showNotifications, setShowNotifications] = useState(false);

  // --- Toast System ---
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('SabTask-theme', darkMode ? 'dark' : 'light');
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('SabTask-lang', language);
  }, [language]);

  // --- Actions ---
  /** Thêm toast thông báo tạm thời */
  /** Thêm toast mới vào hàng đợi thông báo */
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
  };

  /** Gỡ toast theo id */
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  /** Lấy chuỗi đã dịch theo khóa i18n hiện tại */
  /** Lấy chuỗi dịch theo key và ngôn ngữ hiện tại */
  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || key;
  };

  return {
    state: {
      activeTab, isLoading, isSidebarOpen, isDesktopSidebarOpen, darkMode, language,
      isTaskModalOpen, isProfileModalOpen, isMemberModalOpen, isProjectModalOpen,
      selectedProject, selectedMember, editingTask, editingMember, editingProject,
      newTaskStatus, showNotifications, toasts, t
    },
    actions: {
      setActiveTab, setIsLoading, setIsSidebarOpen, setIsDesktopSidebarOpen, setDarkMode, setLanguage,
      setTaskModalOpen, setProfileModalOpen, setMemberModalOpen, setProjectModalOpen,
      setSelectedProject, setSelectedMember, setEditingTask, setEditingMember, setEditingProject,
      setNewTaskStatus, setShowNotifications, addToast, removeToast
    }
  };
};
