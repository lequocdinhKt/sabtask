/**
 * File: constants.ts
 * Mục đích: Tập hợp các hằng số cấu hình giao diện của SabTask (menu điều hướng, cột Kanban,
 * bảng màu biểu đồ/trạng thái) và một ít dữ liệu mock dùng cho demo dashboard.
 * File cũng re-export các hằng số tài khoản demo từ constants/demoUsers.ts để component import một nơi.
 */

import { NavItemConfig, TaskStatus, Task, Priority } from './types';
import { DEMO_USER_IDS } from './constants/demoUsers';

/** Re-export hằng số tài khoản demo để các module khác chỉ cần import từ constants.ts. */
export { GUEST_USER, DEMO_USER_IDS, DEMO_USER_PROFILES } from './constants/demoUsers';

/** Alias cũ của GUEST_USER, giữ lại cho các import trước đây; nên dùng GUEST_USER thay thế. */
export { GUEST_USER as CURRENT_USER } from './constants/demoUsers';

/** Danh sách mục menu điều hướng bên trái, dùng để render Sidebar và xác định tab đang mở. */
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

/** Cấu hình 4 cột của bảng Kanban (trạng thái, tiêu đề và lớp CSS màu sắc tương ứng). */
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

/** Bảng mã màu dùng cho các biểu đồ ở Dashboard. */
export const CHART_COLORS = {
  purple: '#EC4899',
  pink: '#10B981',
  orange: '#111827',
  blue: '#6B7280',
  teal: '#374151',
  slate: '#E5E7EB'
};

/** Ánh xạ từng trạng thái task sang mã màu, dùng cho biểu đồ tròn và badge trạng thái. */
export const STATUS_COLORS = {
  [TaskStatus.TODO]: '#9CA3AF',
  [TaskStatus.IN_PROGRESS]: '#EC4899',
  [TaskStatus.REVIEW]: '#111827',
  [TaskStatus.DONE]: '#10B981',
};

/** Dữ liệu mock số task theo từng ngày trong tuần, dùng minh hoạ biểu đồ xu hướng ở Dashboard. */
export const DASHBOARD_TREND_DATA = [
  { day: 'Mon', tasks: 12 },
  { day: 'Tue', tasks: 18 },
  { day: 'Wed', tasks: 15 },
  { day: 'Thu', tasks: 25 },
  { day: 'Fri', tasks: 20 },
  { day: 'Sat', tasks: 8 },
  { day: 'Sun', tasks: 10 },
];

/** Danh sách task mock (không lưu database), chỉ dùng để demo giao diện khi chưa có dữ liệu thật. */
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
