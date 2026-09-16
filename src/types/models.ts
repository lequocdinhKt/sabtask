/**
 * File: models.ts
 * Trách nhiệm: Định nghĩa interface domain (User, Task, Project, TimeEntry...).
 * Liên quan: enums.ts, hooks fetch/CRUD, các component view/modal.
 */

import { TaskStatus, Priority, SearchResultType } from './enums';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'ADMIN' | 'MEMBER';
  jobRole?: string;
  email?: string;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  userId: string; // 'ai' for bot
  text: string;
  createdAt: string;
  isAi?: boolean;
  attachment?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  };
}

export interface Channel {
  id: string;
  name: string;
  type: 'TEXT' | 'VOICE';
  connectedUserIds?: string[]; // For voice rooms
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assigneeId?: string; 
}

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

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  progress: number;
  members: string[]; // User IDs
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startTime: string; // ISO String
  endTime?: string; // ISO String
  durationSeconds: number;
  note?: string;
  createdAt: string;
}

export interface ActiveTimer {
  taskId: string;
  startTime: string;
}

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