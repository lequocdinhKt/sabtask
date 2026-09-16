/**
 * File: components/ProjectsView.tsx
 * Mục đích: Hiển thị toàn bộ dự án dưới dạng lưới thẻ, mỗi thẻ gồm trạng thái, tiến độ,
 * thành viên và số task đã hoàn thành. Cung cấp lối vào cho các thao tác tạo dự án mới,
 * sửa, xoá và mở trang chi tiết của một dự án.
 */

import React from 'react';
import { ProjectsViewProps, TaskStatus } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Plus } from 'lucide-react';
import { ProjectCardHeader } from './projects-view/ProjectCardHeader';
import { ProjectCardProgress } from './projects-view/ProjectCardProgress';
import { ProjectCardFooter } from './projects-view/ProjectCardFooter';
import { useApp } from '../context/AppContext';

/** Component màn hình danh sách dự án: dựng lưới thẻ dự án kèm các hành động tạo, sửa, xoá và mở chi tiết. */
export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects, tasks, users, onCreateProject, onEditProject, onDeleteProject, onProjectClick
}) => {
  const { state } = useApp();
  const { t } = state;
  
  /**
   * Tính số liệu task thực tế của một dự án để hiển thị tiến độ trên thẻ.
   * @param projectId Id của dự án cần tính.
   * @returns Tổng số task, số task đã hoàn thành, phần trăm tiến độ và danh sách task thuộc dự án.
   */
  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const total = projectTasks.length;
    const completed = projectTasks.filter(t => t.status === TaskStatus.DONE).length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, progress, tasks: projectTasks };
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('projects')}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('manageProjects')}</p>
         </div>
         <Button onClick={onCreateProject} icon={<Plus size={18}/>}>
            {t('newProject')}
         </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map(project => {
          const stats = getProjectStats(project.id);
          const members = users.filter(u => project.members?.includes(u.id));

          return (
            <Card 
              key={project.id} 
              onClick={() => onProjectClick(project)}
              className="flex flex-col h-full group hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 relative overflow-hidden cursor-pointer"
            >
               <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                 project.status === 'ACTIVE' ? 'bg-emerald-500' : 
                 project.status === 'COMPLETED' ? 'bg-primary-600' : 'bg-slate-300'
               }`} />

               <ProjectCardHeader 
                  status={project.status}
                  onEdit={() => onEditProject(project)}
                  onDelete={() => {
                     if(window.confirm(t('confirmDelete'))) {
                         onDeleteProject(project.id);
                     }
                  }}
               />

               <h3 className="text-xl font-bold text-brand dark:text-brand-bright mb-2">{project.name}</h3>
               <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-6 flex-1">{project.description}</p>

               <div className="space-y-5">
                  <ProjectCardProgress progress={stats.progress} />
                  
                  <ProjectCardFooter 
                      members={members}
                      completedTasks={stats.completed}
                      totalTasks={stats.total}
                  />
               </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
