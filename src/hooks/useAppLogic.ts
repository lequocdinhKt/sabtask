/**
 * File: useAppLogic.ts
 * Trách nhiệm: Facade gom state/actions (Supabase Auth, UI, data, CRUD, search, timer).
 * Liên quan: AppContext.tsx, LoginScreen, ViewManager / ModalManager.
 */

import { useState, useEffect } from 'react';
import { User, TaskStatus, Task, Project, SearchResult, Notification } from '../types';
import { GUEST_USER } from '../constants';
import { supabase } from '../services/supabaseClient';

import { useUIState } from './modules/useUIState';
import { useDataFetching } from './modules/useDataFetching';
import { useSearchSystem } from './modules/useSearchSystem';
import { useTimeTracking } from './modules/useTimeTracking';
import { useEntityOperations } from './modules/useEntityOperations';

const mapProfile = (row: Record<string, unknown>): User => ({
  id: String(row.id),
  name: String(row.name ?? ''),
  avatar: String(row.avatar ?? ''),
  role: row.role as User['role'],
  jobRole: row.job_role ? String(row.job_role) : undefined,
  email: row.email ? String(row.email) : undefined,
});

const mapNotification = (row: Record<string, unknown>): Notification => ({
  id: String(row.id),
  userId: String(row.user_id),
  title: String(row.title),
  message: String(row.message),
  type: row.type as Notification['type'],
  read: Boolean(row.read),
  createdAt: String(row.created_at),
  taskId: row.task_id ? String(row.task_id) : undefined,
});

