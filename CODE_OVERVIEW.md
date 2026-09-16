# Tổng quan mã nguồn SabTask

SabTask là ứng dụng quản lý công việc (work management) fullstack phía client: **React 19 + TypeScript + Vite**, backend **Supabase (PostgreSQL + Auth + RLS)**, AI **Groq**.

## Tech stack

| Layer | Công nghệ |
|-------|-----------|
| UI | React 19, Tailwind CSS 4, Lucide icons |
| Build | Vite 7, TypeScript, Vitest |
| State | React Context + custom hooks (Facade) |
| Backend | Supabase Auth + PostgreSQL + Realtime |
| AI | `groq-sdk` |
| Charts | Recharts |
| Utils | date-fns, clsx, tailwind-merge |

## Luồng khởi động

```
index.html → src/main.tsx → App.tsx
                              │
                              ├─ AppProvider → useAppLogic()
                              │     └─ supabase.auth.getSession / onAuthStateChange
                              └─ AppLayout
                                    ├─ LoginScreen (chưa session)
                                    ├─ Sidebar + Header
                                    ├─ ViewManager
                                    ├─ ModalManager
                                    └─ Toast + ErrorBoundary
```

Auth: **Supabase Auth** (`signInWithPassword`). `isAuth` phản ánh session; profile lấy từ `public.users`.

## Cấu trúc thư mục `src/` (tóm tắt)

- `hooks/useAppLogic.ts` — facade Auth + modules
- `hooks/useTeamHub.ts` — channels/messages + Realtime
- `hooks/modules/*` — fetch, CRUD, search, timer, UI
- `services/supabaseClient.ts`, `groqService.ts`
- `utils/roles.ts`, `utils/timeAggregation.ts`
- `constants/demoUsers.ts` — UUID demo (không password)
- `supabase_schema.sql` — schema + RLS + seed

## Auth & bảo mật

1. Seed Auth: `npm run seed:auth` (cần `SUPABASE_SERVICE_ROLE_KEY` local)
2. Chạy `supabase_schema.sql`
3. Client chỉ dùng anon key; RLS dùng `auth.uid()`, `is_admin()`, `is_project_member()`
4. Checklist thủ công: `docs/RLS_MANUAL_CHECKLIST.md`

## Env

Xem `.env.example` / `SETUP.md`: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GROQ_API_KEY`.

## Hướng phát triển

Docker multi-stage, GitHub Actions (`lint` + `test:run` + `build`), Edge Function invite, WebRTC, Storage — mô tả trong `SETUP.md` §8.
