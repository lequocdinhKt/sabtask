/**
 * File: MemberModal.tsx
 * Trách nhiệm: Modal thêm/sửa thành viên team.
 * Liên quan: member-modal/MemberForm.tsx, useEntityOperations.
 */

import React from 'react';
import { MemberModalProps } from '../types';
import { ModalHeader } from './ui/ModalHeader';
import { MemberForm } from './member-modal/MemberForm';
import { useApp } from '../context/AppContext';

/** Modal wrapper cho form thêm/sửa member */
export const MemberModal: React.FC<MemberModalProps> = ({ isOpen, onClose, member, onSave }) => {
  const { state } = useApp();
  const { t } = state;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        <ModalHeader 
            title={member ? t('editMember') : t('addTeamMember')}
            onClose={onClose}
        />
        
        <div className="p-8">
           <MemberForm 
             member={member}
             onSave={onSave}
             onClose={onClose}
           />
        </div>
      </div>
    </div>
  );
};
