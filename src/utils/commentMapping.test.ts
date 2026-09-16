/**
 * File: utils/commentMapping.test.ts
 * Mục đích: Unit test (Vitest) cho quy tắc chuyển đổi bản ghi comment từ dạng snake_case của Supabase
 * sang dạng camelCase dùng trong ứng dụng. Hàm mapComment ở đây là bản sao logic trong useDataFetching
 * để kiểm thử độc lập, không import trực tiếp từ hook.
 */

import { describe, expect, it } from 'vitest';

/** Bản sao của logic map comment trong useDataFetching, dùng làm đối tượng kiểm thử. */
const mapComment = (c: { id: string; user_id: string; text: string; created_at: string }) => ({
  id: c.id,
  userId: c.user_id,
  text: c.text,
  createdAt: c.created_at,
});

/** Nhóm test cho việc map dữ liệu comment giữa database và ứng dụng. */
describe('comment mapping', () => {
  /** Kiểm tra created_at được đổi thành createdAt và khoá snake_case không còn trong kết quả. */
  it('maps created_at to createdAt', () => {
    const mapped = mapComment({
      id: 'c1',
      user_id: 'u1',
      text: 'hello',
      created_at: '2026-09-08T10:00:00.000Z',
    });
    expect(mapped.createdAt).toBe('2026-09-08T10:00:00.000Z');
    expect('created_at' in mapped).toBe(false);
  });
});
