/**
 * File: Button.tsx
 * Trách nhiệm: Component nút tái sử dụng (primary/secondary/ghost/danger) với kích thước sm/md/lg.
 * Liên quan: types/props.ts (ButtonProps), Header.tsx và nhiều form/modal dùng nút primary.
 */

import React from 'react';
import { twMerge } from 'tailwind-merge';
import { ButtonProps } from '../../types';

/** Nút UI chuẩn của SabTask; variant primary luôn dùng chữ trắng */
export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className,
    icon,
    ...props
}) => {

    const baseStyles = "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

    const variants = {
        // Primary: nền đen / primary; chữ luôn trắng
        primary: "bg-black hover:bg-neutral-800 text-white dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-white focus:ring-neutral-500 dark:focus:ring-primary-500",

        // Secondary: nền sáng / tối; chữ luôn tương phản
        secondary: "bg-white dark:bg-dark-surface text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-white/5 focus:ring-slate-400 hover:border-slate-300",

        // Ghost: trong suốt
        ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:ring-slate-300",

        // Danger: đỏ nhạt
        danger: "bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:hover:bg-rose-900/30 dark:text-rose-300 focus:ring-rose-500 border border-transparent hover:border-rose-200",
    };

    const sizes = {
        sm: "h-8 px-3 text-xs gap-1.5",
        md: "h-10 px-4 text-sm gap-2",
        lg: "h-12 px-6 text-base gap-2.5",
    };

    return (
        <button
            className={twMerge(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {icon && <span className="flex-shrink-0 transition-transform group-hover:scale-105">{icon}</span>}
            {children}
        </button>
    );
};
