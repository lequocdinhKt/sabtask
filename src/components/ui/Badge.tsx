/**
 * File: Badge.tsx
 * Trách nhiệm: Nhãn nhỏ hiển thị trạng thái/mức độ (primary, success, danger, ...).
 * Liên quan: types/props.ts (BadgeProps), KanbanBoard, TaskListView.
 */

import React from 'react';
import { twMerge } from 'tailwind-merge';
import { BadgeProps } from '../../types';

/** Nhãn badge với variant màu tương ứng */
export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className }) => {
    const variants = {
        primary: 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-500/10 dark:text-primary-400 dark:border-primary-800',
        secondary: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-800',
        warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-800',
        danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-800',
        neutral: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    };

    return (
        <span className={twMerge(
            "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide border",
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
};
