/**
 * File: components/ProjectDetailView.tsx
 * Mục đích: Trang chi tiết của một dự án, gồm phần header hành động, hàng thống kê tiến độ
 * và ba tab nội dung: bảng Kanban, danh sách task và danh sách thành viên tham gia.
 * Tự quản lý bộ lọc riêng (từ khoá, độ ưu tiên, người thực hiện) áp cho task của dự án này.
 */

import React, { useState, useMemo } from 'react';
import { ProjectDetailViewProps, TaskStatus, FilterState } from '../types';
import { Layout, List, Users } from 'lucide-react';
import { KanbanBoard } from './KanbanBoard';
import { TaskListView } from './TaskListView';
import { Card } from './ui/Card';
import { ProjectHeader } from './project-detail/ProjectHeader';
import { ProjectStats } from './project-detail/ProjectStats';
import { useApp } from '../context/AppContext';

/** Component trang chi tiết dự án: hiển thị thống kê và chuyển đổi giữa các tab bảng, danh sách, thành viên. */
export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project, tasks, users, onBack, onEditProject, onDeleteProject,
  onUpdateTaskStatus, onEditTask, onCreateTask
}) => {
  const { state } = useApp();
  const { t } = state;
  const [activeTab, setActiveTab] = useState<'board' | 'list' | 'team'>('board');
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    priority: 'ALL',
    assigneeId: 'ALL'
  });

  const projectTasks = tasks.filter(t => t.projectId === project.id);
  
  /**
   * Lọc task của dự án theo bộ lọc cục bộ để truyền cho tab bảng và tab danh sách:
   * khớp từ khoá trong tiêu đề hoặc mô tả, khớp độ ưu tiên và khớp người được giao.
   * Tính lại mỗi khi danh sách task của dự án hoặc bộ lọc thay đổi.
   */
  const filteredProjectTasks = useMemo(() => {
    return projectTasks.filter(t => {
       const searchMatch = 
        t.title.toLowerCase().includes(filters.search.toLowerCase()) || 
        t.description.toLowerCase().includes(filters.search.toLowerCase());
       if (!searchMatch) return false;
       if (filters.priority !== 'ALL' && t.priority !== filters.priority) return false;
       if (filters.assigneeId !== 'ALL' && t.assigneeId !== filters.assigneeId) return false;
       return true;
    });
  }, [projectTasks, filters]);
  
  const projectMembers = users.filter(u => project.members?.includes(u.id));
  
  const completed = projectTasks.filter(t => t.status === TaskStatus.DONE).length;
  const inProgress = projectTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const progress = projectTasks.length === 0 ? 0 : Math.round((completed / projectTasks.length) * 100);

  return (
    <div className="flex flex-col animate-fade-in pb-20">
      
      <ProjectHeader 
        project={project} 
        onBack={onBack}
        onEdit={() => onEditProject(project)}
        onDelete={() => { if(window.confirm(t('confirmDelete'))) onDeleteProject(project.id) }}
      />

      <ProjectStats 
        progress={progress}
        completed={completed}
        total={projectTasks.length}
        inProgress={inProgress}
        members={projectMembers}
      />

      <div className="mt-6 flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
         <button 
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'board' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
         >
            <Layout size={16} /> {t('board')}
         </button>
         <button 
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'list' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
         >
            <List size={16} /> {t('list')}
         </button>
         <button 
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'team' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
         >
            <Users size={16} /> {t('team')}
         </button>
      </div>

      <div className="mt-2">
         {activeTab === 'board' && (
            <div className="h-[600px] lg:h-[calc(100vh-350px)] min-h-[500px]">
                <KanbanBoard 
                    tasks={filteredProjectTasks} 
                    filters={filters}
                    setFilters={setFilters}
                    users={users}
                    projects={[project]}
                    onUpdateTaskStatus={onUpdateTaskStatus}
                    onEditTask={onEditTask}
                    onCreateTask={onCreateTask}
                />
            </div>
         )}
         {activeTab === 'list' && (
            <div className="pb-10">
                <TaskListView 
                    tasks={filteredProjectTasks} 
                    users={users}
                    filters={filters}
                    setFilters={setFilters}
                    projects={[project]}
                    onEditTask={onEditTask}
                    onUpdateStatus={onUpdateTaskStatus}
                />
            </div>
         )}
         {activeTab === 'team' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                 {projectMembers.map(user => {
                     const userProjectTasks = projectTasks.filter(t => t.assigneeId === user.id);
                     return (
                        <Card key={user.id} className="flex items-center gap-4">
                            <img src={user.avatar} className="w-14 h-14 rounded-2xl" />
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{user.name}</h3>
                                <p className="text-sm text-slate-500">{user.email}</p>
                                <div className="mt-2 text-xs font-semibold bg-primary-50 dark:bg-primary-900/20 text-primary-600 px-2 py-1 rounded-md w-fit">
                                    {userProjectTasks.length} {t('assignedTasks')}
                                </div>
                            </div>
                        </Card>
                     )
                 })}
                 {projectMembers.length === 0 && (
                     <div className="col-span-full text-center py-20 text-slate-400">
                         {t('noMembers')}
                     </div>
                 )}
             </div>
         )}
      </div>
    </div>
  );
};
