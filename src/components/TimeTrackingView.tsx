/**
 * File: TimeTrackingView.tsx
 * Trách nhiệm: Hiển thị lịch sử time entry và thống kê thời gian.
 * Liên quan: useTimeTracking.ts, types/models.ts (TimeEntry).
 */

import React from 'react';
import { TimeTrackingViewProps } from '../types';
import { Card } from './ui/Card';
import { Clock, PlayCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { formatDurationHoursMinutes, sumDurationLast7Days } from '../utils/timeAggregation';

/** View theo dõi thời gian làm việc và log entries */
export const TimeTrackingView: React.FC<TimeTrackingViewProps> = ({ timeEntries, tasks, projects }) => {
  const { state } = useApp();
  const { t } = state;
  
  // Stats
  const today = new Date().toISOString().split('T')[0];
  const entriesToday = timeEntries.filter(t => t.startTime.startsWith(today));
  
  const totalSecondsToday = entriesToday.reduce((acc, curr) => acc + curr.durationSeconds, 0);
  const totalSecondsThisWeek = sumDurationLast7Days(timeEntries);
  
  const formatDuration = formatDurationHoursMinutes;

  const getTaskTitle = (taskId: string) => tasks.find(t => t.id === taskId)?.title || 'Unknown Task';
  const getProjectName = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;
    return projects.find(p => p.id === task.projectId)?.name;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('time')}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('monitorProductivity')}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-indigo-500 to-primary-600 text-white border-none">
             <div className="flex items-center gap-3 mb-2 opacity-80">
                <Clock size={20} />
                <span className="font-semibold text-sm">{t('trackedToday')}</span>
             </div>
             <h3 className="text-4xl font-extrabold">{formatDuration(totalSecondsToday)}</h3>
          </Card>
          <Card>
             <div className="flex items-center gap-3 mb-2 text-slate-500">
                <PlayCircle size={20} />
                <span className="font-semibold text-sm">{t('sessions')}</span>
             </div>
             <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white">{entriesToday.length}</h3>
          </Card>
          <Card>
             <div className="flex items-center gap-3 mb-2 text-slate-500">
                <Calendar size={20} />
                <span className="font-semibold text-sm">{t('trackedThisWeek')}</span>
             </div>
             <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white">{formatDuration(totalSecondsThisWeek)}</h3>
          </Card>
      </div>

      <div>
         <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('recentActivity')}</h3>
         <div className="space-y-3">
            {timeEntries.map(entry => (
                <Card key={entry.id} noPadding className="p-4 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                         <Clock size={18} />
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-900 dark:text-white text-sm">{getTaskTitle(entry.taskId)}</h4>
                         <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-400">{format(new Date(entry.startTime), 'MMM d, h:mm a')}</span>
                            {getProjectName(entry.taskId) && (
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500">
                                   {getProjectName(entry.taskId)}
                                </span>
                            )}
                         </div>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="block font-mono font-bold text-primary-600 dark:text-primary-400">
                         {formatDuration(entry.durationSeconds)}
                      </span>
                      <span className="text-xs text-slate-400">{t('duration')}</span>
                   </div>
                </Card>
            ))}
            {timeEntries.length === 0 && (
                <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                    {t('noTimeEntries')}
                </div>
            )}
         </div>
      </div>
    </div>
  );
};
