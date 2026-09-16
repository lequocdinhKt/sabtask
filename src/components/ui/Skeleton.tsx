/**
 * File: Skeleton.tsx
 * Trách nhiệm: Placeholder loading dạng xương (rect/circle/text).
 * Liên quan: types/props.ts (SkeletonProps), Dashboard.tsx.
 */

import React from 'react';
import { twMerge } from 'tailwind-merge';
import { SkeletonProps } from '../../types';

/** Skeleton loading với số lượng và kiểu hình dạng tùy chọn */
export const Skeleton: React.FC<SkeletonProps> = ({ className, count = 1, variant = 'rect' }) => {
    const baseStyles = "animate-pulse bg-slate-200 dark:bg-slate-700/50";

    const variantStyles = {
        rect: "rounded-xl",
        circle: "rounded-full",
        text: "rounded h-4"
    };

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={twMerge(baseStyles, variantStyles[variant], className)}
                />
            ))}
        </>
    );
};
