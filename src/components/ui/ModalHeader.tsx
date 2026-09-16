/**
 * File: ModalHeader.tsx
 * Trách nhiệm: Header modal chuẩn với tiêu đề, phụ đề và nút đóng.
 * Liên quan: types/props.ts (ModalHeaderProps), TaskModal, ProfileModal.
 */

import React from 'react';
import { X } from 'lucide-react';
import { ModalHeaderProps } from '../../types';

/** Header modal với tiêu đề và nút X đóng */
export const ModalHeader: React.FC<ModalHeaderProps> = ({ title, subtitle, onClose }) => {
    return (
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {title}
                </h2>
                {subtitle && <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>
    );
};
