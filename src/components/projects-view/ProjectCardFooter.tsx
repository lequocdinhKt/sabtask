/**
 * File: components/projects-view/ProjectCardFooter.tsx
 * Mục đích: Phần chân của thẻ dự án, hiển thị avatar tối đa 4 thành viên (kèm chỉ báo số
 * thành viên còn lại) và tỉ lệ task đã hoàn thành trên tổng số task của dự án.
 */

import React from 'react';
import { ProjectCardFooterProps } from '../../types';
import { CheckCircle2 } from 'lucide-react';

/** Component chân thẻ dự án: hiển thị avatar thành viên và số task đã hoàn thành trên tổng số task. */
export const ProjectCardFooter: React.FC<ProjectCardFooterProps> = ({ members, completedTasks, totalTasks }) => {
    return (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex -space-x-2">
                {members.slice(0, 4).map(m => (
                    <img 
                        key={m.id} 
                        src={m.avatar} 
                        alt={m.name} 
                        title={m.name}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 object-cover" 
                    />
                ))}
                {members.length > 4 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        +{members.length - 4}
                    </div>
                )}
                {members.length === 0 && <span className="text-xs text-slate-400 italic mt-1.5">No members</span>}
            </div>
            
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg">
                <CheckCircle2 size={14} className={completedTasks === totalTasks && totalTasks > 0 ? 'text-emerald-500' : 'text-slate-400'} />
                <span className="text-slate-700 dark:text-slate-300">{completedTasks}/{totalTasks} Tasks</span>
            </div>
        </div>
    );
};
