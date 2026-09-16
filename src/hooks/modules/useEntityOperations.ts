/**
 * File: useEntityOperations.ts
 * Trách nhiệm: CRUD task, project, member và cập nhật profile qua Supabase.
 * Phân quyền client-side bổ sung; RLS là lớp chính.
 */

import React from 'react';
import { supabase } from '../../services/supabaseClient';
import { Task, Project, User, TaskStatus } from '../../types';
import { canManageMembers, isAdmin, resolveRoleForProfileUpdate } from '../../utils/roles';

/** Hook thao tác CRUD entity: task, project, member, profile */
export const useEntityOperations = (
  user: User,
  refetchData: () => void,
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  setUsers: React.Dispatch<React.SetStateAction<User[]>>,
  setUser: React.Dispatch<React.SetStateAction<User>>,
  addToast: (t: 'success' | 'error' | 'info', m: string) => void
) => {

  const handleTaskSave = async (task: Task, isEdit: boolean) => {
    try {
      const taskPayload = {
        id: task.id,
        project_id: task.projectId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee_id: task.assigneeId || null,
        due_date: task.dueDate,
        tags: task.tags,
        created_at: task.createdAt
      };
      
      const { error } = await supabase.from('tasks').upsert(taskPayload);
      if (error) throw error;

      await supabase.from('subtasks').delete().eq('task_id', task.id);
      if (task.subtasks.length > 0) {
        const subtasksToInsert = task.subtasks.map(s => ({
          id: s.id,
          task_id: task.id,
          title: s.title,
          completed: s.completed,
          assignee_id: s.assigneeId || null
        }));
        await supabase.from('subtasks').insert(subtasksToInsert);
      }

      if (task.comments.length > 0) {
        const commentsToUpsert = task.comments.map(c => ({
          id: c.id,
          task_id: task.id,
          user_id: c.userId,
          text: c.text,
          created_at: c.createdAt
        }));
        await supabase.from('comments').upsert(commentsToUpsert);
      }

      refetchData();
      addToast('success', isEdit ? 'Task updated successfully' : 'Task created successfully');
      return true;
    } catch (e) {
      console.error("Failed to save task", e);
      addToast('error', 'Failed to save task to database.');
      return false;
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== taskId));
      addToast('success', 'Task deleted');
      return true;
    } catch (e) {
      console.error("Failed to delete task", e);
      addToast('error', 'Failed to delete task');
      return false;
    }
  };

  const handleUpdateTaskStatus = async (id: string, status: TaskStatus) => {
    try {
      const { error } = await supabase.from('tasks').update({ status }).eq('id', id);
      if (error) throw error;
      addToast('info', `Status updated to ${status}`);
    } catch {
      addToast('error', 'Failed to update status');
      refetchData();
    }
  };

  const syncProjectMembers = async (projectId: string, memberIds: string[]) => {
    await supabase.from('project_members').delete().eq('project_id', projectId);
    if (memberIds.length === 0) return;
    const rows = memberIds.map((userId) => ({
      project_id: projectId,
      user_id: userId,
    }));
    const { error } = await supabase.from('project_members').insert(rows);
    if (error) throw error;
  };

  const handleProjectSave = async (project: Project, isEdit: boolean) => {
    try {
        const memberIds = Array.from(new Set([
          ...(project.members || []),
          ...(user.id ? [user.id] : []),
        ]));

        const projectPayload: Record<string, unknown> = {
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          progress: project.progress,
        };
        if (!isEdit && user.id) {
          projectPayload.created_by = user.id;
        }

        const { error } = await supabase.from('projects').upsert(projectPayload);
        if (error) throw error;

        await syncProjectMembers(project.id, memberIds);
        const saved: Project = { ...project, members: memberIds };
        
        if (isEdit) {
            setProjects(prev => prev.map(p => p.id === project.id ? saved : p));
            addToast('success', 'Project updated');
        } else {
            setProjects(prev => [...prev, saved]);
            addToast('success', 'Project created');
        }
        return true;
    } catch (e) {
        console.error("Failed to save project", e);
        addToast('error', 'Failed to save project');
        return false;
    }
  };

  const handleProjectDelete = async (projectId: string) => {
    try {
        const { error } = await supabase.from('projects').delete().eq('id', projectId);
        if (error) throw error;
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setTasks(prev => prev.filter(t => t.projectId !== projectId));
        addToast('success', 'Project deleted');
        return true;
    } catch (e) {
        console.error("Failed to delete project", e);
        addToast('error', 'Failed to delete project');
        return false;
    }
  };

  const handleMemberSave = async (member: User, isEdit: boolean) => {
    if (!canManageMembers(user)) {
      addToast('error', 'Only admins can manage members');
      return false;
    }
    try {
       if (!isEdit) {
         // New member must already exist in Auth / public.users (invite via Dashboard)
         const { data: existing } = await supabase
           .from('users')
           .select('id')
           .eq('email', member.email)
           .maybeSingle();
         if (!existing) {
           addToast('error', 'User must exist in Auth first. Invite via Supabase Dashboard, then edit profile.');
           return false;
         }
         member = { ...member, id: existing.id };
       }

       const dbMember = {
         id: member.id,
         name: member.name,
         email: member.email,
         role: member.role,
         avatar: member.avatar,
         job_role: member.jobRole
       };

       const { error } = await supabase.from('users').upsert(dbMember);
       if (error) throw error;
       if (isEdit) {
         setUsers(prev => prev.map(u => u.id === member.id ? member : u));
         addToast('success', 'Member updated');
       } else {
         setUsers(prev => {
           if (prev.some(u => u.id === member.id)) {
             return prev.map(u => u.id === member.id ? member : u);
           }
           return [...prev, member];
         });
         addToast('success', 'Member updated');
       }
       return true;
    } catch (e) { 
        console.error(e);
        addToast('error', 'Operation failed');
        return false;
    }
  };

  const handleDeleteMember = async (userId: string) => {
     if (!canManageMembers(user)) {
       addToast('error', 'Only admins can remove members');
       return;
     }
     if (userId === user.id) {
       addToast('error', 'You cannot delete yourself');
       return;
     }
     try {
       const { error } = await supabase.from('users').delete().eq('id', userId);
       if (error) throw error;
       setUsers(prev => prev.filter(u => u.id !== userId));
       addToast('success', 'Member removed');
     } catch (e) { 
         console.error(e); 
         addToast('error', 'Failed to remove member');
     }
  };

  const handleProfileUpdate = async (updatedUser: User) => {
    try {
      const role = resolveRoleForProfileUpdate(user, updatedUser);
      const safeUser: User = { ...updatedUser, role };

      // Non-admin can only update self and cannot change role
      if (!isAdmin(user) && updatedUser.id !== user.id) {
        addToast('error', 'Permission denied');
        return false;
      }

      const dbUser = {
        id: safeUser.id,
        name: safeUser.name,
        email: safeUser.email,
        role: safeUser.role,
        avatar: safeUser.avatar,
        job_role: safeUser.jobRole
      };

      const { error } = await supabase.from('users').upsert(dbUser);
      if (error) throw error;
      if (safeUser.id === user.id) setUser(safeUser);
      setUsers(prev => prev.map(u => u.id === safeUser.id ? safeUser : u));
      addToast('success', 'Profile updated');
      return true;
    } catch (e) {
       console.error("Failed to update profile", e);
       addToast('error', 'Update failed');
       return false;
    }
  };

  return {
    handleTaskSave, handleTaskDelete, handleUpdateTaskStatus,
    handleProjectSave, handleProjectDelete,
    handleMemberSave, handleDeleteMember, handleProfileUpdate
  };
};
