/**
 * File: DashboardStats.tsx
 * Trách nhiệm: Thẻ thống kê số project và task hoàn thành trên dashboard.
 * Liên quan: Dashboard.tsx, types/props.ts (DashboardStatsProps).
 */

import React from 'react';
import { DashboardStatsProps } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { FolderKanban, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

/** Thẻ stats project count và completed tasks */
export const DashboardStats: React.FC<DashboardStatsProps> = ({ projectsCount, completedTasksCount, onNavigateProjects }) => {
  const { state } = useApp();
  const { t } = state;
  return (
    <>
        <Card 
          onClick={onNavigateProjects}
          className="relative overflow-hidden group hover:border-primary-200 dark:hover:border-primary-800 transition-colors cursor-pointer"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <FolderKanban size={100} />
          </div>
          <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <FolderKanban size={20} />
             </div>
             <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">{t('projectsCount')}</p>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{projectsCount}</h3>
            <Badge variant="success" className="gap-1 shadow-sm"><ArrowUpRight size={12} /> {t('active')}</Badge>
          </div>
        </Card>

        <Card className="relative overflow-hidden group hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <CheckCircle2 size={100} />
          </div>
          <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                <CheckCircle2 size={20} />
             </div>
             <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">{t('completedCount')}</p>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{completedTasksCount}</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('tasks')}</span>
          </div>
        </Card>
    </>
  );
};
