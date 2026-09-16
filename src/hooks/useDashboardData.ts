/**
 * File: useDashboardData.ts
 * Trách nhiệm: Tính toán dữ liệu biểu đồ và thống kê cho Dashboard.
 * Liên quan: Dashboard.tsx, constants.ts (STATUS_COLORS).
 */

import { useMemo, useState } from 'react';
import { Task, TaskStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { format } from 'date-fns';

// Helper functions (kept local to hook)
/** Trừ số ngày khỏi một Date */
const subDays = (date: Date, amount: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() - amount);
    return d;
};

/** Lấy thứ Hai đầu tuần của một Date */
const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

const endOfWeek = (date: Date) => {
    const d = startOfWeek(date);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
};

const parseISO = (str: string) => new Date(str);

const isWithinInterval = (date: Date, interval: { start: Date, end: Date }) => {
    return date.getTime() >= interval.start.getTime() && date.getTime() <= interval.end.getTime();
};

/** Hook tổng hợp statusData, chartData, productivityStats từ danh sách task */
export const useDashboardData = (tasks: Task[]) => {
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly'>('weekly');
  
  // 1. Status Counts & Donut Data
  const statusData = useMemo(() => {
    const counts = {
      [TaskStatus.TODO]: tasks.filter(t => t.status === TaskStatus.TODO).length,
      [TaskStatus.IN_PROGRESS]: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      [TaskStatus.REVIEW]: tasks.filter(t => t.status === TaskStatus.REVIEW).length,
      [TaskStatus.DONE]: tasks.filter(t => t.status === TaskStatus.DONE).length,
    };
    
    return [
      { name: 'To Do', value: counts[TaskStatus.TODO], color: STATUS_COLORS[TaskStatus.TODO] },
      { name: 'In Progress', value: counts[TaskStatus.IN_PROGRESS], color: STATUS_COLORS[TaskStatus.IN_PROGRESS] },
      { name: 'Review', value: counts[TaskStatus.REVIEW], color: STATUS_COLORS[TaskStatus.REVIEW] },
      { name: 'Done', value: counts[TaskStatus.DONE], color: STATUS_COLORS[TaskStatus.DONE] },
    ];
  }, [tasks]);

  // 2. Chart Data (Trend)
  const chartData = useMemo(() => {
    const data = [];
    const days = timeRange === 'weekly' ? 7 : 30;
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const created = tasks.filter(t => {
        if (!t.createdAt) return false;
        try {
            return t.createdAt.startsWith(dateStr);
        } catch { return false; }
      }).length;

      const due = tasks.filter(t => {
        if (!t.dueDate) return false;
        try {
            return t.dueDate.startsWith(dateStr);
        } catch { return false; }
      }).length;

      data.push({
        day: format(date, timeRange === 'weekly' ? 'EEE' : 'dd MMM'),
        created,
        due
      });
    }
    return data;
  }, [tasks, timeRange]);

  // 3. Productivity Stats
  const productivityStats = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now);
    const end = endOfWeek(now);
    
    const dueThisWeek = tasks.filter(t => {
      try {
        if (!t.dueDate) return false;
        const d = parseISO(t.dueDate);
        return isWithinInterval(d, { start, end });
      } catch (e) { return false; }
    });

    const completed = dueThisWeek.filter(t => t.status === TaskStatus.DONE).length;
    const total = dueThisWeek.length;
    
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    let label = "Keep going";
    if (percentage === 100 && total > 0) label = "Excellent 🚀";
    else if (percentage >= 75) label = "Great Job 🔥";
    else if (percentage >= 50) label = "On Track 👍";
    else if (percentage > 0) label = "Good Start";

    return { percentage, completed, total, label };
  }, [tasks]);

  // 4. Counts
  const completedCount = tasks.filter(t => t.status === TaskStatus.DONE).length;

  return {
    timeRange,
    setTimeRange,
    statusData,
    chartData,
    productivityStats,
    completedCount
  };
};
