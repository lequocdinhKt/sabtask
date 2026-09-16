/**
 * File: SETUP.md
 * Hướng dẫn setup SabTask với Supabase Auth + RLS.
 */

# Hướng dẫn Setup & Chạy SabTask

## Yêu cầu

- **Node.js** 18+ (khuyến nghị LTS)
- **npm**
- Tài khoản [Supabase](https://supabase.com)
- (Tuỳ chọn) API key [Groq Console](https://console.groq.com/keys) cho AI

## 1. Cài đặt dependencies

```bash
npm install
```

## 2. Cấu hình `.env`

Copy `.env.example` → `.env` và điền giá trị:

```env
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
GROQ_API_KEY=your_groq_api_key
# Chỉ dùng cho script seed Auth (không đưa vào frontend):
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

| Biến | Bắt buộc | Mục đích |
|------|----------|----------|
| `SUPABASE_URL` | Có | Project URL |
| `SUPABASE_ANON_KEY` | Có | Client anon key (RLS bảo vệ dữ liệu) |
| `GROQ_API_KEY` | Không* | AI features |
| `SUPABASE_SERVICE_ROLE_KEY` | Seed script | Tạo Auth users cố định — **không** import vào React |

\* Không có Groq key thì app vẫn chạy; AI trả fallback.

Lấy keys: **Project Settings → API**.

## 3. Seed Auth users + schema

Demo dùng UUID cố định (xem `src/constants/demoUsers.ts` / `TAI_KHOAN.md`).

### Cách khuyến nghị (một lần trên SQL Editor)

1. Supabase → **SQL Editor** → New query  
2. Copy **toàn bộ** `src/supabase_schema.sql` → Run  

Script sẽ tự:

- Tạo bảng + RLS + triggers  
- Tạo `auth.users` + `auth.identities` (email/password demo)  
- Seed dữ liệu nghiệp vụ  

> Chạy lại schema **xoá** dữ liệu public rồi seed lại; đồng thời reset 5 tài khoản Auth demo theo UUID cố định.

### Tuỳ chọn: seed Auth bằng Node

Nếu chỉ muốn cập nhật password Auth mà không chạy lại schema:

```bash
npm run seed:auth
```

Cần `SUPABASE_SERVICE_ROLE_KEY` trong `.env`.

### Bật Realtime (khuyến nghị)

Dashboard → **Database → Publications / Realtime**: thêm bảng `notifications`, `messages`, `channels`.

## 4. Chạy ứng dụng

```bash
npm run dev
```

```bash
npm run build
npm run preview
npm run lint
npm run test:run
```

## 5. Đăng nhập

App dùng **Supabase Auth** (`signInWithPassword`). Session được restore sau refresh.

Tài khoản demo: xem [TAI_KHOAN.md](./TAI_KHOAN.md).

## 6. Phân quyền

- **RLS** là lớp bảo mật chính (`auth.uid()`, `is_admin()`, membership qua `project_members`)
- UI ẩn nút ADMIN chỉ là UX
- MEMBER không tự đổi `role` (Profile + RLS)
- Thêm member mới: tạo user trên Auth Dashboard (hoặc seed script), rồi Admin chỉnh profile trong app

## 7. Checklist lỗi thường gặp

| Hiện tượng | Cách xử lý |
|------------|------------|
| Seed SQL lỗi `must be owner of table users` | Đã bỏ `ALTER ... DISABLE TRIGGER` trên `auth.users`. Chạy lại file SQL mới nhất. |
| CRUD 403 / `permission denied for schema public` | Chạy [`src/fix_grants.sql`](./src/fix_grants.sql) (hoặc chạy lại schema đã có GRANT). |
| Login fail | Chạy lại `supabase_schema.sql` (tạo lại Auth); hoặc `npm run seed:auth` |
| Seed SQL lỗi FK `users_id_fkey` | Bản schema cũ thiếu seed `auth.users` — dùng file SQL mới (đã tự tạo Auth) |
| Không thấy data sau login | User chưa nằm trong `project_members`; Admin thấy hết project |
| Chat trống | Schema đã có `channels`/`messages`? Realtime đã bật? |
| AI lỗi | Thiếu `GROQ_API_KEY` — restart `npm run dev` sau khi sửa `.env` |

## 8. Hướng phát triển (chưa implement trong repo)

- Dockerfile multi-stage (`node` build → `nginx` static)
- GitHub Actions: `lint` + `test:run` + `build` trên PR
- Edge Function invite-member (service role)
- WebRTC voice; Supabase Storage cho attachment lớn
