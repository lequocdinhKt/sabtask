/**
 * File: components/ui/Button.tsx
 * Mục đích: Component nút dùng chung cho toàn bộ SabTask, chuẩn hoá 4 kiểu hiển thị (primary, secondary, ghost, danger) và 3 kích thước (sm, md, lg), có hỗ trợ icon đứng trước nội dung.
 */

import React from 'react';
import { twMerge } from 'tailwind-merge';
import { ButtonProps } from '../../types';

/**
 * Render thẻ button gốc với class ghép từ style nền, variant và size; mọi prop còn lại được truyền thẳng xuống thẻ button.
 * @param children Nội dung chữ của nút.
 * @param variant Kiểu hiển thị của nút, mặc định 'primary'.
 * @param size Kích thước chiều cao và padding của nút, mặc định 'md'.
 * @param className Class Tailwind bổ sung, được merge để ghi đè class mặc định.
 * @param icon Phần tử icon hiển thị bên trái nội dung nút.
 */
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
        primary: "bg-black hover:bg-neutral-800 text-white dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-white focus:ring-neutral-500 dark:focus:ring-primary-500",

        secondary: "bg-white dark:bg-dark-surface text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-white/5 focus:ring-slate-400 hover:border-slate-300",

        ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:ring-slate-300",

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
