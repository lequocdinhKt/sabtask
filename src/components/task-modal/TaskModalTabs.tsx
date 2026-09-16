/**
 * File: components/task-modal/TaskModalTabs.tsx
 * Mục đích: Thanh tab của modal task, cho phép chuyển qua lại giữa ba tab chi tiết, subtask và
 * bình luận. Tab đang chọn được tô sáng, riêng tab subtask và bình luận kèm số lượng bản ghi hiện có.
 */

import React from 'react';
import { TaskModalTabsProps } from '../../types';
import { useApp } from '../../context/AppContext';

/**
 * Component thanh tab: mỗi nút gọi setActiveTab để đổi tab đang mở và so sánh với activeTab
 * để quyết định kiểu hiển thị được tô sáng.
 */
export const TaskModalTabs: React.FC<TaskModalTabsProps> = ({ activeTab, setActiveTab, subtasksCount, commentsCount }) => {
  const { state } = useApp();
  const { t } = state;
  return (
    <div className="flex border-b border-slate-100 dark:border-slate-700 px-6">
      <button 
        onClick={() => setActiveTab('details')}
        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
      >
        {t('details')}
      </button>
      <button 
        onClick={() => setActiveTab('subtasks')}
        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'subtasks' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
      >
        {t('subtasks')} <span className="bg-slate-100 dark:bg-slate-700 text-xs px-1.5 py-0.5 rounded-full">{subtasksCount}</span>
      </button>
      <button 
        onClick={() => setActiveTab('comments')}
        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'comments' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
      >
        {t('comments')} <span className="bg-slate-100 dark:bg-slate-700 text-xs px-1.5 py-0.5 rounded-full">{commentsCount}</span>
      </button>
    </div>
  );
};
