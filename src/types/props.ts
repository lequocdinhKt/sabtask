/**
 * File: props.ts
 * Trách nhiệm: Khai báo props TypeScript cho các component UI / view / modal.
 * Liên quan: components/*, models.ts, enums.ts, ui.ts.
 */

import { ReactNode, ButtonHTMLAttributes, HTMLAttributes, FormEvent } from 'react';
import { TaskStatus, Priority } from './enums';
import { Task, Project, User, Comment, Subtask, TimeEntry, Notification } from './models';
import { FilterState, ViewMode, ToastMessage } from './ui';

// UI Components
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  noPadding?: boolean;
  hoverEffect?: boolean;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
}

export interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
  className?: string;
}

export interface ModalHeaderProps {
    title: string;
    subtitle?: string;
    onClose: () => void;
}

export interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export interface FilterBarProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  users: User[];
}

export interface SkeletonProps {
  className?: string;
  count?: number; 
  variant?: 'rect' | 'circle' | 'text';
}

export interface ErrorBoundaryProps {
  children?: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Auth
export interface LoginScreenProps {
  /** Trả về true nếu đăng nhập thành công */
  onLogin: (email: string, password: string) => boolean | Promise<boolean>;
  language?: 'en' | 'vi';
}

// Dashboard & Charts
export interface DashboardProps {
  tasks: Task[];
  projects: Project[];
  onNavigate?: (mode: ViewMode) => void;
}

export interface DashboardStatsProps {
  projectsCount: number;
  completedTasksCount: number;
  onNavigateProjects?: () => void;
}

export interface ProductivityCardProps {
  stats: {
    percentage: number;
    completed: number;
    total: number;
    label: string;
  };
}

export interface TaskTrendChartProps {
  data: Array<{ day: string; created: number; due: number }>;
  timeRange: 'weekly' | 'monthly';
  onRangeChange: (range: 'weekly' | 'monthly') => void;
}

export interface StatusDonutChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  totalTasks: number;
}

export interface RecentActivityProps {
  tasks: Task[];
  onViewAll?: () => void;
}

// Views
export interface KanbanBoardProps {
  tasks: Task[];
  projects?: Project[];
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  users: User[];
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onCreateTask: (status: TaskStatus) => void;
}

export interface TaskListViewProps {
  tasks: Task[];
  users: User[];
  projects?: Project[];
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  onEditTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
}

export interface CalendarViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

export interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  users: User[];
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onProjectClick: (project: Project) => void;
}

export interface ProjectCardHeaderProps {
    status: Project['status'];
    onEdit: () => void;
    onDelete: () => void;
}

export interface ProjectCardProgressProps {
    progress: number;
}

export interface ProjectCardFooterProps {
    members: User[];
    completedTasks: number;
    totalTasks: number;
}

export interface ProjectDetailViewProps {
  project: Project;
  tasks: Task[];
  users: User[];
  onBack: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onCreateTask: (status: TaskStatus) => void;
}

export interface ProjectHeaderProps {
  project: Project;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export interface ProjectStatsProps {
  progress: number;
  completed: number;
  total: number;
  inProgress: number;
  members: User[];
}

export interface TeamViewProps {
  currentUser: User;
  users: User[];
  tasks: Task[];
  onAddMember: () => void;
  onEditMember: (user: User) => void;
  onDeleteMember: (userId: string) => void;
  onMemberClick: (user: User) => void;
}

export interface MemberDetailViewProps {
  member: User;
  tasks: Task[];
  projects: Project[];
  onBack: () => void;
  onEditMember: (user: User) => void;
  onDeleteMember: (userId: string) => void;
  onEditTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
}

export interface TimeTrackingViewProps {
  timeEntries: TimeEntry[];
  tasks: Task[];
  projects: Project[];
}

// Modals & Forms
export interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  projects: Project[];
  users: User[];
  currentUser: User;
  onSave: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  defaultStatus?: TaskStatus;
}

export interface TaskModalHeaderProps {
  task?: Task | null;
  isTimerActive: boolean;
  onClose: () => void;
  onStartTimer: () => void;
  onStopTimer: () => void;
}

export interface TaskModalFooterProps {
    task?: Task | null;
    onDelete?: () => void;
    onClose: () => void;
    onSave: () => void;
}

export interface TaskModalTabsProps {
    activeTab: 'details' | 'subtasks' | 'comments';
    setActiveTab: (tab: 'details' | 'subtasks' | 'comments') => void;
    subtasksCount: number;
    commentsCount: number;
}

export interface UseTaskFormProps {
  isOpen: boolean;
  task?: Task | null;
  currentUser: User;
  projects: Project[];
  defaultStatus?: TaskStatus;
  onSave: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onClose: () => void;
}

export interface TaskDetailsProps {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  status: TaskStatus;
  setStatus: (v: TaskStatus) => void;
  priority: Priority;
  setPriority: (v: Priority) => void;
  projectId: string;
  setProjectId: (v: string) => void;
  assigneeId: string;
  setAssigneeId: (v: string) => void;
  dueDate: string;
  setDueDate: (v: string) => void;
  projects: Project[];
  users: User[];
  isGenerating: boolean;
  onAutoPriority: () => void;
  onSuggestSubtasks: () => void;
}

export interface TaskSubtasksProps {
  subtasks: Subtask[];
  users: User[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<Subtask>) => void;
  onDelete: (id: string) => void;
}

export interface TaskCommentsProps {
  comments: Comment[];
  users: User[];
  newComment: string;
  setNewComment: (val: string) => void;
  onAdd: (e: FormEvent) => void;
}

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (user: User) => void;
}

export interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: User | null; 
  onSave: (user: User) => void;
}

export interface MemberFormProps {
    member: User | null;
    onSave: (member: User) => void;
    onClose: () => void;
}

export interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  users: User[];
  onSave: (project: Project) => void;
}

export interface ProjectFormProps {
    project: Project | null;
    users: User[];
    onSave: (project: Project) => void;
    onClose: () => void;
}

// Notifications
export interface NotificationsHeaderProps {
    unreadCount: number;
    onMarkAllRead: () => void;
    onClose: () => void;
}

export interface NotificationsListProps {
    notifications: Notification[];
    onMarkRead: (id: string) => void;
}

export interface NotificationsFooterProps {
    onViewAll: () => void;
}