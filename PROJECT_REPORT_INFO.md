# PROJECT_REPORT_INFO.md

Tài liệu này được sinh từ phân tích source code thực tế của workspace `sabtask`. Chỉ mô tả những gì có bằng chứng trong code/README/SETUP; không suy đoán công ty thực tập hay tính năng chưa có trong repo.

> **Cập nhật roadmap (Auth/RLS/Team Hub):** Đăng nhập dùng **Supabase Auth**; `public.users.id` = `auth.users.id`; membership qua `project_members`; RLS theo `auth.uid()` / `is_admin()`; Team Hub persist `channels`/`messages` + Realtime; notification emit qua Postgres trigger + Realtime; Vitest unit tests; `.env.example`. Voice Team Hub vẫn mock. Docker/CI chưa có trong repo (xem hướng phát triển).

---

# 1. THÔNG TIN TỔNG QUAN DỰ ÁN

## 1.1. Tên project

- **Tên trong `package.json`:** `sabtask`
- **Tên thương hiệu trong UI/README:** SabTask
- **Mô tả README:** AI Powered Work Management Platform

**Bằng chứng:** `package.json`, `README.md`, `index.html` (title: `sabtask`), `src/components/layout/Sidebar.tsx`, `src/components/auth/LoginScreen.tsx`.

## 1.2. Mục đích của project

SabTask là ứng dụng web quản lý công việc nhóm (work management): theo dõi dự án, task theo nhiều góc nhìn (Dashboard, Kanban, List, Calendar), quản lý thành viên, theo dõi thời gian, thông báo, và hỗ trợ AI (sinh subtask / gợi ý priority; chat bot trong Team Hub).

Dữ liệu nghiệp vụ chính được lưu trên Supabase (PostgreSQL). Không có server backend riêng trong repo; client React gọi trực tiếp Supabase JS SDK và Groq API.

**Bằng chứng:** `README.md`, `CODE_OVERVIEW.md`, `SETUP.md`, `src/services/supabaseClient.ts`, `src/services/groqService.ts`.

## 1.3. Đối tượng sử dụng

Từ model/role và UI:

| Đối tượng | Mô tả trong code |
|-----------|------------------|
| **ADMIN** | Quản trị viên; RLS + UI cho phép quản lý member, tạo/xóa channel, xem mọi project |
| **MEMBER** | Thành viên; CRUD trong project mình tham gia (`project_members`); không tự đổi role |

Tài khoản demo: 1 admin + 4 member (Supabase Auth + seed; `TAI_KHOAN.md`, `scripts/seed-auth-users.mjs`).

**Bằng chứng:** `src/types/models.ts`, `src/constants/demoUsers.ts`, `src/utils/roles.ts`, `src/supabase_schema.sql`, `TAI_KHOAN.md`.

## 1.4. Phạm vi hiện tại của project

**Có trong phạm vi hiện tại:**

- SPA React + Vite (frontend)
- Đăng nhập **Supabase Auth** (email/password); session restore sau refresh
- CRUD project, task (kèm subtask/comment), member, profile qua Supabase
- Membership project qua bảng `project_members`
- Views: Dashboard, Projects (+ detail), Kanban, Task List, Calendar, Team (+ member detail), Time Tracking, Team Hub
- Timer ghi `time_entries` + tổng hợp tuần (7 ngày)
- Thông báo: DB + Postgres triggers + Realtime; mark read
- Team Hub: channels/messages persist + Realtime; Groq bot ghi DB; voice UI mock
- AI Groq: generate subtasks, suggest priority, bot `@ai`/`@groq`
- Dark/light mode, i18n EN/VI
- Toast, ErrorBoundary, Skeleton loading
- Vitest unit tests (`npm run test:run`); `.env.example`
- RLS authenticated (`is_admin`, `is_project_member`)

**Ngoài phạm vi / không có trong repo:**

- Backend riêng (Express/Nest/Spring…): không có
- React Router / URL routing: không có (điều hướng bằng `activeTab`)
- Docker / CI / deploy config: không có trong repo (hướng phát triển)
- Supabase Storage bucket: không dùng (attachment chat lưu Data URL)
- WebRTC voice/video thật: không có
- Edge Function invite-member: chưa có (member mới cần Auth trước)

## 1.5. Trạng thái hiện tại

**Trạng thái phù hợp nhất: MVP đã siết Auth/RLS (demo-ready cho thực tập).**

Lý do từ code:

- Core quản lý công việc + Supabase CRUD + Auth/RLS đã nối
- Team Hub text chat persist; voice vẫn mock
- `package.json` version `0.0.0`, `private: true`
- Docker/CI và Storage/WebRTC còn là hướng phát triển

---

# 2. BÀI TOÁN MÀ HỆ THỐNG GIẢI QUYẾT

## 2.1. Vấn đề thực tế

Nhóm làm việc cần:

- Tổ chức công việc theo dự án và trạng thái
- Theo dõi tiến độ, hạn, người được giao
- Cộng tác (comment, thông báo Realtime, chat nhóm persist)
- Đo thời gian làm việc trên task (today + tuần)
- Hỗ trợ phân rã công việc / gợi ý độ ưu tiên bằng AI

## 2.2. Giải pháp của hệ thống

Một ứng dụng web single-page:

- Lưu entities trên Supabase PostgreSQL với RLS
- UI nhiều view (board/list/calendar/dashboard)
- Facade `useAppLogic` gom state/actions + Supabase Auth session
- Gọi Groq cho AI features
- Team Hub messages/channels + notifications qua Realtime

## 2.3. Đầu vào của hệ thống

