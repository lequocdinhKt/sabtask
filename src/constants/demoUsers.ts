/**
 * File: constants/demoUsers.ts
 * Mục đích: Khai báo danh sách tài khoản demo của SabTask gồm UUID cố định và thông tin hồ sơ
 * (tên, avatar, vai trò, email). Các UUID này khớp với dữ liệu seed trong Supabase nên được
 * dùng lại ở seed script và dữ liệu mock; file không chứa mật khẩu hay khoá bí mật.
 */

import { User } from '../types';

/** UUID cố định của từng tài khoản demo, dùng để liên kết dữ liệu mock với bản ghi trong Supabase. */
export const DEMO_USER_IDS = {
  admin: 'a1111111-1111-4111-8111-111111111111',
  sarah: 'a2222222-2222-4222-8222-222222222222',
  mike: 'a3333333-3333-4333-8333-333333333333',
  emily: 'a4444444-4444-4444-8444-444444444444',
  lan: 'a5555555-5555-4555-8555-555555555555',
} as const;

/** Người dùng khách mặc định, dùng làm giá trị tạm khi phiên đăng nhập hoặc hồ sơ chưa tải xong. */
export const GUEST_USER: User = {
  id: '',
  name: 'Guest',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
  role: 'MEMBER',
};

/** Hồ sơ đầy đủ của các tài khoản demo, dùng để hiển thị danh sách thành viên và dữ liệu mẫu. */
export const DEMO_USER_PROFILES: User[] = [
  {
    id: DEMO_USER_IDS.admin,
    name: 'Nguyễn Văn Admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    role: 'ADMIN',
    jobRole: 'Product Owner',
    email: 'admin@sabtask.com',
  },
  {
    id: DEMO_USER_IDS.sarah,
    name: 'Sarah Miller',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    role: 'MEMBER',
    jobRole: 'UI Designer',
    email: 'sarah@sabtask.com',
  },
  {
    id: DEMO_USER_IDS.mike,
    name: 'Mike Ross',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    role: 'MEMBER',
    jobRole: 'Backend Developer',
    email: 'mike@sabtask.com',
  },
  {
    id: DEMO_USER_IDS.emily,
    name: 'Emily Wong',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    role: 'MEMBER',
    jobRole: 'QA Engineer',
    email: 'emily@sabtask.com',
  },
  {
    id: DEMO_USER_IDS.lan,
    name: 'Trần Thị Lan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lan',
    role: 'MEMBER',
    jobRole: 'Frontend Developer',
    email: 'lan@sabtask.com',
  },
];
