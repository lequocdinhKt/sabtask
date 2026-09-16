/**
 * File: utils/timeAggregation.test.ts
 * Mục đích: Unit test (Vitest) cho các hàm tổng hợp thời gian trong utils/timeAggregation.ts,
 * kiểm tra cách xác định biên khoảng thời gian, cửa sổ 7 ngày gần nhất và định dạng giờ/phút.
 */

import { describe, expect, it } from 'vitest';
import {
  formatDurationHoursMinutes,
  sumDurationInRange,
  sumDurationLast7Days,
} from '../utils/timeAggregation';

/** Nhóm test cho các hàm tổng hợp và định dạng thời gian làm việc. */
describe('timeAggregation', () => {
  /** Kiểm tra chỉ cộng bản ghi trong khoảng [đầu, cuối), bỏ bản ghi trước mốc đầu. */
  it('sums duration within inclusive start / exclusive end', () => {
    const entries = [
      { startTime: '2026-09-01T10:00:00.000Z', durationSeconds: 3600 },
      { startTime: '2026-09-02T10:00:00.000Z', durationSeconds: 1800 },
      { startTime: '2026-08-31T10:00:00.000Z', durationSeconds: 9999 },
    ];
    const start = new Date('2026-09-01T00:00:00.000Z');
    const end = new Date('2026-09-03T00:00:00.000Z');
    expect(sumDurationInRange(entries, start, end)).toBe(5400);
  });

  /** Kiểm tra tổng 7 ngày gần nhất được tính theo mốc "hiện tại" truyền vào. */
  it('sums last 7 days relative to now', () => {
    const now = new Date('2026-09-08T15:00:00.000Z');
    const entries = [
      { startTime: '2026-09-08T01:00:00.000Z', durationSeconds: 100 },
      { startTime: '2026-09-02T01:00:00.000Z', durationSeconds: 200 },
      { startTime: '2026-09-01T01:00:00.000Z', durationSeconds: 400 },
    ];
    expect(sumDurationLast7Days(entries, now)).toBeGreaterThanOrEqual(300);
  });

  /** Kiểm tra định dạng "{giờ}h {phút}m" và trường hợp dưới một phút trả về 0h 0m. */
  it('formats hours and minutes', () => {
    expect(formatDurationHoursMinutes(3661)).toBe('1h 1m');
    expect(formatDurationHoursMinutes(59)).toBe('0h 0m');
  });
});
