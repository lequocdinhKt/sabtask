/**
 * File: types/models.ts
 * Mục đích: Định nghĩa các thực thể nghiệp vụ của SabTask (người dùng, dự án, công việc, việc con,
 * bình luận, chat, chấm công, thông báo, kết quả tìm kiếm) tương ứng với dữ liệu lưu trên Supabase.
 */

import { TaskStatus, Priority, SearchResultType } from './enums';

/** Người dùng hệ thống kèm quyền truy cập và thông tin hiển thị, dùng cho phân quyền và gán việc. */
export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'ADMIN' | 'MEMBER';
  jobRole?: string;
  email?: string;
}

/** Một bình luận của người dùng trong tab bình luận của công việc. */
export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

/** Một tin nhắn trong kênh chat của Team Hub, có thể do người dùng hoặc trợ lý AI gửi và kèm tệp đính kèm. */
export interface ChatMessage {
  id: string;
  channelId: string;
  userId: string;
  text: string;
  createdAt: string;
  isAi?: boolean;
  attachment?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  };
}

/** Một kênh của Team Hub, dạng kênh chat văn bản hoặc phòng thoại kèm danh sách người đang tham gia. */
export interface Channel {
  id: string;
  name: string;
  type: 'TEXT' | 'VOICE';
  connectedUserIds?: string[];
}

/** Một mục việc con trong checklist của công việc, có thể gán riêng cho một thành viên. */
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assigneeId?: string; 
}

/** Công việc thuộc một dự án, là thực thể trung tâm của Kanban, danh sách việc, lịch và chấm công. */
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  dueDate: string;
  tags: string[];
  subtasks: Subtask[];
  comments: Comment[];
  createdAt: string;
}

/** Dự án chứa các công việc, kèm trạng thái, tiến độ và danh sách mã thành viên tham gia. */
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  progress: number;
  members: string[];
}

/** Một phiên làm việc đã ghi nhận cho công việc, dùng để tổng hợp thời gian trong màn hình chấm công. */
export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  note?: string;
  createdAt: string;
}

/** Bộ đếm thời gian đang chạy của người dùng hiện tại, dùng để hiển thị timer trên header và task modal. */
export interface ActiveTimer {
  taskId: string;
  startTime: string;
}

/** Thông báo gửi tới một người dùng khi có thay đổi liên quan tới công việc, hiển thị trong panel thông báo. */
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ASSIGNMENT' | 'STATUS_CHANGE' | 'COMMENT' | 'DUE_DATE';
  read: boolean;
  createdAt: string;
  taskId?: string;
}

/** Một kết quả của tìm kiếm toàn cục kèm điểm liên quan và dữ liệu gốc để mở đúng đối tượng. */
export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  score: number;
  metadata?: any;
  data: Task | Project | User | Comment;
  referenceId?: string;
}