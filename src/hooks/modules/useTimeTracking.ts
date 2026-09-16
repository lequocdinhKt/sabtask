/**
 * File: hooks/modules/useTimeTracking.ts
 * Mục đích: Hook quản lý đồng hồ bấm giờ làm việc trên task. Hook giữ timer đang chạy,
 * khôi phục/ghi nhớ timer qua localStorage để không mất khi tải lại trang, và khi dừng thì
 * ghi một bản ghi vào bảng time_entries trên Supabase rồi cập nhật lại state phía client.
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { ActiveTimer, TimeEntry, User } from '../../types';

/**
 * Hook cung cấp timer chấm công cho ứng dụng.
 * @param user Người dùng hiện tại, dùng để gắn bản ghi thời gian vào đúng chủ sở hữu.
 * @param setTimeEntries Setter danh sách bản ghi thời gian, để thêm entry mới ngay sau khi lưu.
 * @param addToast Hàm hiển thị thông báo kết quả cho người dùng.
 * @returns Timer đang chạy cùng hai hàm bắt đầu và dừng đếm thời gian.
 */
export const useTimeTracking = (
  user: User, 
  setTimeEntries: React.Dispatch<React.SetStateAction<TimeEntry[]>>,
  addToast: (t: 'success'|'error', m: string) => void
) => {
  
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(() => {
    try {
      const stored = localStorage.getItem('SabTask-timer');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  /** Mỗi khi timer thay đổi: lưu timer đang chạy vào localStorage, hoặc xoá key khi không còn timer. */
  useEffect(() => {
    if (activeTimer) {
      localStorage.setItem('SabTask-timer', JSON.stringify(activeTimer));
    } else {
      localStorage.removeItem('SabTask-timer');
    }
  }, [activeTimer]);

  /**
   * Bắt đầu đếm thời gian cho một task; chỉ cho phép một timer chạy tại một thời điểm
   * nên sẽ báo lỗi nếu đang có timer khác.
   * @param taskId Id task cần chấm công.
   */
  const handleStartTimer = (taskId: string) => {
    if (activeTimer) {
      addToast('error', "A timer is already running. Please stop it first.");
      return;
    }
    const timer: ActiveTimer = {
      taskId,
      startTime: new Date().toISOString()
    };
    setActiveTimer(timer);
    addToast('success', 'Timer started');
  };

  /**
   * Dừng timer đang chạy: tính thời lượng, lưu bản ghi vào bảng time_entries trên Supabase,
   * thêm bản ghi đã map sang state và xoá timer. Nếu lưu thất bại thì giữ nguyên timer và báo lỗi.
   */
  const handleStopTimer = async () => {
    if (!activeTimer) return;
    
    const endTime = new Date();
    const startTime = new Date(activeTimer.startTime);
    const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

    const newEntry = {
      id: Math.random().toString(36).substr(2, 9),
      task_id: activeTimer.taskId,
      user_id: user.id,
      start_time: activeTimer.startTime,
      end_time: endTime.toISOString(),
      duration_seconds: durationSeconds,
      note: 'Logged via timer'
    };

    try {
      const { error } = await supabase.from('time_entries').insert(newEntry);
      if (error) throw error;

      const mappedEntry: TimeEntry = {
          id: newEntry.id,
          taskId: newEntry.task_id,
          userId: newEntry.user_id,
          startTime: newEntry.start_time,
          endTime: newEntry.end_time,
          durationSeconds: newEntry.duration_seconds,
          note: newEntry.note,
          createdAt: new Date().toISOString()
      };
      
      setTimeEntries(prev => [mappedEntry, ...prev]);
      setActiveTimer(null);
      addToast('success', 'Time logged successfully');
    } catch (e) {
      console.error("Failed to save time entry", e);
      addToast('error', 'Failed to save time entry');
    }
  };

  return { activeTimer, handleStartTimer, handleStopTimer };
};
