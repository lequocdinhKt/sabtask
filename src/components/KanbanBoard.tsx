/**
 * File: components/KanbanBoard.tsx
 * Mục đích: Hiển thị danh sách task dưới dạng bảng Kanban, mỗi cột ứng với một trạng thái
 * lấy từ KANBAN_COLUMNS. Cho phép kéo-thả thẻ task giữa các cột để đổi trạng thái, mở modal
 * sửa task khi bấm vào thẻ và tạo task mới ngay tại cột tương ứng.
 */

import React, { useState } from 'react';
import { KanbanBoardProps, TaskStatus, Priority } from '../types';
import { Plus, CheckSquare, Clock, Folder, CheckCircle2 } from 'lucide-react';
import { Badge } from './ui/Badge';
import { FilterBar } from './ui/FilterBar';
import { KANBAN_COLUMNS } from '../constants';
import { useApp } from '../context/AppContext';

/** Component bảng Kanban: dựng các cột trạng thái, thẻ task và thanh lọc phía trên. */
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

  /**
   * Ghi nhớ task vừa được người dùng bắt đầu kéo và làm mờ thẻ để báo hiệu đang kéo.
   * @param e Sự kiện kéo của React, dùng để đặt kiểu hiệu ứng và truy cập thẻ đang kéo.
   * @param taskId Mã task được kéo, sẽ dùng lại khi thả vào cột đích.
   */
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-50', 'scale-95');
  };

  /** Trả thẻ task về trạng thái hiển thị bình thường và xóa task đang kéo khi kết thúc thao tác kéo. */
  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50', 'scale-95');
    setDraggedTaskId(null);
  };

  /** Chặn hành vi mặc định của trình duyệt để cột Kanban được phép nhận thẻ task thả vào. */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  /**
   * Xử lý khi người dùng thả thẻ task vào một cột: gọi callback cập nhật trạng thái task theo cột đích.
   * @param e Sự kiện thả của React.
   * @param status Trạng thái ứng với cột nhận thẻ, sẽ trở thành trạng thái mới của task.
   */
  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      onUpdateTaskStatus(draggedTaskId, status);
      setDraggedTaskId(null);
    }
  };

  /**
   * Tra tên project để hiển thị nhãn project trên thẻ task.
   * @param projectId Mã project của task.
   * @returns Tên project tương ứng, hoặc undefined nếu không tìm thấy trong danh sách project.
   */
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