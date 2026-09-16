/**
 * File: components/modals/ModalManager.tsx
 * Mục đích: Nơi tập trung khai báo toàn bộ modal của ứng dụng (task, hồ sơ cá nhân,
 * thành viên, project). File này lấy trạng thái đóng/mở và dữ liệu đang chỉnh sửa từ
 * context rồi truyền xuống từng modal, giúp các view không phải tự quản lý modal.
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { TaskModal } from '../TaskModal';
import { ProfileModal } from '../ProfileModal';
import { MemberModal } from '../MemberModal';
import { ProjectModal } from '../ProjectModal';

/** Component gắn kết trạng thái modal trong context với các component modal tương ứng. */
export const ModalManager: React.FC = () => {
  const { state, actions } = useApp();

  return (
    <>
      <TaskModal 
        isOpen={state.isTaskModalOpen}
        onClose={() => actions.setTaskModalOpen(false)}
        task={state.editingTask}
        projects={state.projects}
        users={state.users}
        currentUser={state.user}
        onSave={actions.handleTaskSave}
        onDelete={actions.handleTaskDelete}
        defaultStatus={state.newTaskStatus}
      />

      <ProfileModal 
         isOpen={state.isProfileModalOpen}
         onClose={() => actions.setProfileModalOpen(false)}
         user={state.user}
         onUpdate={actions.handleProfileUpdate}
      />

      <MemberModal 
         isOpen={state.isMemberModalOpen}
         onClose={() => actions.setMemberModalOpen(false)}
         member={state.editingMember}
         onSave={actions.handleMemberSave}
      />

      <ProjectModal 
         isOpen={state.isProjectModalOpen}
         onClose={() => actions.setProjectModalOpen(false)}
         project={state.editingProject}
         users={state.users}
         onSave={actions.handleProjectSave}
      />
    </>
  );
};
