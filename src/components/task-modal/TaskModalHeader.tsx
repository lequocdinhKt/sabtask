/**
 * File: TaskModalHeader.tsx
 * Trách nhiệm: Header modal task — tiêu đề, timer start/stop, nút đóng.
 * Liên quan: TaskModal.tsx, useTimeTracking.ts.
 */

import React from 'react';
import { X, Play, StopCircle } from 'lucide-react';
import { TaskModalHeaderProps } from '../../types';
import { useApp } from '../../context/AppContext';

/** Header task modal với điều khiển timer */
export const TaskModalHeader: React.FC<TaskModalHeaderProps> = ({ task, isTimerActive, onClose, onStartTimer, onStopTimer }) => {
  const { state } = useApp();
  const { t } = state;
  return (
    <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          {task ? t('edit') : t('newTask')}
        </h2>
        <div className="flex items-center gap-3">
           <p className="text-sm text-slate-500 dark:text-slate-400">
              {task ? `ID: ${task.id}` : t('newItemPlaceholder')}
           </p>
           {task && (
              isTimerActive ? (
                 <button onClick={onStopTimer} className="text-xs flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold animate-pulse">
                    <StopCircle size={12} /> {t('stopTimer')}
                 </button>
              ) : (
                 <button onClick={onStartTimer} className="text-xs flex items-center gap-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 px-2 py-0.5 rounded-full font-bold">
                    <Play size={12} /> {t('startTimer')}
                 </button>
              )
           )}
        </div>
      </div>
      <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
        <X size={20} />
      </button>
    </div>
  );
};
