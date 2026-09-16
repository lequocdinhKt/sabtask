/**
 * File: ProjectModal.tsx
 * Trách nhiệm: Modal tạo/sửa dự án.
 * Liên quan: project-modal/ProjectForm.tsx, useEntityOperations.
 */

import React from 'react';
import { ProjectModalProps } from '../types';
import { ModalHeader } from './ui/ModalHeader';
import { ProjectForm } from './project-modal/ProjectForm';
import { useApp } from '../context/AppContext';

/** Modal wrapper cho form tạo/sửa project */
export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen, onClose, project, users, onSave 
}) => {
  const { state } = useApp();
  const { t } = state;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        <ModalHeader 
            title={project ? t('editProject') : t('createProject')}
            subtitle={t('defineGoals')}
            onClose={onClose}
        />

        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
           <ProjectForm 
              project={project}
              users={users}
              onSave={onSave}
              onClose={onClose}
           />
        </div>
      </div>
    </div>
  );
};
