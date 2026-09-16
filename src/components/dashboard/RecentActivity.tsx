/**
 * File: RecentActivity.tsx
 * Trách nhiệm: Danh sách task hoạt động gần đây trên dashboard.
 * Liên quan: Dashboard.tsx, types/props.ts (RecentActivityProps).
 */

import React from 'react';
import { RecentActivityProps, Priority } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TrendingUp, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

/** Widget hiển thị các task cập nhật gần đây */
export const RecentActivity: React.FC<RecentActivityProps> = ({ tasks, onViewAll }) => {
  const { state } = useApp();
  const { t } = state;
  return (
    <Card noPadding className="overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('recentTasks')}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('latestUpdates')}</p>
        </div>
        <Button variant="ghost" size="sm" className="font-semibold" onClick={onViewAll}>{t('viewAll')}</Button>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {tasks.slice(0, 4).map(task => (
           <div key={task.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${task.priority === Priority.HIGH ? 'bg-rose-50 text-rose-500 dark:bg-rose-900/20 dark:text-rose-400' : 'bg-primary-50 text-primary-500 dark:bg-primary-900/20 dark:text-primary-400'}`}>
                    {task.priority === Priority.HIGH ? <TrendingUp size={24} /> : <CheckCircle2 size={24} />}
                 </div>
                 <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{task.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{new Date(task.dueDate).toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})}</p>
                 </div>
              </div>
              <Badge variant={
                  task.status === 'DONE' ? 'success' : 
                  task.status === 'IN_PROGRESS' ? 'primary' :
                  task.status === 'REVIEW' ? 'warning' : 'neutral'
              }>
                  {t(task.status as any)}
              </Badge>
           </div>
        ))}
        {tasks.length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">{t('noTasksFound')}</div>
        )}
      </div>
    </Card>
  );
};
