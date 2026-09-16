/**
 * File: components/layout/header/HeaderTimer.tsx
 * Mục đích: Widget theo dõi thời gian trên header. Khi có timer đang chạy, widget hiển thị
 * thời lượng đếm lên theo từng giây cùng tên task tương ứng và cho phép dừng timer ngay
 * tại header; nếu không có timer nào thì widget không render gì.
 */

import React, { useState, useEffect } from 'react';
import { StopCircle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

/** Component hiển thị timer đang chạy kèm nút dừng, lấy dữ liệu timer từ context. */
export const HeaderTimer: React.FC = () => {
  const { state, actions } = useApp();
  const [timerDuration, setTimerDuration] = useState(0);
  const activeTask = state.activeTimer ? state.rawTasks.find(t => t.id === state.activeTimer?.taskId) : null;

  /**
   * Chạy lại mỗi khi timer đang hoạt động thay đổi: nếu có timer thì tính thời lượng ngay
   * rồi tạo setInterval cập nhật mỗi giây, nếu không thì đưa thời lượng về 0.
   * Cleanup xoá interval để tránh đếm tiếp sau khi dừng timer hoặc unmount.
   */
  useEffect(() => {
    let interval: number;
    if (state.activeTimer) {
      /** Tính lại số giây đã trôi qua kể từ thời điểm bắt đầu của timer. */
      const updateTimer = () => {
        const start = new Date(state.activeTimer!.startTime).getTime();
        const now = new Date().getTime();
        setTimerDuration(Math.floor((now - start) / 1000));
      };
      updateTimer();
      interval = window.setInterval(updateTimer, 1000);
    } else {
      setTimerDuration(0);
    }
    return () => clearInterval(interval);
  }, [state.activeTimer]);

  /**
   * Chuyển tổng số giây sang chuỗi thời lượng dễ đọc để hiển thị trên widget.
   * @param seconds Tổng số giây đã trôi qua của timer.
   * @returns Chuỗi thời lượng dạng HH:MM:SS, mỗi thành phần luôn đủ hai chữ số.
   */
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
