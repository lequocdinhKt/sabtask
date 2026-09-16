/**
 * File: components/projects-view/ProjectCardProgress.tsx
 * Mục đích: Hiển thị thanh tiến độ và phần trăm hoàn thành của một dự án trên thẻ dự án,
 * đổi sang màu xanh khi dự án đã hoàn thành 100%.
 */

import React from 'react';
import { ProjectCardProgressProps } from '../../types';

/** Component thanh tiến độ hiển thị phần trăm hoàn thành của dự án. */
export const ProjectCardProgress: React.FC<ProjectCardProgressProps> = ({ progress }) => {
    return (
        <div>
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
                <span>Progress</span>
                <span>{progress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                        progress === 100 ? 'bg-emerald-500' : 'bg-primary-500'
                    }`} 
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};
