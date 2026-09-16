/**
 * File: Card.tsx
 * Trách nhiệm: Component khung nội dung bo góc, hỗ trợ padding và hover.
 * Liên quan: types/props.ts (CardProps), Dashboard và các view dùng Card.
 */

import React from 'react';
import { twMerge } from 'tailwind-merge';
import { CardProps } from '../../types';

/** Khung card tái sử dụng với tùy chọn padding và hiệu ứng hover */
export const Card: React.FC<CardProps> = ({
    children,
    className,
    noPadding = false,
    hoverEffect = false,
    ...props
}) => {
    return (
        <div
            className={twMerge(
                "bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border transition-all duration-200",
                !noPadding && "p-5", // Reduced padding slightly for density
                hoverEffect && "hover:border-slate-300 dark:hover:border-slate-600",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
