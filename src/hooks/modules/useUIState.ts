/**
 * File: hooks/modules/useUIState.ts
 * Mục đích: Hook quản lý toàn bộ trạng thái giao diện của SabTask: tab đang mở, cờ loading,
 * trạng thái sidebar, chế độ sáng/tối, ngôn ngữ, các modal, đối tượng đang chọn/đang sửa,
 * panel thông báo và hàng đợi toast. Theme và ngôn ngữ được đồng bộ với localStorage.
 */

import { useState, useEffect } from 'react';
import { ViewMode, ToastMessage, Language, TaskStatus, Task, Project, User } from '../../types';
import { translations } from '../../translations';

/**
 * Hook tập trung mọi trạng thái giao diện và các setter tương ứng.
 * @returns Đối tượng gồm `state` (giá trị UI hiện tại kèm hàm dịch t) và `actions` (các hàm cập nhật).
 */
export const useUIState = () => {
  const [activeTab, setActiveTab] = useState<ViewMode>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('SabTask-theme') === 'dark'; } catch { return false; }
  });
  
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('SabTask-lang');
      if (stored === 'vi' || stored === 'en') return stored;
      return 'vi';
    } catch {
      return 'vi';
    }
  });

  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isMemberModalOpen, setMemberModalOpen] = useState(false); 
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>(TaskStatus.TODO);

  const [showNotifications, setShowNotifications] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  /** Mỗi khi darkMode đổi: lưu lựa chọn theme vào localStorage và thêm/bỏ class "dark" trên thẻ html. */
  useEffect(() => {
    localStorage.setItem('SabTask-theme', darkMode ? 'dark' : 'light');
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  /** Mỗi khi ngôn ngữ đổi: ghi nhớ lựa chọn vào localStorage để giữ nguyên sau khi tải lại trang. */
  useEffect(() => {
    localStorage.setItem('SabTask-lang', language);
  }, [language]);

  /**
   * Thêm một toast vào hàng đợi thông báo để hiển thị trên giao diện.
   * @param type Loại thông báo (thành công, lỗi hoặc thông tin).
   * @param message Nội dung hiển thị cho người dùng.
   */
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
  };

  /** Xoá một toast khỏi hàng đợi theo id, dùng khi người dùng đóng hoặc toast hết thời gian hiển thị. */
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  /**
   * Hàm dịch dùng trong component: tra chuỗi theo ngôn ngữ đang chọn.
   * @param key Khoá chuỗi trong bảng translations.
   * @returns Chuỗi đã dịch, hoặc trả về chính khoá nếu chưa có bản dịch.
   */
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
