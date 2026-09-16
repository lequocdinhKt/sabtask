/**
 * File: types/ui.ts
 * Mục đích: Khai báo các kiểu dữ liệu phục vụ riêng cho tầng giao diện như chế độ xem đang mở,
 * trạng thái bộ lọc, thông báo toast và cấu hình hiển thị của sidebar/dashboard.
 */

import { Priority } from './enums';

/** Danh sách màn hình chính của ứng dụng, dùng để điều hướng giữa các view. */
export type ViewMode = 'dashboard' | 'projects' | 'kanban' | 'list' | 'calendar' | 'time' | 'team' | 'hub';

/** Điều kiện lọc công việc hiện hành (từ khoá, mức ưu tiên, người phụ trách) dùng bởi FilterBar và các view danh sách. */
export interface FilterState {
  search: string;
  priority: Priority | 'ALL';
  assigneeId: string | 'ALL';
}

/** Một thông báo toast đang hiển thị, gồm loại và nội dung, do hệ thống toast quản lý. */
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

/** Cấu hình một mục menu điều hướng trên Sidebar (view đích, nhãn và mã icon). */
export interface NavItemConfig {
  id: ViewMode;
  label: string;
  iconId: string;
}

/** Cấu hình một thẻ thống kê trên Dashboard (nhãn, mã icon và xu hướng tăng/giảm). */
export interface DashboardStatConfig {
  id: string;
  label: string;
  iconId: 'projects' | 'tasks' | 'productivity' | 'activity';
  trend?: number;
}
