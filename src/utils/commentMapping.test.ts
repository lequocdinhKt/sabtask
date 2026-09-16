import { describe, expect, it } from 'vitest';

/** Mirror of comment mapping in useDataFetching */
const mapComment = (c: { id: string; user_id: string; text: string; created_at: string }) => ({
  id: c.id,
  userId: c.user_id,
  text: c.text,
  createdAt: c.created_at,
});

describe('comment mapping', () => {
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
