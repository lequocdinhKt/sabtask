/**
 * File: ModalManager.tsx
 * Trách nhiệm: Quản lý và render tất cả modal (task, profile, member, project).
 * Liên quan: AppContext, TaskModal, ProfileModal, MemberModal, ProjectModal.
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { TaskModal } from '../TaskModal';
import { ProfileModal } from '../ProfileModal';
import { MemberModal } from '../MemberModal';
import { ProjectModal } from '../ProjectModal';

/** Render có điều kiện các modal từ state context */
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
