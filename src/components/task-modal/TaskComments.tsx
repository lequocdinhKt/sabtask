/**
 * File: TaskComments.tsx
 * Trách nhiệm: Danh sách comment và form thêm comment mới.
 * Liên quan: useTaskForm.ts, TaskModal.tsx.
 */

import React from 'react';
import { TaskCommentsProps } from '../../types';
import { Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';

/** Tab hiển thị và thêm comment task */
export const TaskComments: React.FC<TaskCommentsProps> = ({
  comments, users, newComment, setNewComment, onAdd
}) => {
  const { state } = useApp();
  const { t } = state;

  return (
    <div className="flex flex-col h-[400px] animate-in fade-in duration-300">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
        {comments.length === 0 ? (
          <p className="text-center text-slate-400 dark:text-slate-500 text-sm mt-10">{t('noComments')}</p>
        ) : (
          comments.map(comment => {
            const author = users.find(u => u.id === comment.userId);
            return (
              <div key={comment.id} className="flex gap-3">
                 <img src={author?.avatar} alt={author?.name} className="w-8 h-8 rounded-full bg-slate-200" />
                 <div className="flex-1 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{author?.name}</span>
                      <span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{comment.text}</p>
                 </div>
              </div>
            );
          })
        )}
      </div>
      <form onSubmit={onAdd} className="relative">
        <input 
          type="text" 
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder={t('typeComment')}
          className="w-full pr-12 pl-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button type="submit" disabled={!newComment.trim()} className="absolute right-2 top-2 p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
