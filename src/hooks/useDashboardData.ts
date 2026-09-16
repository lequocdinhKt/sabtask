/**
 * File: hooks/useDashboardData.ts
 * Mục đích: Hook tính toán dữ liệu hiển thị cho Dashboard từ danh sách task đang có trong state:
 * phân bố task theo trạng thái cho biểu đồ donut, chuỗi số liệu task tạo mới và task đến hạn theo
 * từng ngày cho biểu đồ xu hướng, chỉ số năng suất của tuần hiện tại và tổng số task đã hoàn thành.
 * Hook chỉ tính toán trên dữ liệu sẵn có, không gọi Supabase.
 */

import { useMemo, useState } from 'react';
import { Task, TaskStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { format } from 'date-fns';

/**
 * Trả về mốc thời gian lùi lại một số ngày so với mốc cho trước, không làm thay đổi Date gốc.
 * @param date Mốc thời gian ban đầu.
 * @param amount Số ngày cần trừ.
 * @returns Date mới đã lùi lại `amount` ngày.
 */
const subDays = (date: Date, amount: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() - amount);
    return d;
};

/**
 * Trả về thời điểm 00:00:00 của thứ Hai trong tuần chứa mốc thời gian cho trước
 * (Chủ nhật được tính là ngày cuối tuần, không phải ngày đầu tuần).
 * @param date Mốc thời gian bất kỳ trong tuần cần lấy.
 * @returns Date là đầu ngày thứ Hai của tuần đó.
 */
const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

/**
 * Trả về thời điểm cuối ngày Chủ nhật của tuần chứa mốc thời gian cho trước, dùng làm biên phải
 * khi lọc task theo tuần.
 * @param date Mốc thời gian bất kỳ trong tuần cần lấy.
 * @returns Date là 23:59:59.999 của ngày Chủ nhật trong tuần đó.
 */
const endOfWeek = (date: Date) => {
    const d = startOfWeek(date);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
};

/** Chuyển chuỗi ngày lấy từ database thành đối tượng Date để so sánh. */
const parseISO = (str: string) => new Date(str);

/**
 * Kiểm tra một mốc thời gian có nằm trong khoảng cho trước hay không, tính cả hai đầu mút.
 * @param date Mốc thời gian cần kiểm tra.
 * @param interval Khoảng thời gian gồm `start` và `end`.
 * @returns true nếu `date` nằm trong khoảng (bao gồm biên).
 */
const isWithinInterval = (date: Date, interval: { start: Date, end: Date }) => {
    return date.getTime() >= interval.start.getTime() && date.getTime() <= interval.end.getTime();
};

/**
 * Hook tổng hợp dữ liệu thống kê cho Dashboard.
 * @param tasks Danh sách task dùng làm nguồn tính toán (thường là task đã qua bộ lọc).
 * @returns Khoảng thời gian đang chọn kèm setter, dữ liệu donut trạng thái, dữ liệu biểu đồ xu
 * hướng, chỉ số năng suất tuần và số task đã hoàn thành.
 */
export const useDashboardData = (tasks: Task[]) => {
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly'>('weekly');
  
  /**
   * Đếm số task theo từng trạng thái và dựng mảng dữ liệu cho biểu đồ donut, mỗi phần tử gồm tên
   * hiển thị, số lượng và màu lấy từ STATUS_COLORS. Tính lại khi danh sách task thay đổi.
   */
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

  /**
   * Dựng chuỗi dữ liệu cho biểu đồ xu hướng theo từng ngày trong 7 ngày (chế độ tuần) hoặc 30 ngày
   * (chế độ tháng) gần nhất, mỗi ngày gồm số task được tạo và số task đến hạn trong ngày đó.
   * Nhãn ngày hiển thị dạng thứ khi xem theo tuần và dạng ngày-tháng khi xem theo tháng.
   * Tính lại khi danh sách task hoặc khoảng thời gian đang chọn thay đổi.
   */
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

  /**
   * Tính chỉ số năng suất của tuần hiện tại: lọc các task có hạn nằm trong tuần này, đếm số task đã
   * hoàn thành trên tổng số, quy ra phần trăm và chọn nhãn động cứng khích tương ứng.
   * Tính lại khi danh sách task thay đổi (không phụ thuộc khoảng thời gian đang chọn).
   */
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

  /** Tổng số task đã hoàn thành trên toàn bộ danh sách, dùng cho thẻ thống kê nhanh. */
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
