/**
 * File: types/props.ts
 * Mục đích: Tập trung khai báo kiểu props cho toàn bộ component của SabTask, từ các thành phần UI
 * dùng chung, biểu đồ dashboard, các view chính cho tới modal/form và panel thông báo.
 */

import { ReactNode, ButtonHTMLAttributes, HTMLAttributes, FormEvent } from 'react';
import { TaskStatus, Priority } from './enums';
import { Task, Project, User, Comment, Subtask, TimeEntry, Notification } from './models';
import { FilterState, ViewMode, ToastMessage } from './ui';

/** Props của Card: khối bao nội dung dùng chung, tuỳ chọn bỏ padding và bật hiệu ứng hover. */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  noPadding?: boolean;
  hoverEffect?: boolean;
}

/** Props của Button: chọn biến thể màu, kích thước và icon kèm theo. */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
}

/** Props của Badge: nhãn nhỏ thể hiện trạng thái hoặc mức ưu tiên. */
export interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
  className?: string;
}

/** Props của ModalHeader: tiêu đề, phụ đề và hành động đóng dùng chung cho các modal. */
export interface ModalHeaderProps {
    title: string;
    subtitle?: string;
    onClose: () => void;
}

/** Props của Toast: danh sách thông báo đang hiển thị và hàm gỡ một thông báo. */
export interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

/** Props của FilterBar: trạng thái lọc hiện tại, hàm cập nhật lọc và danh sách người dùng để chọn người phụ trách. */
export interface FilterBarProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  users: User[];
}

/** Props của Skeleton: khối giả lập khi đang tải, cấu hình số lượng và hình dạng. */
export interface SkeletonProps {
  className?: string;
  count?: number; 
  variant?: 'rect' | 'circle' | 'text';
}

/** Props của ErrorBoundary: phần cây React được bảo vệ khỏi lỗi runtime. */
export interface ErrorBoundaryProps {
  children?: ReactNode;
}

/** State nội bộ của ErrorBoundary: cờ đã có lỗi và đối tượng lỗi bắt được. */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/** Props của LoginScreen: hàm onLogin trả về true khi đăng nhập thành công và ngôn ngữ hiển thị form. */
export interface LoginScreenProps {
  onLogin: (email: string, password: string) => boolean | Promise<boolean>;
  language?: 'en' | 'vi';
}

/** Props của Dashboard: dữ liệu công việc, dự án và hàm điều hướng sang view khác. */
export interface DashboardProps {
  tasks: Task[];
  projects: Project[];
  onNavigate?: (mode: ViewMode) => void;
}

/** Props của DashboardStats: các số liệu tổng quan và hành động mở danh sách dự án. */
export interface DashboardStatsProps {
  projectsCount: number;
  completedTasksCount: number;
  onNavigateProjects?: () => void;
}

/** Props của ProductivityCard: thống kê năng suất gồm tỷ lệ, số việc hoàn thành, tổng số việc và nhãn mô tả. */
export interface ProductivityCardProps {
  stats: {
    percentage: number;
    completed: number;
    total: number;
    label: string;
  };
}

/** Props của TaskTrendChart: dữ liệu việc tạo mới/đến hạn theo ngày, khoảng thời gian đang chọn và hàm đổi khoảng. */
export interface TaskTrendChartProps {
  data: Array<{ day: string; created: number; due: number }>;
  timeRange: 'weekly' | 'monthly';
  onRangeChange: (range: 'weekly' | 'monthly') => void;
}

/** Props của StatusDonutChart: phân bố công việc theo trạng thái và tổng số việc để tính tỷ lệ. */
export interface StatusDonutChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  totalTasks: number;
}

/** Props của RecentActivity: danh sách công việc gần đây và hành động xem tất cả. */
export interface RecentActivityProps {
  tasks: Task[];
  onViewAll?: () => void;
}

/** Props của KanbanBoard: dữ liệu và các hành động kéo/thả đổi trạng thái, mở sửa hoặc tạo việc theo cột. */
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

/** Props của TaskListView: dữ liệu việc dạng danh sách kèm bộ lọc và hành động sửa/đổi trạng thái. */
export interface TaskListViewProps {
  tasks: Task[];
  users: User[];
  projects?: Project[];
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  onEditTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
}

/** Props của CalendarView: danh sách công việc để xếp theo hạn hoàn thành và hành động mở sửa việc. */
export interface CalendarViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

/** Props của ProjectsView: danh sách dự án dạng thẻ kèm các hành động tạo, sửa, xoá và mở chi tiết dự án. */
export interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  users: User[];
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onProjectClick: (project: Project) => void;
}

/** Props của ProjectCardHeader: trạng thái dự án và hai hành động sửa/xoá trên thẻ dự án. */
export interface ProjectCardHeaderProps {
    status: Project['status'];
    onEdit: () => void;
    onDelete: () => void;
}

/** Props của ProjectCardProgress: phần trăm tiến độ để vẽ thanh progress trên thẻ dự án. */
export interface ProjectCardProgressProps {
    progress: number;
}

/** Props của ProjectCardFooter: danh sách thành viên và số việc đã xong trên tổng số việc của dự án. */
export interface ProjectCardFooterProps {
    members: User[];
    completedTasks: number;
    totalTasks: number;
}

