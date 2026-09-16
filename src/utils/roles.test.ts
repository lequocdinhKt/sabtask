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

describe('roles', () => {
  it('detects admin', () => {
    expect(isAdmin(admin)).toBe(true);
    expect(isAdmin(member)).toBe(false);
    expect(canManageMembers(member)).toBe(false);
    expect(canManageMembers(admin)).toBe(true);
  });

  it('prevents member from escalating role on profile update', () => {
    const attempted = { ...member, role: 'ADMIN' as const };
    expect(resolveRoleForProfileUpdate(member, attempted)).toBe('MEMBER');
  });

  it('allows admin to set roles', () => {
    const updated = { ...member, role: 'ADMIN' as const };
    expect(resolveRoleForProfileUpdate(admin, updated)).toBe('ADMIN');
  });
});