/** Hook trung tâm: Auth session → profile → data/CRUD */
export const useAppLogic = () => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [user, setUser] = useState<User>(GUEST_USER);

  const ui = useUIState();
  const data = useDataFetching(isAuth, user, setUser, ui.actions.setIsLoading, ui.actions.addToast);
  const search = useSearchSystem(data.tasks, data.projects, data.users);
  const timer = useTimeTracking(user, data.setTimeEntries, ui.actions.addToast);
  const ops = useEntityOperations(
    user, data.refetch,
    data.setTasks, data.setProjects, data.setUsers, setUser,
    ui.actions.addToast
  );

  /** Load profile public.users từ auth user id */
  const loadProfile = async (authUserId: string, email?: string | null) => {
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .maybeSingle();

    if (error) {
      console.error('Failed to load profile', error);
    }

    if (profile) {
      setUser(mapProfile(profile));
    } else {
      setUser({
        ...GUEST_USER,
        id: authUserId,
        email: email || undefined,
        name: email?.split('@')[0] || 'User',
      });
    }
    setIsAuth(true);
  };

  /** Restore session + lắng nghe Auth state */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!mounted) return;
      if (session?.user) {
        await loadProfile(session.user.id, session.user.email);
      } else {
        setIsAuth(false);
        setUser(GUEST_USER);
      }
      setAuthReady(true);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT' || !session?.user) {
        setIsAuth(false);
        setUser(GUEST_USER);
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        await loadProfile(session.user.id, session.user.email);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  /** Realtime notifications cho user hiện tại */
  useEffect(() => {
    if (!isAuth || !user.id) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const n = mapNotification(payload.new as Record<string, unknown>);
            data.setNotifications((prev) => [n, ...prev.filter((x) => x.id !== n.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const n = mapNotification(payload.new as Record<string, unknown>);
            data.setNotifications((prev) => prev.map((x) => (x.id === n.id ? n : x)));
          } else if (payload.eventType === 'DELETE') {
            const oldId = String((payload.old as Record<string, unknown>).id);
            data.setNotifications((prev) => prev.filter((x) => x.id !== oldId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuth, user.id]);

  /**
   * Đăng nhập qua Supabase Auth (email/password).
   * @returns true nếu thành công
   */
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error || !signInData.user) {
      console.error('Login failed', error);
      return false;
    }
    await loadProfile(signInData.user.id, signInData.user.email);
    return true;
  };

  /** Đăng xuất Supabase + clear state */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuth(false);
    setUser(GUEST_USER);
  };

  const handleTaskSaveWrapper = async (task: Task) => {
    const success = await ops.handleTaskSave(task, !!ui.state.editingTask);
    if (success) {
        ui.actions.setTaskModalOpen(false);
        ui.actions.setEditingTask(null);
    }
  };

  const handleTaskDeleteWrapper = async (taskId: string) => {
    const success = await ops.handleTaskDelete(taskId);
    if (success) {
        ui.actions.setTaskModalOpen(false);
        ui.actions.setEditingTask(null);
    }
  };

  const handleProjectSaveWrapper = async (project: Project) => {
    const success = await ops.handleProjectSave(project, !!ui.state.editingProject);
    if (success) {
        ui.actions.setProjectModalOpen(false);
        ui.actions.setEditingProject(null);
    }
  };

  const handleProjectDeleteWrapper = async (projectId: string) => {
    const success = await ops.handleProjectDelete(projectId);
    if (success && ui.state.selectedProject?.id === projectId) {
        ui.actions.setSelectedProject(null);
    }
  };

  const handleMemberSaveWrapper = async (member: User) => {
    const success = await ops.handleMemberSave(member, !!ui.state.editingMember);
    if (success) {
        ui.actions.setMemberModalOpen(false);
        ui.actions.setEditingMember(null);
    }
  };

  const handleSearchResultClick = (result: SearchResult) => {
     switch (result.type) {
       case 'PROJECT':
         ui.actions.setSelectedProject(result.data as Project);
         ui.actions.setActiveTab('projects');
         break;
       case 'TASK':
         ui.actions.setEditingTask(result.data as Task);
         ui.actions.setTaskModalOpen(true);
         break;
       case 'MEMBER':
         ui.actions.setSelectedMember(result.data as User);
         ui.actions.setActiveTab('team');
         break;
       case 'COMMENT': {
         const parentTask = data.tasks.find(t => t.id === result.referenceId);
         if (parentTask) {
             ui.actions.setEditingTask(parentTask);
             ui.actions.setTaskModalOpen(true);
         }
         break;
       }
     }
     search.setGlobalSearchResults([]);
  };

  const markNotificationAsRead = async (id: string) => {
    data.setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  };

  const markAllNotificationsAsRead = async () => {
    data.setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
  };

  return {
    state: {
      ...ui.state,
      user, isAuth, authReady,
      tasks: search.filteredTasks, rawTasks: data.tasks, projects: data.projects, users: data.users,
      timeEntries: data.timeEntries, notifications: data.notifications,
      activeTimer: timer.activeTimer,
      filters: search.filters, globalSearchResults: search.globalSearchResults,
      searchQuery: search.filters.search,
    },
    actions: {
      ...ui.actions,
      setIsAuth,
      handleLogin,
      handleLogout,

      handleTaskSave: handleTaskSaveWrapper,
      handleTaskDelete: handleTaskDeleteWrapper,
      handleUpdateTaskStatus: (id: string, s: TaskStatus) => {
          data.setTasks(prev => prev.map(t => t.id === id ? { ...t, status: s } : t));
          ops.handleUpdateTaskStatus(id, s);
      },
      openNewTaskModal: (status?: TaskStatus) => {
          ui.actions.setEditingTask(null);
          ui.actions.setNewTaskStatus(status || TaskStatus.TODO);
          ui.actions.setTaskModalOpen(true);
      },
      openEditTaskModal: (task: Task) => {
          ui.actions.setEditingTask(task);
          ui.actions.setTaskModalOpen(true);
      },

      handleProjectSave: handleProjectSaveWrapper,
      handleProjectDelete: handleProjectDeleteWrapper,
      openNewProjectModal: () => { ui.actions.setEditingProject(null); ui.actions.setProjectModalOpen(true); },
      openEditProjectModal: (p: Project) => { ui.actions.setEditingProject(p); ui.actions.setProjectModalOpen(true); },
      handleProjectClick: (p: Project) => { ui.actions.setSelectedProject(p); ui.actions.setActiveTab('projects'); },
      handleBackToProjects: () => ui.actions.setSelectedProject(null),

      handleProfileUpdate: (u: User) => ops.handleProfileUpdate(u),
      handleMemberSave: handleMemberSaveWrapper,
      handleDeleteMember: ops.handleDeleteMember,
      openNewMemberModal: () => { ui.actions.setEditingMember(null); ui.actions.setMemberModalOpen(true); },
      openEditMemberModal: (m: User) => { ui.actions.setEditingMember(m); ui.actions.setMemberModalOpen(true); },
      handleMemberClick: (m: User) => { ui.actions.setSelectedMember(m); ui.actions.setActiveTab('team'); },
      handleBackToTeam: () => ui.actions.setSelectedMember(null),

      handleStartTimer: timer.handleStartTimer,
      handleStopTimer: timer.handleStopTimer,

      performGlobalSearch: search.performGlobalSearch,
      handleSearchResultClick,
      setSearchQuery: (q: string) => search.setFilters(prev => ({...prev, search: q})),
      setFilters: search.setFilters,

      markNotificationAsRead,
      markAllNotificationsAsRead
    }
  };
};
