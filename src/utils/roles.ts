/**
 * File: roles.ts
 * Trách nhiệm: Guard phân quyền ADMIN/MEMBER (UX + client-side checks).
 * RLS vẫn là lớp bảo mật chính.
 */

import { User } from '../types';

export const isAdmin = (user: Pick<User, 'role'> | null | undefined): boolean =>
  user?.role === 'ADMIN';

export const canManageMembers = (user: Pick<User, 'role'> | null | undefined): boolean =>
  isAdmin(user);

export const canChangeUserRole = (
  actor: Pick<User, 'id' | 'role'> | null | undefined,
  _targetId: string
): boolean => {
  if (!actor || !isAdmin(actor)) return false;
  return true;
};

/** MEMBER không được tự đổi role; ADMIN được đổi role người khác (và chính mình). */
export const resolveRoleForProfileUpdate = (
  actor: User,
  updated: User
): User['role'] => {
  if (!isAdmin(actor)) return actor.role;
  if (updated.id === actor.id) return updated.role;
  return updated.role;
};
