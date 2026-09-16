/**
 * File: hooks/useAppLogic.ts
 * Mục đích: Hook facade trung tâm của ứng dụng, gom toàn bộ state và actions từ các module con
 * (UI state, fetch dữ liệu Supabase, tìm kiếm, bấm giờ, CRUD entity) thành một đối tượng duy nhất
 * cho AppContext. Đồng thời quản lý phiên đăng nhập Supabase Auth, đồng bộ profile trong bảng
 * public.users và lắng nghe realtime bảng notifications của người dùng hiện tại.
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

/**
 * Chuyển một bản ghi thô của bảng public.users thành model User của frontend.
 * @param row Dữ liệu dòng trả về từ Supabase (snake_case).
 * @returns Đối tượng User đã chuẩn hoá kiểu dữ liệu (camelCase).
 */
const mapProfile = (row: Record<string, unknown>): User => ({
  id: String(row.id),
  name: String(row.name ?? ''),
  avatar: String(row.avatar ?? ''),
  role: row.role as User['role'],
  jobRole: row.job_role ? String(row.job_role) : undefined,
  email: row.email ? String(row.email) : undefined,
});

/**
 * Chuyển một bản ghi thô của bảng notifications thành model Notification của frontend.
 * @param row Dữ liệu dòng lấy từ truy vấn hoặc từ payload realtime.
 * @returns Đối tượng Notification đã chuẩn hoá kiểu dữ liệu.
 */
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

/**
 * Hook chính điều phối toàn bộ logic ứng dụng: xác thực, tải dữ liệu, CRUD, tìm kiếm, hẹn giờ.
 * @returns Đối tượng gồm `state` (dữ liệu và trạng thái UI để render) và `actions` (các hàm xử lý
 * sự kiện cho toàn bộ màn hình và modal).
 */
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

  /**
   * Đọc profile trong bảng public.users theo id của Auth user rồi đưa vào state `user`.
   * Nếu chưa có dòng profile tương ứng thì dựng tạm một user từ GUEST_USER và email đăng nhập.
   * Luôn đánh dấu đã đăng nhập ở cuối hàm.
   * @param authUserId Id người dùng lấy từ Supabase Auth.
   * @param email Email của phiên đăng nhập, dùng làm tên tạm khi thiếu profile.
   */
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

  /**
   * Khởi tạo phiên làm việc một lần khi mount: lấy session hiện có của Supabase Auth để tự động
   * đăng nhập lại, sau đó bật cờ `authReady` để App biết đã kiểm tra xong. Đồng thời đăng ký
   * listener onAuthStateChange nhằm cập nhật state khi đăng nhập, làm mới token hoặc đăng xuất.
   * Cleanup: đánh dấu unmount để bỏ qua cập nhật muộn và huỷ đăng ký listener.
   */
  useEffect(() => {
    let mounted = true;

    /** Đọc session đang có của Supabase Auth và đặt state đăng nhập tương ứng cho lần mount đầu. */
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

  /**
   * Đăng ký kênh realtime Supabase để đồng bộ danh sách thông báo của người dùng hiện tại.
   * Chạy lại mỗi khi trạng thái đăng nhập hoặc id người dùng thay đổi, và bỏ qua khi chưa đăng nhập.
   * Thêm, sửa hoặc xoá bản ghi trong bảng notifications sẽ được áp trực tiếp vào state notifications.
   * Cleanup: rời kênh realtime để tránh trùng subscription.
   */
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
   * Đăng nhập bằng email và mật khẩu qua Supabase Auth, nạp profile ngay khi thành công.
   * @param email Email đăng nhập, được cắt khoảng trắng hai đầu.
   * @param password Mật khẩu người dùng nhập.
   * @returns true nếu đăng nhập thành công, false nếu Supabase trả về lỗi.
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

  /** Đăng xuất khỏi Supabase Auth và đưa state về trạng thái khách chưa đăng nhập. */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuth(false);
    setUser(GUEST_USER);
  };

  /**
   * Lưu task qua tầng CRUD rồi đóng modal và xoá task đang chỉnh sửa nếu lưu thành công.
   * Trạng thái `editingTask` được dùng để phân biệt tạo mới và cập nhật.
   */
  const handleTaskSaveWrapper = async (task: Task) => {
    const success = await ops.handleTaskSave(task, !!ui.state.editingTask);
    if (success) {
        ui.actions.setTaskModalOpen(false);
        ui.actions.setEditingTask(null);
    }
  };

  /** Xoá task qua tầng CRUD, chỉ đóng modal task khi xoá thành công. */
  const handleTaskDeleteWrapper = async (taskId: string) => {
    const success = await ops.handleTaskDelete(taskId);
    if (success) {
        ui.actions.setTaskModalOpen(false);
        ui.actions.setEditingTask(null);
    }
  };

  /**
   * Lưu project qua tầng CRUD rồi đóng modal project khi thành công.
   * Trạng thái `editingProject` được dùng để phân biệt tạo mới và cập nhật.
   */
  const handleProjectSaveWrapper = async (project: Project) => {
    const success = await ops.handleProjectSave(project, !!ui.state.editingProject);
    if (success) {
        ui.actions.setProjectModalOpen(false);
        ui.actions.setEditingProject(null);
    }
  };

  /** Xoá project và thoát khỏi màn hình chi tiết nếu project vừa xoá đang được chọn. */
  const handleProjectDeleteWrapper = async (projectId: string) => {
    const success = await ops.handleProjectDelete(projectId);
    if (success && ui.state.selectedProject?.id === projectId) {
        ui.actions.setSelectedProject(null);
    }
  };

  /** Lưu thông tin thành viên qua tầng CRUD rồi đóng modal thành viên khi thành công. */
  const handleMemberSaveWrapper = async (member: User) => {
    const success = await ops.handleMemberSave(member, !!ui.state.editingMember);
    if (success) {
        ui.actions.setMemberModalOpen(false);
        ui.actions.setEditingMember(null);
    }
  };

  /**
   * Điều hướng ứng dụng tới đối tượng vừa được chọn trong kết quả tìm kiếm toàn cục: mở tab
   * project, mở modal task, mở tab thành viên, hoặc mở task chứa bình luận tương ứng.
   * Sau khi điều hướng thì dọn danh sách kết quả để đóng dropdown tìm kiếm.
   */
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

  /**
   * Đánh dấu một thông báo là đã đọc: cập nhật lạc quan trên state trước, sau đó ghi cột `read`
   * của bảng notifications trên Supabase.
   */
  const markNotificationAsRead = async (id: string) => {
    data.setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  };

  /**
   * Đánh dấu toàn bộ thông báo của người dùng hiện tại là đã đọc: cập nhật lạc quan trên state
   * trước, sau đó ghi tất cả dòng notifications thuộc user này trên Supabase.
   */
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
      /** Đổi trạng thái task: cập nhật lạc quan state trước rồi ghi xuống Supabase. */
      handleUpdateTaskStatus: (id: string, s: TaskStatus) => {
          data.setTasks(prev => prev.map(t => t.id === id ? { ...t, status: s } : t));
          ops.handleUpdateTaskStatus(id, s);
      },
      /** Mở modal tạo task mới với trạng thái khởi tạo theo cột Kanban được bấm. */
      openNewTaskModal: (status?: TaskStatus) => {
          ui.actions.setEditingTask(null);
          ui.actions.setNewTaskStatus(status || TaskStatus.TODO);
          ui.actions.setTaskModalOpen(true);
      },
      /** Mở modal task ở chế độ chỉnh sửa với dữ liệu task được chọn. */
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
