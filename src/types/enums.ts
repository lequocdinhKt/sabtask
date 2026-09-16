/**
 * File: enums.ts
 * Trách nhiệm: Định nghĩa enum/type dùng chung (trạng thái task, ưu tiên, ngôn ngữ...).
 * Liên quan: models.ts, translations.ts, các hook và component dùng TaskStatus / Priority / Language.
 */

/** Trạng thái vòng đời của một công việc trên Kanban / danh sách */
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
}

/** Mức độ ưu tiên của công việc */
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

/** Loại kết quả khi tìm kiếm toàn cục */
export type SearchResultType = 'TASK' | 'PROJECT' | 'MEMBER' | 'COMMENT';

/** Ngôn ngữ giao diện hỗ trợ (chỉ EN và VI) */
export type Language = 'en' | 'vi';
