/**
 * File: useTimeTracking.ts
 * Trách nhiệm: Quản lý timer theo dõi thời gian làm việc trên task.
 * Liên quan: supabaseClient.ts, HeaderTimer.tsx, useAppLogic.ts.
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { ActiveTimer, TimeEntry, User } from '../../types';

/** Hook timer: lưu localStorage, start/stop và ghi time entry lên Supabase */
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

  useEffect(() => {
    if (activeTimer) {
      localStorage.setItem('SabTask-timer', JSON.stringify(activeTimer));
    } else {
      localStorage.removeItem('SabTask-timer');
    }
  }, [activeTimer]);

  /** Bắt đầu đếm thời gian cho task (chỉ một timer cùng lúc) */
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

  /** Dừng timer, lưu time entry vào DB và cập nhật state */
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
