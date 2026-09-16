# Tài khoản demo SabTask

Sản phẩm dùng **Supabase Auth** (email/password).  
Mật khẩu **không** hardcode trong bundle frontend. User được tạo bằng `scripts/seed-auth-users.mjs` (service role local).

`public.users.id` = `auth.users.id` (UUID cố định trong seed).

---

## Tài khoản quản trị (Admin)

| Email | Mật khẩu | Tên | Vai trò | UUID |
|-------|----------|-----|---------|------|
| `admin@sabtask.com` | `admin123` | Nguyễn Văn Admin | ADMIN — Product Owner | `a1111111-1111-4111-8111-111111111111` |

---

## Tài khoản thành viên (Member)

| Email | Mật khẩu | Tên | Chức danh | UUID |
|-------|----------|-----|-----------|------|
| `sarah@sabtask.com` | `user123` | Sarah Miller | UI Designer | `a2222222-2222-4222-8222-222222222222` |
| `mike@sabtask.com` | `user123` | Mike Ross | Backend Developer | `a3333333-3333-4333-8333-333333333333` |
| `emily@sabtask.com` | `user123` | Emily Wong | QA Engineer | `a4444444-4444-4444-8444-444444444444` |
| `lan@sabtask.com` | `user123` | Trần Thị Lan | Frontend Developer | `a5555555-5555-4555-8555-555555555555` |

---

## Setup nhanh

1. Điền `.env` (xem `.env.example`)
2. Chạy **toàn bộ** `src/supabase_schema.sql` trên Supabase SQL Editor  
   (file tự tạo Auth users + seed data)
3. `npm run dev` → đăng nhập bằng email/password ở trên

Chi tiết: [SETUP.md](./SETUP.md).

---

## Dữ liệu demo kèm theo

### Dự án

| ID | Tên | Trạng thái | Tiến độ |
|----|-----|------------|---------|
| p1 | Nova FinTech App | ACTIVE | 75% |
| p2 | AI Content Engine | ACTIVE | 45% |
| p3 | Website Marketing Q4 | COMPLETED | 100% |
| p4 | Mobile Redesign 2026 | ACTIVE | 30% |

Membership nằm ở bảng `project_members` (không còn mảng `projects.members`).

### Khác

- Tasks / subtasks / comments / time_entries / notifications
- Team Hub: channels `general`, `development`, `design` + voice rooms + vài messages mẫu

### Ngôn ngữ giao diện

**Tiếng Việt** và **English**.
