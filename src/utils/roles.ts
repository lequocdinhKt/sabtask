/**
 * File: utils/roles.ts
 * Mục đích: Tập hợp các hàm kiểm tra quyền theo vai trò ADMIN/MEMBER ở phía client,
 * dùng để bật/tắt hành động trên giao diện và chặn thao tác vượt quyền trước khi gọi Supabase.
 * Đây chỉ là lớp kiểm tra bổ trợ cho trải nghiệm người dùng; RLS trên database vẫn là lớp bảo mật chính.
 */

import { User } from '../types';

/** Kiểm tra một người dùng có vai trò ADMIN hay không; trả về false khi không có người dùng. */
export const isAdmin = (user: Pick<User, 'role'> | null | undefined): boolean =>
  user?.role === 'ADMIN';

/** Xác định người dùng có được thêm/sửa/xoá thành viên hay không (hiện chỉ ADMIN được phép). */
export const canManageMembers = (user: Pick<User, 'role'> | null | undefined): boolean =>
  isAdmin(user);

/**
 * Xác định người thực hiện có quyền đổi vai trò của một người dùng khác hay không.
 * @param actor Người đang thực hiện hành động.
 * @param _targetId Id người bị đổi vai trò (hiện chưa dùng để phân biệt, mọi ADMIN đều được phép).
 * @returns true nếu actor là ADMIN, ngược lại false.
 */
export const canChangeUserRole = (
  actor: Pick<User, 'id' | 'role'> | null | undefined,
  _targetId: string
): boolean => {
  if (!actor || !isAdmin(actor)) return false;
  return true;
};

/**
 * Quyết định vai trò được ghi xuống database khi cập nhật hồ sơ, nhằm chặn việc tự nâng quyền.
 * @param actor Người đang thực hiện cập nhật.
 * @param updated Dữ liệu hồ sơ mới do form gửi lên.
 * @returns Vai trò mới nếu actor là ADMIN; nếu không thì giữ nguyên vai trò hiện tại của actor.
 */
export const resolveRoleForProfileUpdate = (
  actor: User,
  updated: User
): User['role'] => {
  if (!isAdmin(actor)) return actor.role;
  if (updated.id === actor.id) return updated.role;
  return updated.role;
};
