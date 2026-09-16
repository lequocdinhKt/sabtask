/**
 * File: useTaskForm.ts
 * Trách nhiệm: Hook quản lý form task (state, subtask, comment, AI, timer).
 * Liên quan: TaskModal.tsx, groqService.ts, AppContext.tsx.
 */

import React, { useState, useEffect } from 'react';
import { Task, Priority, TaskStatus, Subtask, Comment, UseTaskFormProps } from '../types';
import { generateSubtasks, suggestPriority } from '../services/groqService';
import { useApp } from '../context/AppContext';

/** Hook form task: khởi tạo state, xử lý lưu/xóa/subtask/comment/AI */
export const useTaskForm = ({
  isOpen, task, currentUser, projects, defaultStatus, onSave, onDelete, onClose 
}: UseTaskFormProps) => {
  const { actions } = useApp();
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  // Complex State
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  
  // UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'comments'>('details');

  // Initialization Effect
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
        // Defaults for new task
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

  // Handlers
  /** Gom dữ liệu form và gọi onSave */
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

  /** Xác nhận và gọi onDelete nếu đang sửa task */
  const handleDelete = () => {
    if (task && onDelete && window.confirm("Are you sure you want to delete this task?")) {
      onDelete(task.id);
    }
  };

  // Subtask Handlers
  const addSubtask = () => {
    setSubtasks([...subtasks, { id: Math.random().toString(), title: 'New Subtask', completed: false }]);
  };

  const updateSubtask = (id: string, updates: Partial<Subtask>) => {
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  // Comment Handlers
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

  // AI Handlers
  /** Gọi Gemini tạo subtask và chuyển tab subtasks */
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

  /** Gọi Gemini gợi ý mức ưu tiên từ tiêu đề */
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

  const handleStartTimer = () => {
    if (task) actions.handleStartTimer(task.id);
  };

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
