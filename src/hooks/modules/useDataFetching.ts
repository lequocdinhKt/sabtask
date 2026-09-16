/**
 * File: useDataFetching.ts
 * Trách nhiệm: Tải users/projects/tasks/time_entries/notifications từ Supabase khi đã đăng nhập.
 * Liên quan: supabaseClient.ts, useAppLogic.ts, supabase_schema.sql.
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Task, Project, User, TimeEntry, Notification } from '../../types';

/** Hook fetch & map dữ liệu DB → model frontend */
export const useDataFetching = (
  isAuth: boolean, 
  user: User, 
  setUser: (u: User) => void,
  setIsLoading: (l: boolean) => void,
  addToast: (t: 'success' | 'error', m: string) => void
) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.from('users').select('*');
      if (userData) {
          const mappedUsers = userData.map((u: any) => ({
              id: u.id,
              name: u.name,
              avatar: u.avatar,
              role: u.role,
              jobRole: u.job_role,
              email: u.email
          }));
          setUsers(mappedUsers as User[]);
          
          const currentUserData = mappedUsers.find((u: User) => u.id === user.id);
          if (currentUserData) {
            setUser(currentUserData);
          }
      }

      const { data: projectData } = await supabase.from('projects').select('*');
      const { data: memberRows } = await supabase.from('project_members').select('project_id, user_id');

      if (projectData) {
        const membersByProject = new Map<string, string[]>();
        (memberRows || []).forEach((row: any) => {
          const list = membersByProject.get(row.project_id) || [];
          list.push(row.user_id);
          membersByProject.set(row.project_id, list);
        });

        setProjects(projectData.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          status: p.status,
          progress: p.progress,
          members: membersByProject.get(p.id) || [],
        })) as Project[]);
      }

      const { data: taskData } = await supabase
        .from('tasks')
        .select(`*, subtasks (*), comments (*)`)
        .order('created_at', { ascending: false });

      if (taskData) {
        const formattedTasks: Task[] = taskData.map((t: any) => ({
          id: t.id,
          projectId: t.project_id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          assigneeId: t.assignee_id,
          dueDate: t.due_date,
          tags: t.tags || [],
          subtasks: (t.subtasks || []).map((st: any) => ({
             id: st.id,
             title: st.title,
             completed: st.completed,
             assigneeId: st.assignee_id 
          })),
          comments: (t.comments || []).map((c: any) => ({
             id: c.id,
             userId: c.user_id,
             text: c.text,
             createdAt: c.created_at
          })),
          createdAt: t.created_at
        }));
        setTasks(formattedTasks);
      }

      const { data: timeData } = await supabase
        .from('time_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (timeData) {
        setTimeEntries(timeData.map((t: any) => ({
          id: t.id,
          taskId: t.task_id,
          userId: t.user_id,
          startTime: t.start_time,
          endTime: t.end_time,
          durationSeconds: t.duration_seconds,
          note: t.note,
          createdAt: t.created_at
        })));
      }
      
      if (user.id) {
        const { data: notifData } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (notifData) {
          setNotifications(notifData.map((n: any) => ({
            id: n.id,
            userId: n.user_id,
            title: n.title,
            message: n.message,
            type: n.type,
            read: n.read,
            createdAt: n.created_at,
            taskId: n.task_id,
          })) as Notification[]);
        }
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      addToast('error', 'Failed to load initial data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuth && user.id) {
      fetchData();
    }
  }, [isAuth, user.id]);

  return {
    tasks, setTasks,
    projects, setProjects,
    users, setUsers,
    timeEntries, setTimeEntries,
    notifications, setNotifications,
    refetch: fetchData
  };
};