/** Props của ProjectDetailView: dữ liệu chi tiết một dự án kèm hành động quay lại, sửa/xoá dự án và quản lý việc bên trong. */
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

/** Props của ProjectHeader: thông tin dự án và các hành động quay lại, sửa, xoá ở đầu trang chi tiết. */
export interface ProjectHeaderProps {
  project: Project;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** Props của ProjectStats: các chỉ số tổng hợp của dự án (tiến độ, số việc theo trạng thái, thành viên). */
export interface ProjectStatsProps {
  progress: number;
  completed: number;
  total: number;
  inProgress: number;
  members: User[];
}

/** Props của TeamView: danh sách thành viên kèm khối lượng việc và các hành động thêm, sửa, xoá, mở chi tiết thành viên. */
export interface TeamViewProps {
  currentUser: User;
  users: User[];
  tasks: Task[];
  onAddMember: () => void;
  onEditMember: (user: User) => void;
  onDeleteMember: (userId: string) => void;
  onMemberClick: (user: User) => void;
}

/** Props của MemberDetailView: thông tin một thành viên cùng việc được giao và các hành động sửa/xoá thành viên, cập nhật việc. */
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

/** Props của TimeTrackingView: các bản ghi thời gian cùng việc và dự án tương ứng để tổng hợp báo cáo chấm công. */
export interface TimeTrackingViewProps {
  timeEntries: TimeEntry[];
  tasks: Task[];
  projects: Project[];
}

/** Props của TaskModal: modal tạo/sửa công việc kèm dữ liệu tham chiếu và các hành động lưu, xoá, đóng. */
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

/** Props của TaskModalHeader: tiêu đề modal việc kèm trạng thái timer và các hành động bật/dừng timer, đóng modal. */
export interface TaskModalHeaderProps {
  task?: Task | null;
  isTimerActive: boolean;
  onClose: () => void;
  onStartTimer: () => void;
  onStopTimer: () => void;
}

/** Props của TaskModalFooter: các nút hành động cuối modal việc gồm xoá, huỷ và lưu. */
export interface TaskModalFooterProps {
    task?: Task | null;
    onDelete?: () => void;
    onClose: () => void;
    onSave: () => void;
}

/** Props của TaskModalTabs: tab đang mở, hàm đổi tab và số lượng việc con/bình luận hiển thị kèm nhãn. */
export interface TaskModalTabsProps {
    activeTab: 'details' | 'subtasks' | 'comments';
    setActiveTab: (tab: 'details' | 'subtasks' | 'comments') => void;
    subtasksCount: number;
    commentsCount: number;
}

/** Tham số của hook useTaskForm: dữ liệu khởi tạo form việc và các callback lưu, xoá, đóng modal. */
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

/** Props của TaskDetails: toàn bộ trường form chi tiết việc cùng hàm setter, kèm hai hành động AI gợi ý ưu tiên và việc con. */
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

/** Props của TaskSubtasks: danh sách việc con và các hành động thêm, cập nhật, xoá từng mục checklist. */
export interface TaskSubtasksProps {
  subtasks: Subtask[];
  users: User[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<Subtask>) => void;
  onDelete: (id: string) => void;
}

/** Props của TaskComments: danh sách bình luận, nội dung đang soạn và hành động gửi bình luận mới. */
export interface TaskCommentsProps {
  comments: Comment[];
  users: User[];
  newComment: string;
  setNewComment: (val: string) => void;
  onAdd: (e: FormEvent) => void;
}

/** Props của ProfileModal: modal xem/cập nhật thông tin cá nhân của người dùng đang đăng nhập. */
export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (user: User) => void;
}

/** Props của MemberModal: modal thêm mới hoặc sửa thành viên nhóm. */
export interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: User | null; 
  onSave: (user: User) => void;
}

/** Props của MemberForm: form nhập thông tin thành viên bên trong MemberModal cùng hành động lưu và đóng. */
export interface MemberFormProps {
    member: User | null;
    onSave: (member: User) => void;
    onClose: () => void;
}

/** Props của ProjectModal: modal tạo/sửa dự án kèm danh sách người dùng để gán thành viên. */
export interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  users: User[];
  onSave: (project: Project) => void;
}

/** Props của ProjectForm: form nhập thông tin dự án bên trong ProjectModal cùng hành động lưu và đóng. */
export interface ProjectFormProps {
    project: Project | null;
    users: User[];
    onSave: (project: Project) => void;
    onClose: () => void;
}

/** Props của NotificationsHeader: số thông báo chưa đọc và các hành động đánh dấu đã đọc hết, đóng panel. */
export interface NotificationsHeaderProps {
    unreadCount: number;
    onMarkAllRead: () => void;
    onClose: () => void;
}

/** Props của NotificationsList: danh sách thông báo và hành động đánh dấu một thông báo là đã đọc. */
export interface NotificationsListProps {
    notifications: Notification[];
    onMarkRead: (id: string) => void;
}

/** Props của NotificationsFooter: hành động xem toàn bộ hoạt động ở chân panel thông báo. */
export interface NotificationsFooterProps {
    onViewAll: () => void;
}