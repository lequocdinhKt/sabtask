/**
 * File: components/task-modal/TaskDetails.tsx
 * Mục đích: Nội dung tab "Chi tiết" trong modal task, gồm các trường nhập tiêu đề, trạng thái,
 * mức ưu tiên, project, người thực hiện, hạn hoàn thành và mô tả. Ngoài ra cung cấp hai nút gọi AI:
 * tự gợi ý mức ưu tiên và gợi ý danh sách subtask từ nội dung task đang nhập.
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { TaskDetailsProps, TaskStatus, Priority } from '../../types';
import { useApp } from '../../context/AppContext';

/**
 * Component form chi tiết task: nhận giá trị và setter của từng trường từ modal cha nên không
 * tự giữ state, chỉ chịu trách nhiệm hiển thị và đẩy thay đổi lên trên.
 */
export const TaskDetails: React.FC<TaskDetailsProps> = ({
  title, setTitle, description, setDescription,
  status, setStatus, priority, setPriority,
  projectId, setProjectId, assigneeId, setAssigneeId,
  dueDate, setDueDate, projects, users, isGenerating,
  onAutoPriority, onSuggestSubtasks
}) => {
  const { state } = useApp();
  const { t } = state;
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <div className="flex justify-between items-center mb-1">
           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('taskTitle')}</label>
           <button 
              type="button" 
              onClick={onAutoPriority} 
              disabled={isGenerating || !title}
              className="text-xs flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
           >
             <Sparkles size={12} /> {t('autoPriority')}
           </button>
        </div>
        <input 
          type="text" 
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t('taskPlaceholder')}
          className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('status')}</label>
           <select 
              value={status} 
              onChange={e => setStatus(e.target.value as TaskStatus)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
           >
             {Object.values(TaskStatus).map(s => <option key={s} value={s}>{t(s as any)}</option>)}
           </select>
        </div>
        <div>
           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('priority')}</label>
           <select 
              value={priority} 
              onChange={e => setPriority(e.target.value as Priority)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
           >
             {Object.values(Priority).map(p => <option key={p} value={p}>{t(p as any)}</option>)}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('projects')}</label>
           <select 
              value={projectId} 
              onChange={e => setProjectId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
           >
             {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
           </select>
        </div>
        <div>
           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('assignee')}</label>
           <div className="flex items-center gap-2">
             <select 
                value={assigneeId} 
                onChange={e => setAssigneeId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
             >
               {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
             </select>
           </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('dueDate')}</label>
        <input 
          type="date" 
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
        />
      </div>

      <div>
         <div className="flex justify-between items-center mb-1">
           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('description')}</label>
           <button 
              type="button" 
              onClick={onSuggestSubtasks} 
              disabled={isGenerating || !title}
              className="text-xs flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
           >
             <Sparkles size={12} /> {t('suggestSubtasks')}
           </button>
         </div>
         <textarea 
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            placeholder={t('descPlaceholder')}
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
         />
      </div>
    </div>
  );
};
