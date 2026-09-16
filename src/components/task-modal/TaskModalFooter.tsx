/**
 * File: TaskModalFooter.tsx
 * Trách nhiệm: Footer modal task — xóa, hủy, lưu.
 * Liên quan: TaskModal.tsx, useTaskForm.ts.
 */

import React from 'react';
import { Trash2 } from 'lucide-react';
import { TaskModalFooterProps } from '../../types';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';

/** Footer modal với nút delete, cancel và save */
export const TaskModalFooter: React.FC<TaskModalFooterProps> = ({ task, onDelete, onClose, onSave }) => {
  const { state } = useApp();
  const { t } = state;
  return (
    <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-2xl">
       <div>
           {task && onDelete && (
               <Button variant="danger" onClick={onDelete} icon={<Trash2 size={16} />}>
                   {t('delete')}
               </Button>
           )}
       </div>
       <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 rounded-xl transition-all">
                {t('cancel')}
            </button>
            <button onClick={onSave} className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-lg shadow-primary-500/20 transition-all">
                {task ? t('saveChanges') : t('createTask')}
            </button>
       </div>
    </div>
  );
};
