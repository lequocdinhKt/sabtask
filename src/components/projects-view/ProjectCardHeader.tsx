/**
 * File: ProjectCardHeader.tsx
 * Trách nhiệm: Header thẻ project — badge status, nút sửa/xóa.
 * Liên quan: ProjectsView.tsx, types/props.ts.
 */

import React from 'react';
import { ProjectCardHeaderProps } from '../../types';
import { Badge } from '../ui/Badge';
import { Edit, Trash2 } from 'lucide-react';

/** Header card project với status badge và actions */
export const ProjectCardHeader: React.FC<ProjectCardHeaderProps> = ({ status, onEdit, onDelete }) => {
    const getStatusColor = (s: string) => {
        switch(s) {
            case 'ACTIVE': return 'success';
            case 'COMPLETED': return 'primary';
            case 'ARCHIVED': return 'neutral';
            default: return 'neutral';
        }
    };

    return (
        <div className="flex justify-between items-start mb-4 mt-2">
            <Badge variant={getStatusColor(status)}>
                {status}
            </Badge>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                <button onClick={onEdit} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                    <Edit size={16} />
                </button>
                <button 
                    onClick={onDelete} 
                    className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};
