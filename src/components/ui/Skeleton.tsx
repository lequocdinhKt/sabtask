/**
 * File: components/ui/Skeleton.tsx
 * Mục đích: Component placeholder nhấp nháy dùng khi dữ liệu đang tải, thay cho nội dung thật. Hỗ trợ ba hình dạng (khối chữ nhật, hình tròn, dòng chữ) và có thể lặp lại nhiều khối cùng lúc.
 */

import React from 'react';
import { twMerge } from 'tailwind-merge';
import { SkeletonProps } from '../../types';

/**
 * Render một hoặc nhiều khối skeleton giống nhau bên trong fragment.
 * @param className Class Tailwind bổ sung để quy định kích thước cụ thể của khối.
 * @param count Số khối skeleton cần render, mặc định là 1.
 * @param variant Hình dạng khối skeleton, mặc định là 'rect'.
 */
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
