/**
 * File: types/enums.ts
 * Mục đích: Khai báo các tập giá trị cố định dùng xuyên suốt hệ thống, gồm trạng thái công việc,
 * mức ưu tiên, loại kết quả tìm kiếm và ngôn ngữ giao diện.
 */

/** Trạng thái vòng đời của một công việc, dùng cho cột Kanban, danh sách việc và bộ lọc. */
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
}

/** Mức độ ưu tiên của công việc, dùng khi tạo/sửa task, lọc và tính ưu tiên tự động bằng AI. */
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

/** Phân loại đối tượng trả về bởi tìm kiếm toàn cục, dùng để hiển thị và điều hướng kết quả. */
export type SearchResultType = 'TASK' | 'PROJECT' | 'MEMBER' | 'COMMENT';

/** Mã ngôn ngữ giao diện được hỗ trợ, dùng cho hàm dịch và bộ chọn ngôn ngữ trên header. */
export type Language = 'en' | 'vi';