- Email/password đăng nhập Supabase Auth
- Form tạo/sửa: project, task, subtask, comment, member, profile
- Thao tác UI: kéo thả Kanban, filter/search, start/stop timer
- File ảnh avatar / attachment chat (Data URL; không upload Storage)
- Prompt tới Groq (title/description task; tin nhắn có `@ai`)
- Biến môi trường: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GROQ_API_KEY` (+ service role chỉ cho seed script)

## 2.4. Đầu ra của hệ thống

- Giao diện dashboard/stats/charts
- Danh sách/board/calendar task và project
- Bản ghi DB: users, projects, project_members, tasks, subtasks, comments, notifications, time_entries, channels, messages
- Toast phản hồi CRUD
- Subtask / priority do AI gợi ý
- Tin nhắn chat persist (Team Hub)
- Theme/language lưu `localStorage`

## 2.5. Quy trình sử dụng tổng quát

Bước 1 -> Cấu hình `.env`, chạy schema SQL trên Supabase, `npm run dev`  
Bước 2 -> Mở app, đăng nhập Supabase Auth (`LoginScreen` / `signInWithPassword`)  
Bước 3 -> App fetch users/projects/tasks/time_entries/notifications từ Supabase (`useDataFetching`)  
Bước 4 -> Người dùng chọn tab trên Sidebar (`activeTab` / `ViewManager`)  
Bước 5 -> Tạo/sửa/xóa project hoặc task qua modal; Kanban cập nhật status (optimistic + sync DB)  
Bước 6 -> (Tuỳ chọn) Dùng AI trong TaskModal hoặc `@ai` trong Team Hub  
Bước 7 -> (Tuỳ chọn) Start/stop timer → ghi `time_entries`  
Bước 8 -> Đọc/đánh dấu thông báo; cập nhật profile; đăng xuất

---

# 3. CÔNG NGHỆ SỬ DỤNG

## 3.1. Ngôn ngữ lập trình

| Công nghệ | Vai trò | Vị trí sử dụng trong project | Bằng chứng/file |
|---|---|---|---|
| TypeScript | Ngôn ngữ chính frontend | Toàn bộ `src/**/*.ts(x)` | `tsconfig.json`, `package.json` (`typescript`) |
| SQL (PostgreSQL dialect) | Định nghĩa schema + seed | Schema Supabase | `src/supabase_schema.sql` |
| JavaScript (ESM) | Cấu hình build/lint | Root config | `vite.config.ts`, `eslint.config.js`, `tailwind.config.js` |

## 3.2. Frontend

| Công nghệ | Vai trò | Vị trí sử dụng trong project | Bằng chứng/file |
|---|---|---|---|
| React 19 | UI library | Components, hooks, context | `package.json`, `src/main.tsx`, `src/App.tsx` |
| React DOM | Mount app | Entry | `src/main.tsx` |
| Tailwind CSS 4 + `@tailwindcss/vite` | Styling utility | Classes trong components, CSS | `package.json`, `vite.config.ts`, `src/index.css` |
| Lucide React | Icon | Layout, views, modals | `package.json`, nhiều component |
| Recharts | Biểu đồ dashboard | Dashboard charts | `package.json`, `src/components/dashboard/*` |
| date-fns | Xử lý ngày giờ | Calendar, time view, dashboard | `package.json`, `CalendarView.tsx`, `useDashboardData.ts` |
| clsx + tailwind-merge | Ghép className | UI atoms | `package.json` (dependency); dùng qua pattern UI |

## 3.3. Backend

| Công nghệ | Vai trò | Vị trí sử dụng trong project | Bằng chứng/file |
|---|---|---|---|
| Không có backend server trong repo | — | — | Không có thư mục `server`/`api`/`backend`; không có Express/FastAPI… trong `package.json` |
| Supabase (BaaS) dùng như lớp dữ liệu/API | Client gọi trực tiếp PostgREST qua SDK | CRUD hooks/services | `@supabase/supabase-js`, `src/services/supabaseClient.ts` |

**Kết luận nhóm Backend:** Không có application backend tự host trong project hiện tại. Persistence/API qua Supabase.

## 3.4. Database

| Công nghệ | Vai trò | Vị trí sử dụng trong project | Bằng chứng/file |
|---|---|---|---|
| PostgreSQL (qua Supabase) | CSDL quan hệ | Tables + enums + RLS | `src/supabase_schema.sql`, README badge PostgreSQL |
| Supabase JS Client | Truy cập DB từ browser | Fetch/CRUD | `src/services/supabaseClient.ts`, hooks modules |

## 3.5. Authentication

| Công nghệ | Vai trò | Vị trí sử dụng trong project | Bằng chứng/file |
|---|---|---|---|
| Supabase Auth | Email/password session | Login gate + restore | `useAppLogic.ts`, `LoginScreen.tsx`, `supabaseClient.ts` |
| public.users profile | Hồ sơ nghiệp vụ = auth.uid() | Sau login | `loadProfile`, trigger `handle_new_user` |

## 3.6. Storage

| Công nghệ | Vai trò | Vị trí sử dụng trong project | Bằng chứng/file |
|---|---|---|---|
| Không dùng Supabase Storage / S3 | — | — | Không có `storage.from` trong source |
| FileReader → Data URL | Avatar / chat attachment local | ProfileModal, MemberForm, TeamHub | `ProfileModal.tsx`, `MemberForm.tsx`, `TeamHub.tsx` |
| localStorage | Theme, language, active timer | UI + timer | `useUIState.ts`, `useTimeTracking.ts` |
| URL ngoài (Dicebear, Picsum, Unsplash) | Avatar demo / ảnh nền login | Constants, Kanban, Login | `constants.ts`, `KanbanBoard.tsx`, `LoginScreen.tsx` |

## 3.7. API / dịch vụ bên ngoài

| Công nghệ | Vai trò | Vị trí sử dụng trong project | Bằng chứng/file |
|---|---|---|---|
| Supabase API (URL + anon key) | CRUD tables | Client + hooks | `vite.config.ts`, `supabaseClient.ts` |
| Groq SDK (`groq-sdk`) | Chat completions (AI) | AI subtasks/priority + Team Hub bot | `groqService.ts`, `TeamHub.tsx`, `MessageInput.tsx` |
| Dicebear API | Avatar SVG | Seed users / randomize | URL trong schema/constants/ProfileModal |
| Picsum Photos | Avatar placeholder trên card Kanban | Kanban card | `KanbanBoard.tsx` |
| Unsplash (ảnh nền) | Background login | LoginScreen | `LoginScreen.tsx` |

## 3.8. Thư viện quan trọng

| Công nghệ | Vai trò | Vị trí sử dụng trong project | Bằng chứng/file |
|---|---|---|---|
| `@supabase/supabase-js` | DB client | services + hooks | `package.json` |
| `groq-sdk` | AI client | groqService, TeamHub | `package.json` |
| `recharts` | Charts | dashboard | `package.json` |
| `lucide-react` | Icons | UI | `package.json` |
| `date-fns` | Dates | calendar/time/dashboard | `package.json` |

## 3.9. Công cụ build/deployment

| Công nghệ | Vai trò | Vị trí sử dụng trong project | Bằng chứng/file |
|---|---|---|---|
| Vite 7 | Dev server + build | Scripts `dev`/`build`/`preview` | `package.json`, `vite.config.ts` |
| `@vitejs/plugin-react` | React plugin | Vite config | `vite.config.ts` |
| TypeScript compiler | Typecheck/build TS | tsconfig* | `tsconfig.json`, `tsconfig.app.json` |
| ESLint | Lint | `npm run lint` | `eslint.config.js`, `package.json` |
| Docker / K8s / GitHub Actions | Không có trong repo | — | Không tìm thấy Dockerfile/compose/CI yaml |

---

# 4. KIẾN TRÚC HỆ THỐNG

## 4.1. Các thành phần chính

Các thành phần **thực sự tồn tại**:

- **Client / Frontend:** React SPA (Vite)
- **Database:** Supabase PostgreSQL
- **External API:** Supabase PostgREST (qua SDK), Groq API
- **AI Service:** `groqService.ts` (TaskModal + Team Hub dùng chung)

**Không tồn tại trong project:** Backend app server riêng, Worker, Queue, Storage service chuyên dụng.

## 4.2. Nhiệm vụ của từng thành phần

| Thành phần | Nhiệm vụ |
|------------|----------|
| Frontend React | UI, state, validation form cơ bản, gọi Supabase/Groq, demo auth |
| AppContext + useAppLogic | Facade state/actions toàn app |
| Supabase DB | Lưu users/projects/tasks/subtasks/comments/notifications/time_entries |
| Groq | Sinh subtask, gợi ý priority, trả lời bot chat |
| localStorage | Theme, ngôn ngữ, timer đang chạy |

## 4.3. Cách các thành phần giao tiếp với nhau

Mô tả đúng project hiện tại:

```
Browser (React SPA)
  ├─ Supabase Auth session → public.users profile
  ├─ RLS: auth.uid() / is_admin() / is_project_member()
  ├─ Realtime: notifications, channels, messages
  ├─ Groq AI (subtasks, priority, Team Hub bot)
  ├─ @supabase/supabase-js  →  Supabase (PostgreSQL + RLS public)
  └─ groq-sdk          →  Groq API
```

Luồng nghiệp vụ điển hình:

`Component UI` → `useApp()` / hook module → `supabase.from(...).select|upsert|update|delete` → PostgreSQL

AI:

`TaskModal / useTaskForm` → `groqService.generateSubtasks|suggestPriority` → Groq  
`TeamHub` → `groqService.askTeamAssistant` (mention `@ai` / `@groq`)  
`MessageInput` → UI gợi ý mention khi gõ `@` (`@ai`, `@groq`)

Không có REST API tự viết trong repo; không có pattern Frontend → Backend server → Database.

## 4.4. Cấu trúc thư mục

```
sabtask/
├── public/                 # Static assets (ví dụ favicon/assets)
├── src/
│   ├── assets/             # Asset frontend (nếu có)
│   ├── components/         # UI views, layout, modals, feature folders
│   ├── context/            # AppContext provider
│   ├── hooks/              # useAppLogic + modules + feature hooks
│   ├── services/           # supabaseClient, groqService
│   ├── utils/              # timeAggregation, roles
│   ├── constants/          # demoUsers (UUID, no passwords)
│   ├── hooks/useTeamHub.ts # channels/messages persist + Realtime
│   ├── types/              # enums, models, props, ui types
│   ├── App.tsx             # Layout + auth gate
│   ├── main.tsx            # Entry
│   ├── constants.ts        # Demo accounts, nav, mocks
│   ├── translations.ts     # i18n EN/VI
│   ├── index.css           # Global styles / Tailwind
│   └── supabase_schema.sql # Schema + seed DB
├── dist/                   # Build output (local; gitignored)
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── eslint.config.js
├── tsconfig*.json
├── README.md
├── SETUP.md
├── CODE_OVERVIEW.md
├── TAI_KHOAN.md
└── PROJECT_REPORT_INFO.md  # File này
```

**Giải thích thư mục quan trọng:**

- `src/components/`: toàn bộ giao diện theo feature (dashboard, task-modal, team-hub, layout…)
- `src/hooks/modules/`: logic domain (fetch, CRUD, search, timer, UI state)
- `src/services/`: tích hợp bên ngoài
- `src/types/`: hợp đồng dữ liệu TypeScript
- Root docs: hướng dẫn chạy và tài khoản demo

---

# 5. CƠ SỞ DỮ LIỆU

## 5.1. Hệ quản trị cơ sở dữ liệu

- **PostgreSQL** hosted trên **Supabase**
- Schema khởi tạo bằng script SQL thủ công trên SQL Editor (`SETUP.md`)
- Không có thư mục migrations kiểu Prisma/Flyway trong repo; chỉ có `src/supabase_schema.sql`
- RLS bật; policy theo `authenticated` + `auth.uid()` / `is_admin()` / `is_project_member()` (không còn `"Public access"`)

## 5.2. Danh sách bảng

| Table | Chức năng | Các trường quan trọng |
|---|---|---|
| `users` | Profile nghiệp vụ (= auth.users.id) | `id` uuid FK auth.users, `name`, `avatar`, `role`, `job_role`, `email` — **không lưu password** |
| `projects` | Dự án | `id`, `name`, `description`, `status`, `progress`, `created_by` |
| `project_members` | Thành viên dự án (N-N) | `project_id`, `user_id`, `role`, `joined_at` |
| `tasks` | Công việc | `id`, `project_id`, `title`, `description`, `status`, `priority`, `assignee_id`, `due_date`, `tags`, `created_at` |
| `subtasks` | Việc con của task | `id`, `task_id`, `title`, `completed`, `assignee_id` |
| `comments` | Bình luận trên task | `id`, `task_id`, `user_id`, `text`, `created_at` |
| `notifications` | Thông báo theo user | `id`, `user_id`, `title`, `message`, `type`, `read`, `created_at`, `task_id` |
| `time_entries` | Log thời gian làm việc | `id`, `task_id`, `user_id`, `start_time`, `end_time`, `duration_seconds`, `note`, `created_at` |
| `channels` | Kênh Team Hub | `id`, `name`, `type`, `created_by`, `created_at` |
| `messages` | Tin nhắn Team Hub | `id`, `channel_id`, `user_id`, `text`, `attachment_*`, `is_ai`, `created_at` |

**Enums SQL:** `task_status`, `priority`, `user_role`, `channel_type`.

**Bằng chứng:** `src/supabase_schema.sql`.

## 5.3. Quan hệ giữa các bảng

- `project_members.project_id` → `projects.id`; `project_members.user_id` → `users.id`
- `users.id` → `auth.users.id`
- `messages.channel_id` → `channels.id`
- `tasks.project_id` → `projects.id` (ON DELETE CASCADE)
- `tasks.assignee_id` → `users.id` (ON DELETE SET NULL)
- `subtasks.task_id` → `tasks.id` (CASCADE); `subtasks.assignee_id` → `users.id` (SET NULL)
- `comments.task_id` → `tasks.id` (CASCADE); `comments.user_id` → `users.id` (CASCADE)
- `notifications.user_id` → `users.id` (CASCADE); `notifications.task_id` → `tasks.id` (SET NULL)
- `time_entries.task_id` → `tasks.id` (CASCADE); `time_entries.user_id` → `users.id` (CASCADE)

Frontend vẫn map `project.members: string[]` từ `project_members` để tương thích UI.

## 5.4. Những dữ liệu chính được lưu

- Hồ sơ thành viên (không gồm mật khẩu)
- Dự án và danh sách thành viên dự án
- Task + trạng thái/ưu tiên/hạn/tags
- Subtask và comment gắn task
- Thông báo theo user
- Phiên làm việc / duration timer

Seed demo: 5 users, 4 projects, nhiều tasks/subtasks/comments/time_entries/notifications.

## 5.5. Storage/File nếu có

- **Không** dùng object storage của Supabase.
- Avatar: URL Dicebear hoặc Data URL base64 lưu vào cột `users.avatar` (text).
- Attachment chat: Data URL có thể lưu vào `messages.attachment_url` (không dùng Storage).

---

# 6. CHỨC NĂNG HỆ THỐNG

| STT | Chức năng | Người sử dụng | Input | Xử lý | Output | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | Đăng nhập Auth | ADMIN/MEMBER | Email, password | Supabase `signInWithPassword` | Session + profile + app shell | Đã hoàn thành |
| 2 | Đăng xuất | User đã login | Click logout | `supabase.auth.signOut` | Về LoginScreen | Đã hoàn thành |
| 3 | Dashboard analytics | User đã login | Dữ liệu tasks/projects | Tính stats/charts client | Cards + Recharts | Đã hoàn thành |
| 4 | Quản lý dự án (CRUD + detail) | User đã login | Form project | Upsert/delete Supabase | Danh sách/chi tiết project | Đã hoàn thành |
| 5 | Quản lý task (CRUD) | User đã login | Form task/subtask/comment | Upsert task + subtasks/comments | Task trên các view | Đã hoàn thành |
| 6 | Cập nhật status task (Kanban DnD / list) | User đã login | Drag/drop hoặc toggle | Optimistic UI + update DB | Status mới | Đã hoàn thành |
| 7 | Task List + FilterBar | User đã login | Search/priority/assignee | Filter client (`useSearchSystem`) | Bảng task lọc | Đã hoàn thành |
| 8 | Calendar theo due date | User đã login | Chế độ day/week/month | Lọc task theo ngày | Lịch | Đã hoàn thành |
| 9 | Global search | User đã login | Query header | Fuzzy score client | Kết quả → mở modal/view | Đã hoàn thành |
| 10 | Quản lý thành viên | ADMIN (RLS + UI) | Form member | Upsert/delete `users` (Auth user phải tồn tại) | TeamView / detail | Đã hoàn thành |
| 11 | Cập nhật profile | User hiện tại | Form profile/avatar | Upsert `users`; MEMBER không đổi role | Profile cập nhật | Đã hoàn thành |
| 12 | Time tracking (timer) | User đã login | Start/stop trên task | localStorage + insert `time_entries` | Log + today/week stats | Đã hoàn thành |
| 13 | Thông báo | User đã login | Load theo `user_id` | Mark read + Realtime | NotificationsPanel | Đã hoàn thành |
| 14 | Real-time notification | User đã login | Assign/status/comment | Postgres triggers + Realtime | Panel live | Đã hoàn thành (bật publication) |
| 15 | AI generate subtasks | User (TaskModal) | Title/description | Groq JSON array | Thêm subtasks form | Đã hoàn thành (cần `GROQ_API_KEY`) |
| 16 | AI suggest priority | User (TaskModal) | Title | Groq text | Set priority | Đã hoàn thành (cần `GROQ_API_KEY`) |
| 17 | Team Hub chat text | User đã login | Message/file + `@ai`/`@groq` | Persist `messages` + Realtime + Groq | UI chat | Đã hoàn thành (attachment Data URL) |
| 17b | Gợi ý @mention trong ô chat | User đã login | Gõ `@` | Lọc options trên client | Dropdown `@ai`, `@groq` | Đã hoàn thành |
| 18 | Team Hub voice room | User đã login | Join/mute/video toggles | State local | UI voice | **Chỉ giao diện** (không WebRTC) |
| 19 | Dark/Light + i18n EN/VI | User | Toggle | localStorage + translations | Theme/ngôn ngữ | Đã hoàn thành |
| 20 | Đăng ký / invite Edge Function | — | — | — | — | **Chưa triển khai** (seed/Dashboard) |
| 21 | View All Activity (footer noti) | — | Click | Callback rỗng | Không điều hướng | **Chưa hoàn thành** |
| 22 | Unit tests Vitest | Dev | — | `npm run test:run` | roles/time/comment map | Đã có (một phần) |

---

## 6.1. Đăng nhập

### Mục đích
Cho phép vào hệ thống bằng Supabase Auth.

### Input
Email, password.

### Quá trình xử lý
`LoginScreen` → `supabase.auth.signInWithPassword` → load `public.users` profile → `useDataFetching` (JWT gắn sẵn).

### Output
App layout (Sidebar/Header/Views) hoặc lỗi đăng nhập.

### File source liên quan
`LoginScreen.tsx`, `useAppLogic.ts`, `App.tsx`, `scripts/seed-auth-users.mjs`

### Trạng thái
Đã hoàn thành (Supabase Auth + session restore).

## 6.2. Đăng xuất

### Mục đích
Thoát phiên Auth.

### Input
Nút logout Sidebar.

### Quá trình xử lý
`supabase.auth.signOut` + clear state về `GUEST_USER`.

### Output
Quay lại LoginScreen.

### File source liên quan
`src/hooks/useAppLogic.ts`, `src/components/layout/Sidebar.tsx`

### Trạng thái
Đã hoàn thành.

## 6.3. Dashboard

### Mục đích
Tổng quan số project, task hoàn thành, productivity tuần, trend tạo/due, phân bố status, recent activity.

### Input
`tasks`, `projects` từ state (đã filter theo search nếu có).

### Quá trình xử lý
`useDashboardData` tính toán trên client; render Recharts + skeleton khi loading.

### Output
Dashboard widgets.

### File source liên quan
`src/components/Dashboard.tsx`, `src/hooks/useDashboardData.ts`, `src/components/dashboard/*`

### Trạng thái
Đã hoàn thành (dựa dữ liệu thật từ DB; `DASHBOARD_TREND_DATA` trong constants tồn tại nhưng dashboard hiện tính từ tasks).

## 6.4. Quản lý dự án

### Mục đích
Tạo/sửa/xóa/xem danh sách và chi tiết dự án.

### Input
Tên, mô tả, status, progress, members…

### Quá trình xử lý
Modal `ProjectModal`/`ProjectForm` → `handleProjectSave` upsert bảng `projects`; delete tương ứng.

### Output
Cập nhật danh sách ProjectsView / ProjectDetailView.

### File source liên quan
`ProjectsView.tsx`, `ProjectDetailView.tsx`, `ProjectModal.tsx`, `project-modal/ProjectForm.tsx`, `useEntityOperations.ts`

### Trạng thái
Đã hoàn thành.

## 6.5. Quản lý task (CRUD + subtask + comment)

### Mục đích
Quản lý vòng đời công việc.

### Input
Title, description, status, priority, project, assignee, due date, subtasks, comments; tuỳ chọn AI.

### Quá trình xử lý
`useTaskForm` → `handleTaskSave` upsert `tasks`, replace `subtasks`, upsert `comments`, rồi `refetch`.

### Output
Task xuất hiện trên Kanban/List/Calendar/Project detail.

### File source liên quan
`TaskModal.tsx`, `task-modal/*`, `useTaskForm.ts`, `useEntityOperations.ts`

### Trạng thái
Đã hoàn thành.


## 6.6. Kanban drag-and-drop

### Mục đích
Đổi trạng thái task bằng kéo thả.

### Input
HTML5 drag events.

### Quá trình xử lý
`onUpdateTaskStatus` cập nhật state ngay + `supabase.from('tasks').update({ status })`.

### Output
Task chuyển cột.

### File source liên quan
`KanbanBoard.tsx`, `useAppLogic.ts`, `useEntityOperations.ts`

### Trạng thái
Đã hoàn thành.

## 6.7. Task List & bộ lọc

### Mục đích
Xem dạng bảng và lọc.

### Input
Filter search/priority/assignee.

### Quá trình xử lý
`useSearchSystem.filteredTasks`.

### Output
`TaskListView` với dữ liệu đã lọc; có thể toggle DONE.

### File source liên quan
`TaskListView.tsx`, `FilterBar.tsx`, `useSearchSystem.ts`

### Trạng thái
Đã hoàn thành.

## 6.8. Calendar

### Mục đích
Nhìn task theo due date (day/week/month).

### Input
Tasks + điều hướng thời gian.

### Quá trình xử lý
`date-fns` tính khoảng ngày; click mở edit task.

### Output
Lưới lịch.

### File source liên quan
`CalendarView.tsx`

### Trạng thái
Đã hoàn thành (UI demo ghi chú chiều cao cố định ở một chỗ).

## 6.9. Tìm kiếm toàn cục

### Mục đích
Tìm project/task/member/comment.

### Input
Chuỗi search header.

### Quá trình xử lý
Scoring client-side; click result điều hướng/mở modal.

### Output
Danh sách tối đa 10 kết quả.

### File source liên quan
`HeaderSearch.tsx`, `useSearchSystem.ts`, `useAppLogic.ts` (`handleSearchResultClick`)

### Trạng thái
Đã hoàn thành.

## 6.10. Quản lý thành viên & profile

### Mục đích
Xem workload member; admin thêm/sửa/xóa; user sửa profile.

### Input
Form member/profile (kể cả upload ảnh local).

### Quá trình xử lý
Upsert/delete `users` (ADMIN); RLS enforce; ProfileModal ẩn đổi role với MEMBER.

### Output
TeamView / MemberDetailView / ProfileModal.

### File source liên quan
`TeamView.tsx`, `MemberDetailView.tsx`, `MemberModal.tsx`, `ProfileModal.tsx`, `useEntityOperations.ts`

### Trạng thái
Đã hoàn thành: RLS + client guards (`utils/roles.ts`); UI role vẫn là lớp UX.

## 6.11. Time tracking

### Mục đích
Đo thời gian làm task và xem lịch sử.

### Input
Start/stop timer (Header/Task form).

### Quá trình xử lý
Lưu `activeTimer` localStorage; stop → insert `time_entries`.

### Output
TimeTrackingView (today totals + weekly last-7-days + list).


### File source liên quan
`useTimeTracking.ts`, `HeaderTimer.tsx`, `TimeTrackingView.tsx`

### Trạng thái
Đã hoàn thành phần timer + log + tổng hợp tuần (7 ngày gần nhất qua `sumDurationLast7Days`).


## 6.12. Thông báo

### Mục đích
Hiển thị thông báo user và đánh dấu đã đọc.

### Input
Bản ghi `notifications` theo `user_id`.

### Quá trình xử lý
Fetch khi login; mark read; Realtime `postgres_changes`; emit qua SQL triggers (assign/status/comment).

### Output
NotificationsPanel.

### File source liên quan
`useDataFetching.ts`, `useAppLogic.ts`, `NotificationsPanel.tsx`, `notifications/*`

### Trạng thái
Đọc/ghi DB + Realtime + triggers: đã hoàn thành. Nút “View all activity”: chưa (callback trống).

## 6.13. AI hỗ trợ task

### Mục đích
Sinh subtask và gợi ý priority.

### Input
Title (± description).

### Quá trình xử lý
`generateSubtasks` / `suggestPriority` / `askTeamAssistant` — model `openai/gpt-oss-20b` (Groq chat completions).

### Output
Cập nhật form task; lỗi thì fallback message / MEDIUM.

### File source liên quan
`src/services/groqService.ts`, `useTaskForm.ts`

### Trạng thái
Đã hoàn thành khi có `GROQ_API_KEY` (inject qua `vite.config.ts`); không có key thì AI lỗi/fallback (`SETUP.md`). Model cũ `llama-3.3-70b-versatile` không còn access trên nhiều tài khoản → dùng `openai/gpt-oss-20b`.

## 6.14. Team Hub

### Mục đích
Chat kênh text/voice kiểu team collaboration.

### Input
Tin nhắn, file ≤5MB, tạo/xóa channel (admin), join voice UI.

### Quá trình xử lý
`useTeamHub` fetch/persist `channels`/`messages` + Realtime; bot Groq `@ai`/`@groq` insert message `is_ai`. Voice chỉ đổi state local (không WebRTC).

### Output
UI chat/voice; text chat **persist DB**.

### File source liên quan
`TeamHub.tsx`, `useTeamHub.ts`, `team-hub/*`, `supabase_schema.sql`

### Trạng thái
Channels/messages persist + Realtime; attachment Data URL trong cột text; voice mock.

---

## 6.15. Gợi ý @mention trong Team Hub

### Mục đích
Giúp người dùng chọn nhanh mention bot (`@ai`, `@groq`) khi gõ trong ô chat.

### Input
Ký tự `@` và chuỗi lọc sau `@`.

### Quá trình xử lý
`MessageInput` phát hiện active mention trước con trỏ; lọc danh sách; hỗ trợ ↑/↓/Enter/Tab/Escape hoặc click.

### Output
Chèn `@ai ` hoặc `@groq ` vào ô nhập.

### File source liên quan
`src/components/team-hub/MessageInput.tsx`, `src/components/TeamHub.tsx`

### Trạng thái
Đã hoàn thành.

# 7. FRONTEND / GIAO DIỆN

## 7.1. Danh sách màn hình/page

Không dùng React Router; mỗi “màn hình” là một `activeTab` / selection.

| Màn hình | Chức năng | File source |
|---|---|---|
| Login | Đăng nhập demo | `src/components/auth/LoginScreen.tsx` |
| Dashboard | Tổng quan | `src/components/Dashboard.tsx` |
| Projects list | Danh sách dự án | `src/components/ProjectsView.tsx` |
| Project detail | Chi tiết dự án + tasks | `src/components/ProjectDetailView.tsx` |
| Kanban | Board trạng thái | `src/components/KanbanBoard.tsx` |
| Task List | Bảng task | `src/components/TaskListView.tsx` |
| Calendar | Lịch due date | `src/components/CalendarView.tsx` |
| Team Hub | Chat/voice UI | `src/components/TeamHub.tsx` |
| Team members | Danh sách thành viên | `src/components/TeamView.tsx` |
| Member detail | Chi tiết member | `src/components/MemberDetailView.tsx` |
| Time Tracking | Log thời gian | `src/components/TimeTrackingView.tsx` |
| Task Modal | Tạo/sửa task | `src/components/TaskModal.tsx` |
| Project Modal | Tạo/sửa project | `src/components/ProjectModal.tsx` |
| Member Modal | Tạo/sửa member | `src/components/MemberModal.tsx` |
| Profile Modal | Sửa profile | `src/components/ProfileModal.tsx` |
| Notifications Panel | Dropdown thông báo | `src/components/NotificationsPanel.tsx` |

Điều phối: `ViewManager.tsx`, `ModalManager.tsx`, layout `Sidebar.tsx` + `Header.tsx`.

## 7.2. Luồng điều hướng

1. Chưa auth → chỉ LoginScreen.  
2. Đã auth → Sidebar đổi `activeTab`.  
3. `projects` + `selectedProject` → ProjectDetailView; back xóa selection.  
4. `team` + `selectedMember` → MemberDetailView.  
5. Search result / click task → mở TaskModal hoặc chuyển tab.  
6. `hub` dùng layout fixed height (không scroll main như view khác).

## 7.3. Component quan trọng

- **Layout:** `Sidebar`, `Header` (+ `HeaderSearch`, `HeaderTimer`, `HeaderControls`, `HeaderLanguage`, `HeaderClock`)
- **Views controller:** `ViewManager`
- **Modals controller:** `ModalManager`
- **UI atoms:** `Button`, `Card`, `Badge`, `FilterBar`, `Toast`, `Skeleton`, `ErrorBoundary`
- **Feature folders:** `dashboard/`, `task-modal/`, `team-hub/`, `notifications/`, …

## 7.4. State management nếu có

- **React Context** `AppProvider` / `useApp()` bọc `useAppLogic`
- Facade pattern: `useUIState`, `useDataFetching`, `useSearchSystem`, `useTimeTracking`, `useEntityOperations`
- State cục bộ trong một số view (TeamHub, CalendarView, forms)
- Persist: `localStorage` cho theme (`SabTask-theme`), language (`SabTask-lang`), timer (`SabTask-timer`)
- **Không** dùng Redux/Zustand/Recoil trong `package.json`

---

# 8. BACKEND

## 8.1. Kiến trúc backend

**Không có backend application trong repository.**

Kiến trúc thực tế: **BaaS** — browser gọi Supabase trực tiếp bằng anon key. Schema/RLS cấu hình trên Supabase cloud.

## 8.2. Danh sách API endpoint

Không có REST controller tự viết. Các thao tác tương đương qua Supabase client:

| Method (SDK) | Endpoint / table | Chức năng | Request | Response | File source |
|---|---|---|---|---|---|
| select | `users` | Load users | — | rows | `useDataFetching.ts` |
| select | `projects` | Load projects | — | rows | `useDataFetching.ts` |
| select | `tasks` (+ nested subtasks, comments) | Load tasks | order `created_at` | rows | `useDataFetching.ts` |
| select | `time_entries` | Load time logs | order `created_at` | rows | `useDataFetching.ts` |
| select | `notifications` | Load noti theo user | `eq user_id` | rows | `useDataFetching.ts` |
| upsert | `tasks` | Tạo/sửa task | task payload snake_case | — | `useEntityOperations.ts` |
| delete/insert | `subtasks` | Đồng bộ subtasks | theo `task_id` | — | `useEntityOperations.ts` |
| upsert | `comments` | Lưu comments | comments payload | — | `useEntityOperations.ts` |
| delete | `tasks` | Xóa task | `eq id` | — | `useEntityOperations.ts` |
| update | `tasks.status` | Đổi status | `{ status }` | — | `useEntityOperations.ts` |
| upsert/delete | `projects` | CRUD project | project object | — | `useEntityOperations.ts` |
| upsert/delete | `users` | Member/profile | mapped fields | — | `useEntityOperations.ts` |
| update | `notifications.read` | Đánh dấu đọc | `read: true` | — | `useAppLogic.ts` |
| insert | `time_entries` | Log timer | entry snake_case | — | `useTimeTracking.ts` |

Groq không phải REST tự host: gọi SDK `groq.chat.completions.create` (OpenAI-compatible).

## 8.3. Service chính

| Service | Nhiệm vụ | File |
|---------|----------|------|
| `supabase` client | Singleton DB access | `src/services/supabaseClient.ts` |
| `generateSubtasks`, `suggestPriority`, `askTeamAssistant` | AI helpers (task + Team Hub) | `src/services/groqService.ts` |
| Realtime notifications | `useAppLogic.ts` + SQL triggers |

## 8.4. Xử lý nghiệp vụ

Nằm chủ yếu ở hooks (không ở server):

- Mapping snake_case ↔ camelCase
- Optimistic update status
- Refetch sau save task
- Search/filter/dashboard aggregation trên client
- Demo login matching

## 8.5. Validation

- HTML `required` trên login inputs
- Confirm dialog trước khi xóa task/member
- TeamHub giới hạn file 5MB
- Không thấy schema validation library (Zod/Yup…) trong dependencies
- Role check UI cho một số nút admin

## 8.6. Error handling

- try/catch trong fetch/CRUD/AI → `console.error` + toast error
- `ErrorBoundary` bọc `ViewManager`
- Groq fallback khi lỗi
- Thiếu env Supabase → throw khi khởi tạo client

---

# 9. API VÀ DỊCH VỤ BÊN NGOÀI

## Supabase

- **Mục đích:** Lưu và truy vấn dữ liệu nghiệp vụ
- **Dữ liệu gửi đi:** Payload CRUD tables (users, projects, tasks, …)
- **Dữ liệu nhận về:** Rows PostgreSQL qua PostgREST
- **File source sử dụng:** `src/services/supabaseClient.ts`, hooks modules
- **Biến môi trường liên quan:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`  
  (Inject qua `vite.config.ts` thành `process.env.*`)

## Groq (via `groq-sdk`)

- **Mục đích:** Sinh subtask, gợi ý priority, trả lời bot Team Hub
- **Dữ liệu gửi đi:** Prompt text (title/description/user message); model `openai/gpt-oss-20b` qua `chat.completions.create`
- **Dữ liệu nhận về:** Text (JSON array string hoặc priority word hoặc chat reply)
- **File source sử dụng:** `src/services/groqService.ts`, `src/hooks/useTaskForm.ts`, `src/components/TeamHub.tsx`, `src/components/team-hub/MessageInput.tsx`
- **Biến môi trường liên quan:** `GROQ_API_KEY`
- **Ghi chú:** SDK chạy trên browser với `dangerouslyAllowBrowser: true` (phù hợp demo; không dùng key production trên client)


## Dicebear

- **Mục đích:** Avatar SVG theo seed
- **Dữ liệu gửi đi:** URL GET với `seed`
- **Dữ liệu nhận về:** SVG ảnh
- **File source sử dụng:** seed SQL, `constants.ts`, Profile/Member forms
- **Biến môi trường:** không

## Picsum Photos / Unsplash

- **Mục đích:** Placeholder avatar trên Kanban; ảnh nền login
- **File:** `KanbanBoard.tsx`, `LoginScreen.tsx`
- **Biến môi trường:** không

**Lưu ý bảo mật báo cáo:** Không ghi giá trị thật của API key / anon key / password từ `.env`.

---

# 10. AUTHENTICATION VÀ PHÂN QUYỀN

### Cách đăng nhập
Form email/password → `supabase.auth.signInWithPassword` → load profile `public.users`. Password lưu trong Auth (không trong `public.users`).

### Cách đăng ký
Self-serve **chưa có**. Demo: `npm run seed:auth` hoặc Auth Dashboard. Admin chỉnh profile user đã có Auth.

### Session/JWT
- Supabase Auth session (persist/restore qua `getSession` + `onAuthStateChange`).
- JWT gắn vào mọi request `@supabase/supabase-js`; RLS dùng `auth.uid()`.
- `isAuth` / `authReady` phản ánh session, không còn demo password client.

### Role
Enum `ADMIN` | `MEMBER` trên `public.users`.

### Permission
- **RLS** (chính): `is_admin()`, `is_project_member(project_id)`; notification/time_entry theo owner.
- **Client UX**: TeamView/ChannelSidebar ẩn nút; `utils/roles.ts` + `useEntityOperations` chặn member CRUD nhạy cảm; ProfileModal MEMBER không đổi role.

### Route protection
- Gate session ở `App.tsx` (Loading → Login → app).
- Không React Router; không route theo role (phụ thuộc RLS + UI).

---

# 11. XỬ LÝ DỮ LIỆU

## 11.1. Dữ liệu đầu vào

Form UI, drag-drop status, search query, file local (Data URL), prompt AI, env keys.

## 11.2. Các bước xử lý chính

1. Supabase Auth session → load `public.users` profile  
2. Fetch entities từ Supabase (JWT + RLS)  
3. Map snake_case → camelCase (kèm `project_members` → `project.members`)  
4. Filter/search/aggregate trên client cho views  
5. Khi ghi: map camelCase → snake_case → upsert/update/delete  
6. Optimistic update cho status; refetch khi cần  
7. AI: gửi prompt → parse text → gắn vào form/state hoặc insert message  
8. Weekly time: `sumDurationLast7Days` trên `timeEntries` (client)

## 11.3. Dữ liệu đầu ra

UI views/modals/toasts; rows DB cập nhật; Team Hub messages/channels persist.

## 11.4. Dữ liệu trung gian

- React state (tasks, projects, users, …)
- `filteredTasks`, `globalSearchResults`
- `activeTimer` trong localStorage
- Attachment Data URL (có thể lưu cột `messages.attachment_url`)
- `MOCK_TASKS` / `DASHBOARD_TREND_DATA` (static phụ)

### Thuật toán: weekly time aggregation (SabTask tự triển khai)

| Mục | Chi tiết |
|-----|----------|
| Tên | `sumDurationLast7Days` / `sumDurationInRange` |
| Mục đích | Tổng giây đã track trong 7 ngày gần nhất |
| Input | Mảng `{ startTime, durationSeconds }`, mốc `now` |
| Output | Tổng `number` (giây) |
| Bước | Cửa sổ `[startOfTomorrow-7d, startOfTomorrow)` → cộng duration nếu `startTime` trong khoảng |
| File | `src/utils/timeAggregation.ts`, dùng ở `TimeTrackingView.tsx` |
| Phân biệt | Không phải API ngoài; khác với Groq model |

---

# 12. CÁC MODULE QUAN TRỌNG

| Module | Nhiệm vụ | File/thư mục | Module liên quan |
|---|---|---|---|
| App shell | Auth gate + layout | `App.tsx` | AppContext, ViewManager, ModalManager |
| AppContext | Expose state/actions | `context/AppContext.tsx` | useAppLogic |
| useAppLogic | Facade tổng | `hooks/useAppLogic.ts` | tất cả modules |
| useUIState | Tab/modal/theme/i18n/toast | `hooks/modules/useUIState.ts` | translations |
| useDataFetching | Load DB | `hooks/modules/useDataFetching.ts` | supabaseClient |
| useEntityOperations | CRUD entities | `hooks/modules/useEntityOperations.ts` | supabaseClient |
| useSearchSystem | Filter + global search | `hooks/modules/useSearchSystem.ts` | HeaderSearch, FilterBar |
| useTimeTracking | Timer | `hooks/modules/useTimeTracking.ts` | HeaderTimer, TimeTrackingView |
| useTaskForm | Form + AI task | `hooks/useTaskForm.ts` | groqService, TaskModal |
| useDashboardData | Tính chart/stats | `hooks/useDashboardData.ts` | Dashboard |
| supabaseClient | DB client | `services/supabaseClient.ts` | hooks |
| groqService | AI helpers (subtasks, priority, Team Hub bot) | `services/groqService.ts` | useTaskForm, TeamHub |
| ViewManager | Switch views | `components/views/ViewManager.tsx` | view components |
| useTeamHub | Channels/messages + Realtime | `hooks/useTeamHub.ts` | TeamHub, supabase |
| roles / timeAggregation | Guard role + weekly sum | `utils/roles.ts`, `utils/timeAggregation.ts` | Profile, TimeTrackingView |
| TeamHub | Chat persist + voice mock + bot AI | `components/TeamHub.tsx` | useTeamHub, groqService |
| MessageInput | Nhập tin + gợi ý @mention | `components/team-hub/MessageInput.tsx` | TeamHub |
| Schema SQL | DB structure + seed | `supabase_schema.sql` | SETUP |

### Mô tả ngắn

- **Facade hooks** là trung tâm kiến trúc frontend (đúng CODE_OVERVIEW).  
- **Services** mỏng: chỉ client ngoài.  
- **Components** nghiêng về presentation; business nằm hooks.  
- Team Hub voice vẫn mock; invite member cần Auth trước.

---

# 13. YÊU CẦU CHỨC NĂNG

Chỉ tổng hợp từ những gì đã implement trong source:

- **FR-01:** Người dùng demo đăng nhập bằng email/mật khẩu khớp danh sách tài khoản có sẵn.
- **FR-02:** Hệ thống tải và hiển thị projects, tasks, users, time entries, notifications từ CSDL.
- **FR-03:** Người dùng tạo/sửa/xóa dự án.
- **FR-04:** Người dùng tạo/sửa/xóa task; quản lý subtask và comment gắn task.
- **FR-05:** Người dùng cập nhật trạng thái task (Kanban kéo thả và/hoặc list).
- **FR-06:** Người dùng xem task dạng list có lọc theo text/priority/assignee.
- **FR-07:** Người dùng xem task trên lịch theo due date (day/week/month).
- **FR-08:** Người dùng xem dashboard thống kê/biểu đồ từ dữ liệu task/project.
- **FR-09:** Người dùng tìm kiếm toàn cục project/task/member/comment và điều hướng tới đối tượng.
- **FR-10:** Admin thêm/sửa/xóa thành viên; mọi user xem danh sách và chi tiết member/workload.
- **FR-11:** Người dùng cập nhật hồ sơ (tên, email, role, avatar).
- **FR-12:** Người dùng start/stop timer trên task và xem lịch sử time entries.
- **FR-13:** Người dùng xem thông báo của mình và đánh dấu đã đọc.
- **FR-14:** Hệ thống hỗ trợ AI (Groq) sinh subtask và gợi ý priority (khi có `GROQ_API_KEY`).
- **FR-15:** Team Hub cho phép chat kênh text (local), mention `@ai`/`@groq` gọi Groq, UI gợi ý mention khi gõ `@`, UI voice room.
- **FR-16:** Hệ thống hỗ trợ dark/light mode và đa ngôn ngữ EN/VI.
- **FR-17:** Hệ thống hiển thị toast và bắt lỗi UI bằng ErrorBoundary/Skeleton khi phù hợp.

---

# 14. YÊU CẦU PHI CHỨC NĂNG

| Hạng mục | Nhận xét từ implementation | Mức chắc chắn |
|----------|----------------------------|---------------|
| Hiệu năng | Skeleton loading; optimistic status; search/filter client-side trên dataset demo nhỏ | Trung bình — chưa có đo đạc |
| Bảo mật | Demo passwords hardcode; RLS public; anon key trên client; không Supabase Auth | Cao (quan sát được) — mức demo, không production-secure |
| Khả năng sử dụng | Nhiều view, i18n, toast, responsive classes Tailwind | Trung bình |
| Khả năng mở rộng | Tách hooks/components tốt; Team Hub chưa có persistence; không backend riêng | Trung bình |
| Tính tương thích | Web SPA hiện đại (Vite/React 19); SETUP yêu cầu Node 18+ | Trung bình |
| Khả năng bảo trì | Có CODE_OVERVIEW, comments đầu file, cấu trúc feature folder | Trung bình–cao trong phạm vi frontend |
| Độ tin cậy / kiểm thử | Không có automated tests | Cao — thiếu bằng chứng test |

Nếu cần mức định lượng (SLA, concurrent users…): **Chưa đủ thông tin để xác định.**

---

# 15. KIỂM THỬ

Đã kiểm tra trong repo:

| Loại | Kết quả |
|------|---------|
| Unit test (`*.test.*`) | Có (Vitest: roles, timeAggregation, comment mapping) |
| Integration test | **Không có** |
| E2E (Cypress/Playwright…) | **Không có** |
| Test scripts trong `package.json` | `test`, `test:run`, `seed:auth` |
| Manual RLS checklist | `docs/RLS_MANUAL_CHECKLIST.md` |

**Kết luận:** Có unit test cơ bản; RLS cần checklist thủ công; chưa có E2E.

---

# 16. HẠN CHẾ HIỆN TẠI

### Hạn chế kỹ thuật
- Voice/video Team Hub chỉ UI (không WebRTC)
- Attachment chat dùng Data URL (không Supabase Storage)
- Không backend riêng / Edge Function invite
- Kanban có chỗ dùng `picsum.photos` thay avatar assignee
- Footer “View all activity” chưa làm

### Chức năng chưa hoàn thiện
- Đăng ký self-serve / invite Edge Function
- Voice/video thật
- “View all activity”
- Docker / CI/CD

### Hạn chế về dữ liệu
- Seed/reset SQL xóa dữ liệu public khi chạy lại
- Member mới cần tồn tại trong Auth trước (Dashboard hoặc `seed:auth`)

### Hạn chế về triển khai
- Không có Dockerfile/CI/CD trong repo
- Phụ thuộc dịch vụ ngoài (Supabase, Groq, CDN ảnh)

**Mâu thuẫn tài liệu cần lưu ý khi viết báo cáo:**  
README nêu i18n English/German và “production-ready”; code/docs gần đây dùng **EN/VI** và auth/RLS mức demo (`translations.ts`, `TAI_KHOAN.md`, `SETUP.md`).

---

# 17. HƯỚNG PHÁT TRIỂN CÓ THỂ SUY RA TỪ PROJECT

### Đã có kế hoạch / gợi ý trong source
- Activity view cho “View all” notifications
- Edge Function invite-member
- WebRTC / Storage

### Đề xuất bổ sung
- Automated E2E (Playwright)
- Object storage cho avatar/attachment
- Pipeline deploy (Docker + GitHub Actions) — xem SETUP §8

---

# 18. DANH SÁCH FILE QUAN TRỌNG ĐỂ VIẾT BÁO CÁO

| File/thư mục | Nội dung | Có thể dùng cho phần nào của báo cáo |
|---|---|---|
| `README.md` | Tổng quan sản phẩm, stack, features (có chỗ marketing/overclaim) | Ch.1–2 (đối chiếu với code) |
| `SETUP.md` | Cách chạy, env, schema, demo auth | Ch.3, phụ lục cài đặt |
| `CODE_OVERVIEW.md` | Kiến trúc source tiếng Việt | Ch.3–4, Ch.12 |
| `TAI_KHOAN.md` | Tài khoản demo | Ch.6, Ch.10, demo |
| `package.json` | Dependencies, scripts | Ch.3 |
| `vite.config.ts` | Inject env | Ch.3, Ch.9 |
| `src/supabase_schema.sql` | DB schema + seed | Ch.5 |
| `src/App.tsx` | Auth gate + layout | Ch.4, Ch.7, Ch.10 |
| `src/hooks/useAppLogic.ts` | Facade nghiệp vụ | Ch.4, Ch.8, Ch.12 |
| `src/hooks/modules/*` | Fetch/CRUD/search/timer/UI | Ch.6, Ch.8, Ch.11 |
| `src/services/supabaseClient.ts` | Client DB | Ch.3, Ch.8, Ch.9 |
| `src/services/groqService.ts` | Groq AI (subtasks, priority, Team Hub bot) | Ch.6, Ch.9 |
| `src/components/team-hub/MessageInput.tsx` | Ô chat + gợi ý @mention | Ch.6, Ch.7 |
| `src/hooks/useTeamHub.ts` | Channels/messages + Realtime | Ch.6 Team Hub |
| `docs/RLS_MANUAL_CHECKLIST.md` | Checklist kiểm thử RLS thủ công | Ch.15 |
| `src/types/models.ts` / `enums.ts` | Domain model | Ch.5, Ch.13 |
| `src/constants.ts` | Demo accounts, nav, mocks | Ch.6, Ch.10, Ch.16 |
| `src/translations.ts` | i18n EN/VI | Ch.7, NFR |
| `src/components/views/ViewManager.tsx` | Điều hướng view | Ch.7 |
| `src/components/KanbanBoard.tsx` | DnD board | Ch.6 |
| `src/components/TeamHub.tsx` | Chat/AI hub | Ch.6, Ch.16 |
| `src/components/auth/LoginScreen.tsx` | Login UI | Ch.6, Ch.10 |
| `src/context/AppContext.tsx` | State management | Ch.7.4 |

---

# 19. THÔNG TIN CÒN THIẾU

Source code **không trả lời** được các câu hỏi sau (cần sinh viên/GV bổ sung khi viết báo cáo):

1. Tên đề tài thực tập chính thức theo mẫu nhà trường là gì?
2. Mục tiêu ban đầu của đợt thực tập / KPI đánh giá?
3. Phần nào do sinh viên tự làm, phần nào clone/fork từ repo gốc (`README` đề cập `github.com/SabriMnaouer/sabtask`)?
4. Thời gian phát triển, các mốc sprint?
5. Đã demo trước ai, tính năng nào bắt buộc demo?
6. Hệ thống đã deploy môi trường nào chưa (chỉ có `dist/` local)?
7. Kết quả thực tế khi dùng với team thật (nếu có)?
8. Lý do chọn Groq (thay Gemini) và model `openai/gpt-oss-20b` cùng Supabase?
9. Yêu cầu phi chức năng chính thức từ đơn vị hướng dẫn (nếu có)?
10. Có tài liệu đặc tả/SRS riêng ngoài repo không?
11. Có thay đổi schema trên cloud khác với file SQL trong repo không?
12. Kế hoạch Docker/CI / Edge invite đã được duyệt chưa?

Không tự điền các thông tin trên.

---

# 20. TÓM TẮT DỰ ÁN CHO AI VIẾT BÁO CÁO

SabTask (`sabtask`) là ứng dụng web quản lý công việc nhóm, viết bằng React 19 và TypeScript, bundler Vite. Giao diện dùng Tailwind CSS 4, icon Lucide, biểu đồ Recharts và tiện ích ngày `date-fns`. Toàn bộ UI là SPA: không React Router; điều hướng bằng state `activeTab` trong Context. Điểm vào là `index.html` → `main.tsx` → `App.tsx`. `AppProvider` bọc `useAppLogic` (facade) gồm các module UI, fetch dữ liệu, tìm kiếm/lọc, theo dõi thời gian và CRUD entity.

Về bài toán, hệ thống hướng tới quản lý dự án và task theo nhiều góc nhìn: Dashboard thống kê, Projects, Kanban kéo-thả, Task List có filter, Calendar theo hạn, Team/member workload, Time Tracking, cùng Team Hub kiểu chat. Dữ liệu nghiệp vụ chính nằm trên PostgreSQL qua Supabase. Repo **không** chứa server backend riêng; client gọi `@supabase/supabase-js` với biến `SUPABASE_URL` và `SUPABASE_ANON_KEY`. Schema và seed nằm ở `src/supabase_schema.sql` (users, projects, project_members, tasks, subtasks, comments, notifications, time_entries, channels, messages; RLS theo auth.uid / is_admin / is_project_member).

Xác thực dùng Supabase Auth: email/password, session restore, `public.users.id` = `auth.users.id`. Vai trò ADMIN/MEMBER được enforce bằng RLS (`is_admin`, `is_project_member`) và bổ sung guard client (`utils/roles.ts`). Membership project qua bảng `project_members`.

Các chức năng đã nối DB và có thể coi là hoạt động trong phạm vi MVP gồm: CRUD project/task/member/profile; cập nhật status task (optimistic); filter/search; dashboard tính từ dữ liệu thật; đọc/đánh dấu thông báo; timer ghi `time_entries`. AI dùng `groq-sdk` model `openai/gpt-oss-20b` (biến `GROQ_API_KEY`) để sinh subtask, gợi ý priority và bot Team Hub (`askTeamAssistant` khi mention `@ai`/`@groq`); `MessageInput` có dropdown gợi ý mention khi gõ `@`. i18n thực tế là English và Tiếng Việt; dark/light lưu localStorage.

Team Hub text chat persist (`channels`/`messages` + Realtime); voice vẫn mock (không WebRTC). Notifications dùng trigger SQL + Realtime. Có Vitest unit tests và `.env.example`. Docker/CI và Storage chưa có trong repo.

Kiến trúc giao tiếp đúng với code là: Frontend → Supabase Auth/API → PostgreSQL (+ Realtime), và Frontend → Groq API. Trạng thái phù hợp để báo cáo: **MVP demo-ready với Auth/RLS**, đủ minh họa work management + BaaS + AI; Docker/CI/WebRTC/Storage còn hướng phát triển. Khi viết Chương 2–4, AI nên bám các file mục 18 và checklist RLS; để trống mục 19 cho sinh viên bổ sung.

---

*Hết file PROJECT_REPORT_INFO.md — sinh từ phân tích source workspace sabtask.*
