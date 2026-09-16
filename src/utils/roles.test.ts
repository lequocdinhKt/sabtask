/**
 * File: utils/roles.test.ts
 * Mục đích: Unit test (Vitest) cho các hàm phân quyền trong utils/roles.ts,
 * kiểm tra việc nhận diện ADMIN, quyền quản lý thành viên và cơ chế chặn MEMBER tự nâng quyền.
 */

import { describe, expect, it } from 'vitest';
import {
  canManageMembers,
  isAdmin,
  resolveRoleForProfileUpdate,
} from '../utils/roles';
import { User } from '../types';

const admin: User = {
  id: 'a1',
  name: 'Admin',
  avatar: '',
  role: 'ADMIN',
};

const member: User = {
  id: 'm1',
  name: 'Member',
  avatar: '',
  role: 'MEMBER',
};

/** Nhóm test cho các guard phân quyền theo vai trò. */
describe('roles', () => {
  /** Kiểm tra isAdmin và canManageMembers phân biệt đúng giữa ADMIN và MEMBER. */
  it('detects admin', () => {
    expect(isAdmin(admin)).toBe(true);
    expect(isAdmin(member)).toBe(false);
    expect(canManageMembers(member)).toBe(false);
    expect(canManageMembers(admin)).toBe(true);
  });

  /** Kiểm tra MEMBER tự sửa hồ sơ thành ADMIN thì vai trò vẫn bị giữ ở MEMBER. */
  it('prevents member from escalating role on profile update', () => {
    const attempted = { ...member, role: 'ADMIN' as const };
    expect(resolveRoleForProfileUpdate(member, attempted)).toBe('MEMBER');
  });

  /** Kiểm tra ADMIN được phép nâng vai trò của thành viên khác lên ADMIN. */
  it('allows admin to set roles', () => {
    const updated = { ...member, role: 'ADMIN' as const };
    expect(resolveRoleForProfileUpdate(admin, updated)).toBe('ADMIN');
  });
});
