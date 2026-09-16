/**
 * File: ui.ts
 * Trách nhiệm: Kiểu dữ liệu thuần UI (ViewMode, FilterState, Toast, NavItem...).
 * Liên quan: useUIState, useSearchSystem, Sidebar, FilterBar.
 */

import { Priority } from './enums';

export type ViewMode = 'dashboard' | 'projects' | 'kanban' | 'list' | 'calendar' | 'time' | 'team' | 'hub';

export interface FilterState {
  search: string;
  priority: Priority | 'ALL';
  assigneeId: string | 'ALL';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface NavItemConfig {
  id: ViewMode;
  label: string;
  iconId: string;
}

export interface DashboardStatConfig {
  id: string;
  label: string;
  iconId: 'projects' | 'tasks' | 'productivity' | 'activity';
  trend?: number;
}
