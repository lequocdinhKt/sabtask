/**
 * File: components/project-detail/ProjectStats.tsx
 * Mục đích: Hàng thống kê tổng quan của trang chi tiết dự án, gồm phần trăm tiến độ,
 * số task đã hoàn thành trên tổng số, số task đang thực hiện và avatar các thành viên dự án.
 */

import React from 'react';
import { ProjectStatsProps } from '../../types';
import { BarChart3, CheckCircle2, Clock } from 'lucide-react';

/** Component hiển thị các chỉ số tổng quan của dự án và danh sách avatar thành viên. */
export const ProjectStats: React.FC<ProjectStatsProps> = ({ progress, completed, total, inProgress, members }) => {
  return (
    <div className="flex items-center gap-8 mt-6 pb-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <BarChart3 size={24} />
           </div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{progress}%</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={24} />
           </div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{completed}/{total}</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
              <Clock size={24} />
           </div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Progress</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{inProgress}</p>
           </div>
        </div>

        <div className="flex -space-x-3 ml-4 pl-4 border-l border-slate-200 dark:border-slate-800">
            {members.map(m => (
                <img key={m.id} src={m.avatar} title={m.name} alt={m.name} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900" />
            ))}
            {members.length === 0 && <span className="text-sm text-slate-400 italic">No members assigned</span>}
        </div>
    </div>
  );
};
