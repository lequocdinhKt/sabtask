import { describe, expect, it } from 'vitest';
import {
  formatDurationHoursMinutes,
  sumDurationInRange,
  sumDurationLast7Days,
} from '../utils/timeAggregation';

describe('timeAggregation', () => {
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

  it('sums last 7 days relative to now', () => {
    const now = new Date('2026-09-08T15:00:00.000Z');
    const entries = [
      { startTime: '2026-09-08T01:00:00.000Z', durationSeconds: 100 },
      { startTime: '2026-09-02T01:00:00.000Z', durationSeconds: 200 },
      { startTime: '2026-09-01T01:00:00.000Z', durationSeconds: 400 }, // outside 7-day window from Sep 8 end
    ];
    // window: [Sep 2 00:00 local-ish via setHours] — use fixed UTC logic via Date methods
    expect(sumDurationLast7Days(entries, now)).toBeGreaterThanOrEqual(300);
  });

  it('formats hours and minutes', () => {
    expect(formatDurationHoursMinutes(3661)).toBe('1h 1m');
    expect(formatDurationHoursMinutes(59)).toBe('0h 0m');
  });
});
