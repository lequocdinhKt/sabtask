/**
 * File: hooks/useTaskForm.ts
 * Mục đích: Custom hook quản lý toàn bộ trạng thái của form tạo/sửa task dùng trong TaskModal.
 * Hook nạp dữ liệu khi modal mở, giữ giá trị các trường nhập, quản lý danh sách subtask và comment ở phía client,
 * gọi AI (Groq) để gợi ý subtask cùng mức ưu tiên, và điều khiển timer đo thời gian làm task qua AppContext.
 */

import React, { useState, useEffect } from 'react';
import { Task, Priority, TaskStatus, Subtask, Comment, UseTaskFormProps } from '../types';
import { generateSubtasks, suggestPriority } from '../services/groqService';
import { useApp } from '../context/AppContext';

/**
 * Hook cung cấp state và các handler cho form task.
 * @param props Thông tin đầu vào của form: cờ mở modal, task đang sửa (nếu có), user hiện tại, danh sách project, trạng thái mặc định và các callback lưu/xóa/đóng.
 * @returns Object gồm formState (giá trị và setter của từng trường), uiState (tab đang mở, cờ đang gọi AI) và handlers (các hàm xử lý sự kiện).
 */
export const useTaskForm = ({
  isOpen, task, currentUser, projects, defaultStatus, onSave, onDelete, onClose 
}: UseTaskFormProps) => {
  const { actions } = useApp();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'comments'>('details');

  /**
   * Khởi tạo lại toàn bộ form mỗi khi modal được mở hoặc task/danh sách project thay đổi:
   * nạp dữ liệu từ task đang sửa, hoặc điền giá trị mặc định cho task mới (project đầu tiên,
   * người thực hiện là user hiện tại, hạn là hôm nay), sau đó reset tab về "details" và xóa ô nhập comment.
   * Effect này không cần cleanup.
   */
  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setStatus(task.status);
        setPriority(task.priority);
        setProjectId(task.projectId);
        setAssigneeId(task.assigneeId || '');
        setDueDate(task.dueDate.split('T')[0]);
        setSubtasks(task.subtasks || []);
        setComments(task.comments || []);
      } else {
        setTitle('');
        setDescription('');
        setStatus(defaultStatus || TaskStatus.TODO);
        setPriority(Priority.MEDIUM);
        setProjectId(projects[0]?.id || '');
        setAssigneeId(currentUser.id);
        setDueDate(new Date().toISOString().split('T')[0]);
        setSubtasks([]);
        setComments([]);
      }
      setActiveTab('details');
      setNewComment('');
    }
  }, [isOpen, task, defaultStatus, projects, currentUser]);

  /** Gom toàn bộ giá trị đang nhập thành một object Task rồi gửi ra ngoài qua callback onSave để lưu. */
  const handleSubmit = () => {
    const updatedTask: Task = {
      id: task?.id || Math.random().toString(36).substr(2, 9),
      title,
      description,
      status,
      priority,
      projectId,
      assigneeId,
      dueDate: new Date(dueDate).toISOString(),
      tags: [], 
      subtasks,
      comments,
      createdAt: task?.createdAt || new Date().toISOString()
    };
    onSave(updatedTask);
  };

  /** Hỏi xác nhận người dùng rồi gọi onDelete để xóa task đang sửa. */
  const handleDelete = () => {
    if (task && onDelete && window.confirm("Are you sure you want to delete this task?")) {
      onDelete(task.id);
    }
  };

  /** Thêm một subtask trống vào danh sách để người dùng đặt lại tên. */
  const addSubtask = () => {
    setSubtasks([...subtasks, { id: Math.random().toString(), title: 'New Subtask', completed: false }]);
  };

  /**
   * Cập nhật một phần thông tin của subtask trong danh sách.
   * @param id Mã subtask cần sửa.
   * @param updates Các trường cần ghi đè, ví dụ tiêu đề hoặc trạng thái hoàn thành.
   */
  const updateSubtask = (id: string, updates: Partial<Subtask>) => {
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  /** Xóa một subtask khỏi danh sách theo mã. */
  const deleteSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  /** Tạo comment mới từ nội dung đang nhập và thêm vào danh sách comment của form. */
  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Math.random().toString(),
      userId: currentUser.id,
      text: newComment,
      createdAt: new Date().toISOString()
    };
    setComments([...comments, comment]);
    setNewComment('');
  };

  /** Nhờ AI (Groq) sinh danh sách subtask từ tiêu đề và mô tả task, thêm kết quả vào form rồi chuyển sang tab subtasks. */
  const handleAISubtasks = async () => {
    if (!title) return;
    setIsGenerating(true);
    try {
      const generated = await generateSubtasks(title, description);
      const newSubtasks = generated.map(t => ({
        id: Math.random().toString(),
        title: t,
        completed: false
      }));
      setSubtasks([...subtasks, ...newSubtasks]);
      setActiveTab('subtasks');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  /** Nhờ AI (Groq) phân tích tiêu đề task để gợi ý mức ưu tiên và điền sẵn vào form. */
  const handleAIPriority = async () => {
    if (!title) return;
    setIsGenerating(true);
    try {
      const suggested = await suggestPriority(title);
      setPriority(suggested as Priority);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  /** Bắt đầu đếm thời gian làm việc cho task đang mở thông qua action toàn cục. */
  const handleStartTimer = () => {
    if (task) actions.handleStartTimer(task.id);
  };

  /** Dừng timer đang chạy và ghi lại phiên làm việc thông qua action toàn cục. */
  const handleStopTimer = () => {
    actions.handleStopTimer();
  };

  return {
    formState: {
      title, setTitle, description, setDescription, status, setStatus,
      priority, setPriority, projectId, setProjectId, assigneeId, setAssigneeId,
      dueDate, setDueDate, subtasks, comments, newComment, setNewComment
    },
    uiState: {
      isGenerating, activeTab, setActiveTab
    },
    handlers: {
      handleSubmit, handleDelete, addSubtask, updateSubtask, deleteSubtask,
      addComment, handleAISubtasks, handleAIPriority, handleStartTimer, handleStopTimer
    }
  };
};
