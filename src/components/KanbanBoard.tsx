/**
 * File: KanbanBoard.tsx
 * Trách nhiệm: Bảng Kanban kéo-thả task theo cột trạng thái.
 * Liên quan: constants.ts (KANBAN_COLUMNS), FilterBar, useAppLogic.
 */

import React, { useState } from 'react';
import { KanbanBoardProps, TaskStatus, Priority } from '../types';
import { Plus, CheckSquare, Clock, Folder, CheckCircle2 } from 'lucide-react';
import { Badge } from './ui/Badge';
import { FilterBar } from './ui/FilterBar';
import { KANBAN_COLUMNS } from '../constants';
import { useApp } from '../context/AppContext';

/** Bảng Kanban với drag-and-drop cập nhật trạng thái task */
export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks, 
  projects,
  filters,
  setFilters,
  users,
  onUpdateTaskStatus,
  onEditTask,
  onCreateTask 
}) => {
  const { state } = useApp();
  const { t } = state;
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  /** Bắt đầu kéo task — lưu id và hiệu ứng opacity */
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-50', 'scale-95');
  };

  /** Kết thúc kéo — reset hiệu ứng và draggedTaskId */
  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50', 'scale-95');
    setDraggedTaskId(null);
  };

  /** Cho phép drop vào cột */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  /** Thả task vào cột — cập nhật trạng thái mới */
  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      onUpdateTaskStatus(draggedTaskId, status);
      setDraggedTaskId(null);
    }
  };

  const getProjectName = (projectId: string) => {
    return projects?.find(p => p.id === projectId)?.name;
  };

  return (
    <div className="flex flex-col h-full">
       <div className="mb-4">
          <FilterBar filters={filters} setFilters={setFilters} users={users} />
       </div>
       
       <div className="flex items-start overflow-x-auto pb-6 gap-6 custom-scrollbar px-1 min-h-[500px]">
        {KANBAN_COLUMNS.map((column) => {
            const columnTasks = tasks.filter(t => t.status === column.id);
            
            return (
            <div 
                key={column.id}
                className={`
                    flex-shrink-0 w-[340px] flex flex-col rounded-xl ${column.bg} 
                    border border-slate-200 dark:border-stone-800 shadow-sm
                    transition-all relative overflow-hidden
                `}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
            >
                {/* Column Header - Simplified for Paper look */}
                <div className={`p-5 flex items-center justify-between border-b ${column.headerBorder} bg-transparent z-10`}>
                  <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${column.dotColor} shadow-sm ring-1 ring-white dark:ring-stone-800`}></div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">{t(column.id as any)}</h3>
                      <span className="bg-slate-100 dark:bg-stone-800 px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-600 dark:text-stone-300">
                      {columnTasks.length}
                      </span>
                  </div>
                  <button 
                      onClick={() => onCreateTask(column.id)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-stone-800 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all"
                  >
                      <Plus size={18} />
                  </button>
                </div>

                {/* Tasks Container - Flat background for paper feel */}
                <div 
                  className="p-4 space-y-3 flex-1 min-h-[600px] bg-transparent"
                >
                  {columnTasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onEditTask(task)}
                      className={`
                          bg-white dark:bg-stone-800 p-5 rounded-lg
                          shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-stone-700
                          cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 hover:-translate-y-0.5 
                          transition-all duration-200 group relative
                      `}
                    >
                      <div className="flex justify-between items-start mb-3">
                          <Badge variant={
                              task.priority === Priority.HIGH ? 'danger' : 
                              task.priority === Priority.MEDIUM ? 'warning' : 'secondary'
                          }>
                              {t(task.priority as any)}
                          </Badge>
                          {projects && getProjectName(task.projectId) && (
                          <span className="text-[10px] font-medium text-brand dark:text-brand-bright flex items-center gap-1 bg-slate-50 dark:bg-stone-900 px-2 py-1 rounded-md max-w-[120px] truncate border border-slate-100 dark:border-stone-700">
                              <Folder size={10} />
                              {getProjectName(task.projectId)}
                          </span>
                          )}
                      </div>
                      
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{task.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">{task.description}</p>
                      
                      <div className="flex items-center gap-3 mb-4">
                          {task.subtasks.length > 0 && (
                              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-stone-900 px-2 py-1 rounded-md">
                                  <CheckCircle2 size={12} />
                                  <span>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
                              </div>
                          )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-stone-700/50">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <Clock size={14} />
                          <span className={new Date(task.dueDate) < new Date() ? 'text-rose-600 dark:text-rose-400' : ''}>
                              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                          </span>
                          </div>
                          {task.assigneeId && (
                          <div className="relative">
                              <img src={`https://picsum.photos/seed/${task.assigneeId}/40/40`} alt="Avatar" className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-stone-800 shadow-sm object-cover" />
                          </div>
                          )}
                      </div>
                    </div>
                  ))}
                  
                  {columnTasks.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center opacity-30 pointer-events-none mt-10">
                          {/* Ruled lines effect for empty paper state */}
                          <div className="w-full border-b border-slate-200 dark:border-stone-800 mb-8"></div>
                          <div className="w-full border-b border-slate-200 dark:border-stone-800 mb-8"></div>
                          <div className="w-full border-b border-slate-200 dark:border-stone-800 mb-8"></div>
                          <p className="text-sm font-bold absolute text-slate-500 dark:text-slate-400">{t('noTasksFound')}</p>
                      </div>
                  )}
                </div>
            </div>
            );
        })}
       </div>
    </div>
  );
};