/**
 * File: ProjectForm.tsx
 * Trách nhiệm: Form tạo/sửa project — tên, mô tả, status, members.
 * Liên quan: ProjectModal.tsx, useEntityOperations.ts.
 */

import React, { useState } from 'react';
import { ProjectFormProps, Project } from '../../types';
import { Briefcase, FileText, Activity, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';

/** Form nhập thông tin project và chọn thành viên */
export const ProjectForm: React.FC<ProjectFormProps> = ({ project, users, onSave, onClose }) => {
  const { state } = useApp();
  const { t } = state;
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [status, setStatus] = useState<'ACTIVE' | 'ARCHIVED' | 'COMPLETED'>(project?.status || 'ACTIVE');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(project?.members || []);

  /** Bật/tắt member trong danh sách thành viên project */
  const handleToggleMember = (userId: string) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(prev => prev.filter(id => id !== userId));
    } else {
      setSelectedMembers(prev => [...prev, userId]);
    }
  };

  /** Submit form và gọi onSave với dữ liệu project */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      id: project?.id || Math.random().toString(36).substr(2, 9),
      name,
      description,
      status,
      members: selectedMembers,
      progress: project?.progress || 0
    };
    onSave(newProject);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('projectName')}</label>
            <div className="relative">
            <Briefcase size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium"
                placeholder={t('projectPlaceholder')}
            />
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('projectDescription')}</label>
            <div className="relative">
            <FileText size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium"
                placeholder={t('projectDescPlaceholder')}
            />
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('status')}</label>
            <div className="relative">
            <Activity size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <select 
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium appearance-none"
            >
                <option value="ACTIVE">{t('projectStatus_ACTIVE')}</option>
                <option value="COMPLETED">{t('projectStatus_COMPLETED')}</option>
                <option value="ARCHIVED">{t('projectStatus_ARCHIVED')}</option>
            </select>
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
            <Users size={14} /> {t('assignTeamMembers')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {users.map(u => (
                <div 
                    key={u.id}
                    onClick={() => handleToggleMember(u.id)}
                    className={`
                    flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all
                    ${selectedMembers.includes(u.id) 
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 dark:border-primary-500/50' 
                        : 'bg-slate-50 dark:bg-slate-800 border-transparent hover:border-slate-200'
                    }
                    `}
                >
                    <div className="relative">
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full" />
                        {selectedMembers.includes(u.id) && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-600 rounded-full border border-white"></div>
                        )}
                    </div>
                    <span className={`text-sm font-medium ${selectedMembers.includes(u.id) ? 'text-primary-700 dark:text-primary-300' : 'text-slate-600 dark:text-slate-300'}`}>
                        {u.name}
                    </span>
                </div>
            ))}
            </div>
        </div>

        <div className="pt-4 flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>{t('cancel')}</Button>
            <Button type="submit" variant="primary" className="flex-1">
            {project ? t('saveProject') : t('createProject')}
            </Button>
        </div>
    </form>
  );
};
