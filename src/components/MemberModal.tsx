/**
 * File: components/MemberModal.tsx
 * Mục đích: Lớp bọc dạng modal cho việc thêm mới hoặc chỉnh sửa một thành viên. File chỉ lo phần
 * khung modal (nền mờ, tiêu đề đổi theo chế độ thêm/sửa, nút đóng) còn phần nhập liệu do MemberForm đảm nhiệm.
 */

import React from 'react';
import { MemberModalProps } from '../types';
import { ModalHeader } from './ui/ModalHeader';
import { MemberForm } from './member-modal/MemberForm';
import { useApp } from '../context/AppContext';

/** Component modal thêm/sửa thành viên: không render gì khi đóng, khi mở thì hiện tiêu đề và MemberForm. */
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
