/**
 * File: timeAggregation.ts
 * Trách nhiệm: Aggregate thời gian làm việc theo ngày / tuần từ TimeEntry.
 * Liên quan: TimeTrackingView.tsx, unit tests.
 */

export interface DurationLike {
  startTime: string;
  durationSeconds: number;
}

/** Tổng giây của các entry có startTime trong khoảng [start, end) */
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

/** Tổng giây trong 7 ngày gần nhất (tính từ đầu ngày hôm nay - 6 ngày) */
export const sumDurationLast7Days = (
  entries: DurationLike[],
  now: Date = new Date()
): number => {
  const end = new Date(now);
  end.setHours(24, 0, 0, 0); // exclusive end: start of tomorrow
  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  return sumDurationInRange(entries, start, end);
};

export const formatDurationHoursMinutes = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};
