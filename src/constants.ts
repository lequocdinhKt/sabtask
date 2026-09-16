/**
 * File: constants.ts
 * Trách nhiệm: Hằng số cấu hình UI và dữ liệu mock phụ (chart).
 * Liên quan: Sidebar (NAV_CONFIG), KanbanBoard (KANBAN_COLUMNS).
 * Auth: xem constants/demoUsers.ts + Supabase Auth (không hardcode password).
 */

import { NavItemConfig, TaskStatus, Task, Priority } from './types';
import { DEMO_USER_IDS } from './constants/demoUsers';

export { GUEST_USER, DEMO_USER_IDS, DEMO_USER_PROFILES } from './constants/demoUsers';

/** @deprecated dùng GUEST_USER — giữ alias để tránh import cũ gãy tạm thời */
export { GUEST_USER as CURRENT_USER } from './constants/demoUsers';

// --- UI CONFIGURATION ---

export const NAV_CONFIG: NavItemConfig[] = [
  { id: 'dashboard', iconId: 'dashboard', label: 'Overview' },
  { id: 'projects', iconId: 'folder', label: 'Projects' },
  { id: 'kanban', iconId: 'kanban', label: 'Kanban Board' },
  { id: 'list', iconId: 'list', label: 'Task List' },
  { id: 'hub', iconId: 'hub', label: 'Team Hub' },
  { id: 'calendar', iconId: 'calendar', label: 'Calendar' },
  { id: 'time', iconId: 'time', label: 'Time Tracking' },
  { id: 'team', iconId: 'team', label: 'Team Members' },
];

export const KANBAN_COLUMNS = [
  { 
      id: TaskStatus.TODO, 
      title: 'To Do', 
      bg: 'bg-white dark:bg-dark-surface',
      headerBorder: 'border-slate-200 dark:border-slate-800',
      dotColor: 'bg-slate-400'
  },
  { 
      id: TaskStatus.IN_PROGRESS, 
      title: 'In Progress', 
      bg: 'bg-white dark:bg-dark-surface',
      headerBorder: 'border-primary-200 dark:border-primary-800',
      dotColor: 'bg-primary-500'
  },
  { 
      id: TaskStatus.REVIEW, 
      title: 'Review', 
      bg: 'bg-white dark:bg-dark-surface',
      headerBorder: 'border-slate-800 dark:border-slate-200',
      dotColor: 'bg-slate-900 dark:bg-slate-100'
  },
  { 
      id: TaskStatus.DONE, 
      title: 'Done', 
      bg: 'bg-white dark:bg-dark-surface',
      headerBorder: 'border-secondary-200 dark:border-secondary-800',
      dotColor: 'bg-secondary-500'
  },
];

export const CHART_COLORS = {
  purple: '#EC4899',
  pink: '#10B981',
  orange: '#111827',
  blue: '#6B7280',
  teal: '#374151',
  slate: '#E5E7EB'
};

export const STATUS_COLORS = {
  [TaskStatus.TODO]: '#9CA3AF',
  [TaskStatus.IN_PROGRESS]: '#EC4899',
  [TaskStatus.REVIEW]: '#111827',
  [TaskStatus.DONE]: '#10B981',
};

export const DASHBOARD_TREND_DATA = [
  { day: 'Mon', tasks: 12 },
  { day: 'Tue', tasks: 18 },
  { day: 'Wed', tasks: 15 },
  { day: 'Thu', tasks: 25 },
  { day: 'Fri', tasks: 20 },
  { day: 'Sat', tasks: 8 },
  { day: 'Sun', tasks: 10 },
];

/** Mock tasks chỉ dùng cho UI demo phụ (không phải auth) */
export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'Design System Audit',
    description: 'Review current design system components for consistency.',
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    assigneeId: DEMO_USER_IDS.admin,
    dueDate: new Date().toISOString(),
    tags: ['Design', 'Audit'],
    subtasks: [],
    comments: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 't2',
    projectId: 'p1',
    title: 'API Integration',
    description: 'Integrate the new payment gateway API.',
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    assigneeId: DEMO_USER_IDS.sarah,
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    tags: ['Backend', 'API'],
    subtasks: [],
    comments: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 't3',
    projectId: 'p2',
    title: 'User Testing',
    description: 'Conduct user testing sessions for the new feature.',
    status: TaskStatus.REVIEW,
    priority: Priority.LOW,
    assigneeId: DEMO_USER_IDS.mike,
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    tags: ['QA', 'Testing'],
    subtasks: [],
    comments: [],
    createdAt: new Date().toISOString()
  }
];
