
# SabTask - AI Powered Work Management Platform

![React](https://img.shields.io/badge/React-19.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Vite](https://img.shields.io/badge/Vite-4.6-purple) ![Supabase](https://img.shields.io/badge/Supabase-Database-green) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-blue) ![Groq](https://img.shields.io/badge/AI-Groq-orange)


SabTask is a fullstack work management system designed for modern teams. Built with **React 19**, it leverages **Groq** for AI assistance and **Supabase** for data persistence. It features a glassmorphic UI that is fully responsive and supports both dark and light modes.

## 🚀 Key Features

*   **AI-Powered Productivity**:
    *   **Auto-Subtasks**: One-click generation of actionable subtasks from a generic task description using Groq.
    *   **Smart Priority**: Analyzes task titles to suggest appropriate priority levels.
*   **Flexible Views**:
    *   **Dashboard**: Real-time analytics, trends, and productivity insights.
    *   **Kanban Board**: Drag-and-drop task management with a clean "Paper-like" aesthetic.
    *   **Task List**: Detailed table view with sorting and filtering.
    *   **Calendar**: Visual timeline of due dates.
*   **Enterprise-Grade Robustness**:
    *   **Graceful Degradation**: Global Error Boundaries prevent white-screen crashes and offer user recovery options.
    *   **Optimized Loading**: Skeleton screens are used to reduce Cumulative Layout Shift (CLS) and improve perceived performance during data fetching.
*   **Team Collaboration**:
    *   Project-based organization with `project_members`.
    *   Member workload tracking and performance stats.
    *   Real-time notifications (Supabase Realtime + DB triggers).
    *   Team Hub text chat persisted to Supabase.
*   **Time Tracking**: Built-in stopwatch, today stats, and weekly (last 7 days) aggregation.
*   **Global Search**: Fuzzy search across tasks, projects, members, and comments.
*   **Internationalization**: English and Vietnamese.
*   **Auth & RLS**: Supabase Auth email/password; row-level security by role and project membership.

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript
*   **Styling**: Tailwind CSS (Custom Config), Lucide React (Icons)
*   **State Management**: React Context + Custom Facade Hooks
*   **Backend / Database**: Supabase (PostgreSQL + RLS)
*   **AI**: Groq SDK (`openai/gpt-oss-20b`)
*   **Visualization**: Recharts

## 📂 Project Structure

The project follows a **Senior-Level Architecture** focusing on Separation of Concerns (SoC) and Modularity:

```
/
├── components/         # Atomic UI components and Feature Views
│   ├── dashboard/      # Widgets for the Dashboard view
│   ├── layout/         # Header, Sidebar, and Shell composition
│   ├── modals/         # Modal containers and Manager
│   ├── ui/             # Reusable atoms (Buttons, Cards, Badges, Skeleton, ErrorBoundary)
│   └── views/          # Route-level view controllers
├── context/            # Global AppContext definition
├── hooks/
│   ├── modules/        # Domain-specific logic (Data, UI, Search, Timer)
│   ├── useAppLogic.ts  # The Facade hook aggregating all modules
│   └── ...             # Feature-specific hooks (TaskForm, DashboardData)
├── services/           # External API integrations (Supabase, Gemini)
├── types/              # Modular TypeScript definitions
│   ├── enums.ts        # Shared Enums
│   ├── models.ts       # Domain Entities
│   ├── props.ts        # Component Props
│   └── index.ts        # Barrel file
└── index.html          # Entry HTML
```

## ⚡ Getting Started

SabTask uses **Vite** as the development and build tool for fast, optimized builds.

1. **Clone the repository**:
    ```bash
    git clone https://github.com/SabriMnaouer/sabtask.git
    ```
2. **Install dependencies**:
    ```bash
    npm install
    ```
3. **Environment Setup**:
    Copy `.env.example` to `.env` and set:
    *   `SUPABASE_URL` & `SUPABASE_ANON_KEY`
    *   `GROQ_API_KEY` (optional AI)
    *   `SUPABASE_SERVICE_ROLE_KEY` (local only — for `npm run seed:auth`)

    Then: `npm run seed:auth` → run `src/supabase_schema.sql` in Supabase SQL Editor. See [SETUP.md](./SETUP.md) and [TAI_KHOAN.md](./TAI_KHOAN.md).

    Create a `.env` file in the project root with:
    ```
    SUPABASE_URL=<your_supabase_url>
    SUPABASE_ANON_KEY=<your_supabase_anon_key>
    GROQ_API_KEY=<your_groq_api_key>
    ```
4. **Run development server**:
    ```bash
    npm run dev
    ```
5. **Optional: Build for production**:
    ```bash
    npm run build
    ```


## 🎨 Design System

SabTask uses a custom "Vibrant Modern" color palette defined in `tailwind.config` within `index.html`:
*   **Primary Accent**: Vibrant Pink (`#EC4899`)
*   **Secondary Accent**: Emerald Green (`#10B981`)
*   **Neutrals**: Sharp Black & Pure White with Cool Greys (`#111827`, `#FFFFFF`)
*   **Aesthetics**: Glassmorphism, Rounded Corners, and Soft Shadows

## 🛡️ Architecture Highlights

*   **Facade Pattern**: The `useAppLogic` hook hides the complexity of 5 different sub-hooks, providing a clean API to the view layer.
*   **Optimistic Updates**: Task status changes reflect immediately in the UI while syncing with the database in the background.
*   **Composition**: The `Header` component is composed of small, isolated logical units (`HeaderClock`, `HeaderSearch`, etc.) to improve maintainability and performance.

---
© 2026 SabTask. Built for the future of work.
