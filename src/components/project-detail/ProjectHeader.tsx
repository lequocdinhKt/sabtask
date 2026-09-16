/**
 * File: ProjectHeader.tsx
 * Trách nhiệm: Header trang chi tiết project — tên, back, edit, delete.
 * Liên quan: ProjectDetailView.tsx.
 */

import React from 'react';
import { ProjectHeaderProps } from '../../types';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useApp } from '../../context/AppContext';

/** Header chi tiết project với nút quay lại và actions */
export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, onBack, onEdit, onDelete }) => {
  const { state } = useApp();
  const { t } = state;
  return (
    <div className="mb-6">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-semibold mb-4 transition-colors">
         <ArrowLeft size={16} /> {t('backToProjects')}
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <div className="flex items-center gap-3 mb-2">
               <h1 className="text-3xl font-bold text-brand dark:text-brand-bright tracking-tight">{project.name}</h1>
               <Badge variant={project.status === 'ACTIVE' ? 'success' : 'neutral'}>{t(`projectStatus_${project.status}` as any)}</Badge>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl">{project.description}</p>
         </div>
         
         <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onEdit} icon={<Edit size={14} />}>{t('edit')}</Button>
            <Button variant="danger" size="sm" onClick={onDelete} icon={<Trash2 size={14} />}>{t('delete')}</Button>
         </div>
      </div>
    </div>
  );
};
