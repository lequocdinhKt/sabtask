/**
 * File: hooks/modules/useEntityOperations.ts
 * Mục đích: Tập trung toàn bộ nghiệp vụ ghi dữ liệu (tạo, sửa, xoá) cho task, subtask, comment,
 * project, thành viên và profile trên Supabase. Mỗi hàm vừa gọi Supabase, vừa cập nhật state của
 * ứng dụng (lạc quan hoặc refetch) và hiển thị toast kết quả. Việc kiểm tra quyền ở đây chỉ là lớp
 * chặn phía client, RLS trên database vẫn là lớp bảo vệ chính.
 */

import React from 'react';
import { supabase } from '../../services/supabaseClient';
import { Task, Project, User, TaskStatus } from '../../types';
import { canManageMembers, isAdmin, resolveRoleForProfileUpdate } from '../../utils/roles';

/**
 * Hook cung cấp các hàm CRUD cho task, project, thành viên và profile.
 * @param user Người dùng đang đăng nhập, dùng để kiểm tra quyền và gán created_by.
 * @param refetchData Hàm tải lại toàn bộ dữ liệu từ Supabase sau các thao tác ghi phức hợp.
 * @param setTasks Setter state danh sách task để cập nhật lạc quan.
 * @param setProjects Setter state danh sách project để cập nhật lạc quan.
 * @param setUsers Setter state danh sách thành viên để cập nhật lạc quan.
 * @param setUser Setter state người dùng hiện tại khi tự cập nhật profile.
 * @param addToast Hàm hiển thị toast thông báo thành công hoặc lỗi.
 * @returns Đối tượng chứa các hàm xử lý CRUD để tầng trên gọi lại.
 */
export const useEntityOperations = (
  user: User,
  refetchData: () => void,
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  setUsers: React.Dispatch<React.SetStateAction<User[]>>,
  setUser: React.Dispatch<React.SetStateAction<User>>,
  addToast: (t: 'success' | 'error' | 'info', m: string) => void
) => {

  /**
   * Lưu một task cùng toàn bộ subtask và comment của nó: upsert bảng tasks, xoá rồi chèn lại toàn
   * bộ subtasks của task, upsert các comments, sau đó refetch dữ liệu và hiện toast.
   * @param task Task cần lưu, đã gồm danh sách subtasks và comments.
   * @param isEdit true nếu đang cập nhật task cũ, false nếu tạo mới (chỉ ảnh hưởng nội dung toast).
   * @returns true nếu lưu thành công, false nếu có lỗi khi ghi database.
   */
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

  /**
   * Xoá một task khỏi bảng tasks rồi loại nó khỏi state danh sách task và hiện toast.
   * @param taskId Id task cần xoá.
   * @returns true nếu xoá thành công, false nếu database trả về lỗi.
   */
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

  /**
   * Cập nhật cột status của một task trên Supabase, thường dùng khi kéo thả trên Kanban.
   * Khi lỗi thì hiện toast và refetch để đưa state về đúng dữ liệu thật trong database.
   * @param id Id task cần đổi trạng thái.
   * @param status Trạng thái mới của task.
   */
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

  /**
   * Đồng bộ danh sách thành viên của một project bằng cách xoá toàn bộ dòng cũ trong bảng
   * project_members rồi chèn lại theo danh sách mới.
   * @param projectId Id project cần đồng bộ.
   * @param memberIds Danh sách id thành viên sau khi cập nhật; rỗng nghĩa là không còn thành viên.
   */
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

  /**
   * Lưu một project: upsert bảng projects (gán created_by khi tạo mới), luôn bảo đảm người tạo có
   * mặt trong danh sách thành viên, đồng bộ bảng project_members rồi cập nhật lạc quan state và
   * hiện toast.
   * @param project Project cần lưu, kèm danh sách id thành viên.
   * @param isEdit true nếu cập nhật project cũ, false nếu tạo mới.
   * @returns true nếu lưu thành công, false nếu có lỗi khi ghi database.
   */
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

  /**
   * Xoá một project khỏi bảng projects, đồng thời loại project đó và mọi task thuộc nó khỏi state.
   * @param projectId Id project cần xoá.
   * @returns true nếu xoá thành công, false nếu database trả về lỗi.
   */
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

  /**
   * Tạo mới hoặc cập nhật thông tin một thành viên trong bảng public.users, chỉ cho phép người có
   * quyền quản lý thành viên. Khi thêm mới, tài khoản phải tồn tại sẵn trong Auth (mời từ Supabase
   * Dashboard) và id của bản ghi sẵn có sẽ được dùng lại; sau đó upsert profile, cập nhật lạc quan
   * state danh sách thành viên và hiện toast.
   * @param member Thông tin thành viên cần lưu.
   * @param isEdit true nếu sửa thành viên đã có, false nếu thêm thành viên mới.
   * @returns true nếu lưu thành công, false nếu thiếu quyền, chưa có tài khoản Auth hoặc lỗi ghi.
   */
  const handleMemberSave = async (member: User, isEdit: boolean) => {
    if (!canManageMembers(user)) {
      addToast('error', 'Only admins can manage members');
      return false;
    }
    try {
       if (!isEdit) {
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

  /**
   * Xoá profile của một thành viên khỏi bảng public.users và khỏi state danh sách thành viên.
   * Chặn trước hai trường hợp: người gọi không có quyền quản lý thành viên và tự xoá chính mình.
   * @param userId Id thành viên cần xoá.
   */
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

  /**
   * Cập nhật profile trong bảng public.users, với hai lớp bảo vệ quyền: vai trò được quyết định lại
   * bởi resolveRoleForProfileUpdate để người không phải admin không tự nâng quyền, và người không
   * phải admin chỉ được sửa chính mình. Sau khi upsert thành công thì đồng bộ state người dùng hiện
   * tại (nếu là chính mình), cập nhật danh sách thành viên và hiện toast.
   * @param updatedUser Dữ liệu profile do form gửi lên.
   * @returns true nếu cập nhật thành công, false nếu không đủ quyền hoặc lỗi ghi database.
   */
  const handleProfileUpdate = async (updatedUser: User) => {
    try {
      const role = resolveRoleForProfileUpdate(user, updatedUser);
      const safeUser: User = { ...updatedUser, role };

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
