/**
 * File: components/TaskListView.tsx
 * Mục đích: Hiển thị danh sách task dưới dạng bảng với các cột tiêu đề, project, người thực hiện,
 * trạng thái, hạn hoàn thành và mức ưu tiên. Cho phép lọc task qua FilterBar, bấm một dòng để mở
 * modal sửa task và bấm nút tròn đầu dòng để đánh dấu hoàn thành hoặc quay lại trạng thái cần làm.
 */

import React from 'react';
import { TaskListViewProps, TaskStatus, Priority } from '../types';
import { Calendar, CheckCircle2, Circle, Clock, MoreHorizontal, Folder } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { FilterBar } from './ui/FilterBar';
import { useApp } from '../context/AppContext';

/** Component bảng danh sách task: dựng thanh lọc, phần đầu bảng và từng dòng task. */
export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks, users, projects, filters, setFilters, onEditTask, onUpdateStatus 
}) => {
  const { state } = useApp();
  const { t } = state;
  
  /**
   * Chọn icon trạng thái để hiển thị ở đầu mỗi dòng task.
   * @param s Trạng thái hiện tại của task.
   * @returns Phần tử icon tương ứng với trạng thái đó.
   */
  const getStatusIcon = (s: TaskStatus) => {
      if (s === TaskStatus.DONE) return <CheckCircle2 size={20} className="text-emerald-500 fill-emerald-50 dark:fill-emerald-900/20" />;
      if (s === TaskStatus.IN_PROGRESS) return <Clock size={20} className="text-primary-500" />;
      return <Circle size={20} className="text-slate-300 dark:text-slate-600" />;
  };

  /**
   * Quy đổi trạng thái task sang biến thể màu của Badge trạng thái.
   * @param s Trạng thái hiện tại của task.
   * @returns Tên biến thể màu mà component Badge sử dụng.
   */
  const getStatusBadgeVariant = (s: TaskStatus) => {
      switch(s) {
          case TaskStatus.DONE: return 'success';
          case TaskStatus.IN_PROGRESS: return 'primary';
          case TaskStatus.REVIEW: return 'warning';
          default: return 'neutral';
      }
  };

  /**
   * Tra tên project để hiển thị ở cột project của bảng.
   * @param projectId Mã project của task.
   * @returns Tên project tương ứng, hoặc "Unknown Project" nếu không tìm thấy.
   */
  const getProjectName = (projectId: string) => {
      return projects?.find(p => p.id === projectId)?.name || 'Unknown Project';
  };

  return (
    <div className="animate-fade-in">
        <FilterBar filters={filters} setFilters={setFilters} users={users} />
        
        <Card noPadding className="overflow-hidden bg-white dark:bg-dark-surface shadow-soft border border-white/60 dark:border-white/5">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-700/50">
                        <tr>
                            <th className="px-6 py-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider w-14 text-center">#</th>
                            <th className="px-6 py-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('taskDetails')}</th>
                            {projects && <th className="px-6 py-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('projects')}</th>}
                            <th className="px-6 py-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('assignee')}</th>
                            <th className="px-6 py-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('status')}</th>
                            <th className="px-6 py-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('dueDate')}</th>
                            <th className="px-6 py-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('priority')}</th>
                            <th className="px-6 py-5 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {tasks.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                    {t('noTasksFound')}
                                </td>
                            </tr>
                        ) : (
                            tasks.map((task, idx) => {
                                const assignee = users.find(u => u.id === task.assigneeId);
                                return (
                                    <tr 
                                        key={task.id} 
                                        onClick={() => onEditTask(task)}
                                        className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4 text-center text-xs text-slate-400 font-mono">
                                            {idx + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onUpdateStatus(task.id, task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE);
                                                    }}
                                                    className="hover:scale-110 transition-transform focus:outline-none"
                                                >
                                                    {getStatusIcon(task.status)}
                                                </button>
                                                <div>
                                                    <span className={`font-semibold block text-sm ${task.status === TaskStatus.DONE ? 'line-through text-slate-400 dark:text-slate-500 decoration-slate-300' : 'text-slate-900 dark:text-white'}`}>
                                                        {task.title}
                                                    </span>
                                                    {task.subtasks && task.subtasks.length > 0 && (
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 block">
                                                            {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} {t('subtasks')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        {projects && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-brand dark:text-brand-bright text-sm font-medium">
                                                    <Folder size={14} />
                                                    <span className="truncate max-w-[150px]">{getProjectName(task.projectId)}</span>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            {assignee ? (
                                                <div className="flex items-center gap-2.5">
                                                    <img src={assignee.avatar} alt={assignee.name} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-700 shadow-sm object-cover" />
                                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{assignee.name}</span>
                                                </div>
                                            ) : <span className="text-sm text-slate-500 dark:text-slate-400 italic">{t('unassigned')}</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={getStatusBadgeVariant(task.status)}>
                                                {t(task.status as any)}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                                                <Calendar size={14} className={new Date(task.dueDate) < new Date() ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'} />
                                                <span className={new Date(task.dueDate) < new Date() ? 'text-rose-600 dark:text-rose-400' : ''}>
                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                task.priority === Priority.HIGH ? 'danger' : 
                                                task.priority === Priority.MEDIUM ? 'warning' : 'secondary'
                                            }>
                                                {t(task.priority as any)}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
  );
};
