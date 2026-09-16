/**
 * File: ProjectCardProgress.tsx
 * Trách nhiệm: Thanh tiến độ % trên thẻ project.
 * Liên quan: ProjectsView.tsx.
 */

import React from 'react';
import { ProjectCardProgressProps } from '../../types';

/** Thanh progress bar hiển thị % hoàn thành project */
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
