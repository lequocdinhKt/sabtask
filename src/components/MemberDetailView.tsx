/**
 * File: components/MemberDetailView.tsx
 * Mục đích: Trang chi tiết của một thành viên, gồm hồ sơ cá nhân, thống kê hiệu suất (tổng task,
 * đã hoàn thành, đang làm, tỉ lệ hoàn thành) và danh sách task được giao có thể tìm kiếm/lọc.
 * View cũng cung cấp lối vào chỉnh sửa hoặc xoá thành viên.
 */

import React, { useState, useMemo } from 'react';
import { MemberDetailViewProps, TaskStatus, FilterState } from '../types';
import { ArrowLeft, Edit, Mail, Briefcase, CheckCircle2, Clock, Calendar, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { TaskListView } from './TaskListView';
import { useApp } from '../context/AppContext';

/** Component chính hiển thị hồ sơ, chỉ số hiệu suất và danh sách task của một thành viên. */
export const MemberDetailView: React.FC<MemberDetailViewProps> = ({
  member, tasks, projects, onBack, onEditMember, onDeleteMember, onEditTask, onUpdateTaskStatus 
}) => {
  const { state } = useApp();
  const { t } = state;
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    priority: 'ALL',
    assigneeId: 'ALL'
  });

  /**
   * useMemo lọc ra danh sách task hiển thị: chỉ giữ task được giao cho thành viên này, sau đó áp
   * thêm bộ lọc cục bộ theo từ khoá tìm kiếm (tiêu đề, mô tả) và theo mức độ ưu tiên.
   * Tính lại mỗi khi danh sách task, thành viên đang xem hoặc bộ lọc thay đổi.
   */
  const memberTasks = useMemo(() => {
    /** Điều kiện lọc cho từng task: đúng người được giao, khớp từ khoá và khớp mức ưu tiên. */
    return tasks.filter(t => {
        if (t.assigneeId !== member.id) return false;

        const searchMatch = 
          t.title.toLowerCase().includes(filters.search.toLowerCase()) || 
          t.description.toLowerCase().includes(filters.search.toLowerCase());
        
        if (!searchMatch) return false;

        if (filters.priority !== 'ALL' && t.priority !== filters.priority) return false;

        return true;
    });
  }, [tasks, member.id, filters]);
  
  /** Thống kê hiệu suất của thành viên: tổng task, số đã xong, số đang làm và tỉ lệ hoàn thành (%). */
  const allMemberTasks = tasks.filter(t => t.assigneeId === member.id);
  const totalTasks = allMemberTasks.length;
  const completedTasks = allMemberTasks.filter(t => t.status === TaskStatus.DONE).length;
  const inProgressTasks = allMemberTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  return (
    <div className="animate-fade-in pb-20">
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-semibold mb-4 transition-colors">
            <ArrowLeft size={16} /> {t('backToTeam')}
        </button>
        
        <div className="flex flex-col xl:flex-row gap-8">
            <div className="xl:w-[350px] space-y-6 flex-shrink-0">
                <Card className="flex flex-col items-center text-center p-8">
                    <div className="relative mb-4">
                        <img src={member.avatar} alt={member.name} className="w-32 h-32 rounded-[2rem] object-cover shadow-lg border-4 border-white dark:border-slate-800 bg-white" />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-white dark:border-slate-800 rounded-full flex items-center justify-center">
                            <CheckCircle2 size={16} className="text-white" />
                        </div>
                    </div>
                    
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{member.name}</h1>
                    <p className="text-primary-600 font-semibold mb-4">{member.jobRole || t('member')}</p>
                    
                    <div className="flex gap-2 mb-6">
                        <Badge variant={member.role === 'ADMIN' ? 'primary' : 'secondary'}>{t(member.role === 'ADMIN' ? 'admin' : 'member')}</Badge>
                        <Badge variant="neutral">ID: {member.id.substring(0,6)}</Badge>
                    </div>

                    <div className="flex gap-3 mb-6 w-full">
                        <Button variant="secondary" className="flex-1" onClick={() => onEditMember(member)} icon={<Edit size={16} />}>
                            {t('editProfile')}
                        </Button>
                        <Button variant="danger" className="flex-1" onClick={() => { if(window.confirm(t('confirmDelete'))) onDeleteMember(member.id); }} icon={<Trash2 size={16} />}>
                            {t('delete')}
                        </Button>
                    </div>

                    <div className="w-full space-y-3 text-left">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                                <Mail size={16} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">{t('emailAddress')}</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{member.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-500 flex items-center justify-center">
                                <Calendar size={16} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">{t('joined')}</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Oct 2023</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('performance')}</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm font-medium mb-1">
                                <span className="text-slate-600 dark:text-slate-300">{t('taskCompletion')}</span>
                                <span className="text-slate-900 dark:text-white">{completionRate}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{width: `${completionRate}%`}}></div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 pt-2">
                             <div className="p-3 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-800/30">
                                 <span className="text-2xl font-bold text-primary-600 block">{totalTasks}</span>
                                 <span className="text-xs text-primary-500 font-semibold uppercase">{t('totalAssigned')}</span>
                             </div>
                             <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                                 <span className="text-2xl font-bold text-emerald-600 block">{completedTasks}</span>
                                 <span className="text-xs text-emerald-500 font-semibold uppercase">{t('completedCount')}</span>
                             </div>
                             <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800/30">
                                 <span className="text-2xl font-bold text-amber-600 block">{inProgressTasks}</span>
                                 <span className="text-xs text-amber-500 font-semibold uppercase">{t('IN_PROGRESS')}</span>
                             </div>
                             <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                 <span className="text-2xl font-bold text-slate-600 dark:text-slate-400 block">{totalTasks - (completedTasks + inProgressTasks)}</span>
                                 <span className="text-xs text-slate-400 font-semibold uppercase">{t('pending')}</span>
                             </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="flex-1 space-y-6 min-w-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="flex items-center gap-4 bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-none">
                         <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                            <Briefcase size={24} />
                         </div>
                         <div>
                            <p className="text-indigo-100 text-sm font-medium">{t('activeProjects')}</p>
                            <h3 className="text-3xl font-bold">
                                {projects.filter(p => p.members.includes(member.id)).length}
                            </h3>
                         </div>
                    </Card>
                    <Card className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center">
                            <Clock size={24} />
                         </div>
                         <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('avgCompletionTime')}</p>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">2.4<span className="text-lg text-slate-400 font-normal ml-1">{t('days')}</span></h3>
                         </div>
                    </Card>
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-soft border border-slate-100 dark:border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('assignedTasks')}</h3>
                        <Badge variant="neutral">{memberTasks.length} {t('tasks')}</Badge>
                    </div>
                    <div className="p-4">
                        <TaskListView 
                            tasks={memberTasks} 
                            users={[member]}
                            projects={projects}
                            filters={filters}
                            setFilters={setFilters} 
                            onEditTask={onEditTask}
                            onUpdateStatus={onUpdateTaskStatus}
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
