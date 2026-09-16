/**
 * File: HeaderTimer.tsx
 * Trách nhiệm: Hiển thị timer đang chạy và nút dừng trên header.
 * Liên quan: useTimeTracking.ts, Header.tsx, TaskModal.
 */

import React, { useState, useEffect } from 'react';
import { StopCircle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

/** Widget timer active trên header — hiện thời lượng và tên task */
export const HeaderTimer: React.FC = () => {
  const { state, actions } = useApp();
  const [timerDuration, setTimerDuration] = useState(0);
  const activeTask = state.activeTimer ? state.rawTasks.find(t => t.id === state.activeTimer?.taskId) : null;

  useEffect(() => {
    let interval: number;
    if (state.activeTimer) {
      const updateTimer = () => {
        const start = new Date(state.activeTimer!.startTime).getTime();
        const now = new Date().getTime();
        setTimerDuration(Math.floor((now - start) / 1000));
      };
      updateTimer(); // Initial call
      interval = window.setInterval(updateTimer, 1000);
    } else {
      setTimerDuration(0);
    }
    return () => clearInterval(interval);
  }, [state.activeTimer]);

  /** Định dạng giây thành HH:MM:SS */
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!state.activeTimer) return null;

  return (
    <div className="hidden 2xl:flex items-center gap-3 bg-primary-50 dark:bg-primary-900/20 pl-4 pr-2 py-1.5 rounded-full border border-primary-200 dark:border-primary-800 animate-in fade-in slide-in-from-top-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-primary-600 dark:text-primary-400 font-bold uppercase tracking-wider">Active Timer</span>
          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white tabular-nums">{formatDuration(timerDuration)}</span>
        </div>
        {activeTask && (
          <span className="text-xs text-slate-600 dark:text-slate-300 max-w-[100px] truncate border-l border-primary-200 dark:border-primary-700 pl-3">
              {activeTask.title}
          </span>
        )}
        <button 
          onClick={actions.handleStopTimer}
          className="p-1.5 bg-white dark:bg-slate-800 rounded-full text-rose-500 hover:text-rose-600 shadow-sm transition-colors"
          title="Stop Timer"
        >
          <StopCircle size={18} fill="currentColor" className="opacity-20" />
        </button>
    </div>
  );
};
