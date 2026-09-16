/**
 * File: utils/timeAggregation.ts
 * Mục đích: Các hàm thuần tính tổng thời gian làm việc từ danh sách bản ghi chấm công
 * (theo khoảng thời gian tuỳ ý hoặc 7 ngày gần nhất) và định dạng số giây thành chuỗi giờ/phút,
 * phục vụ màn hình Time Tracking và thống kê ở Dashboard.
 */

/** Hình dạng tối thiểu của một bản ghi thời gian mà các hàm trong file cần đến. */
export interface DurationLike {
  startTime: string;
  durationSeconds: number;
}

/**
 * Cộng tổng thời lượng của các bản ghi có thời điểm bắt đầu nằm trong khoảng cần xét;
 * bản ghi có startTime không hợp lệ sẽ bị bỏ qua.
 * @param entries Danh sách bản ghi thời gian.
 * @param rangeStart Mốc đầu khoảng, tính bao gồm.
 * @param rangeEnd Mốc cuối khoảng, tính loại trừ.
 * @returns Tổng số giây làm việc trong khoảng.
 */
export const sumDurationInRange = (
  entries: DurationLike[],
  rangeStart: Date,
  rangeEnd: Date
): number => {
  const startMs = rangeStart.getTime();
  const endMs = rangeEnd.getTime();
  return entries.reduce((acc, entry) => {
    const t = new Date(entry.startTime).getTime();
    if (Number.isNaN(t) || t < startMs || t >= endMs) return acc;
    return acc + (entry.durationSeconds || 0);
  }, 0);
};

/**
 * Tính tổng thời gian làm việc trong 7 ngày gần nhất, lấy mốc cuối là đầu ngày hôm sau
 * để bao trọn cả ngày hiện tại.
 * @param entries Danh sách bản ghi thời gian.
 * @param now Thời điểm tham chiếu, mặc định là hiện tại (cho phép truyền vào để test).
 * @returns Tổng số giây làm việc trong cửa sổ 7 ngày.
 */
export const sumDurationLast7Days = (
  entries: DurationLike[],
  now: Date = new Date()
): number => {
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  return sumDurationInRange(entries, start, end);
};

/**
 * Chuyển số giây thành chuỗi hiển thị dạng "{giờ}h {phút}m", cắt bỏ phần giây lẻ.
 * @param seconds Tổng số giây cần định dạng.
 * @returns Chuỗi thời lượng để hiển thị trên giao diện.
 */
export const formatDurationHoursMinutes = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};
