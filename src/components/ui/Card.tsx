/**
 * File: components/ui/Card.tsx
 * Mục đích: Component khung nội dung dùng chung, tạo nền trắng/tối bo góc kèm viền cho các khối như thẻ thống kê, biểu đồ hay danh sách. Hỗ trợ tắt padding mặc định và bật hiệu ứng đổi viền khi hover.
 */

import React from 'react';
import { twMerge } from 'tailwind-merge';
import { CardProps } from '../../types';

/**
 * Render thẻ div bao ngoài nội dung, ghép class theo các tùy chọn hiển thị và truyền tiếp mọi prop DOM còn lại.
 * @param children Nội dung bên trong card.
 * @param className Class Tailwind bổ sung, được merge để ghi đè class mặc định.
 * @param noPadding Bật để bỏ padding mặc định, dùng khi nội dung tự quản lý khoảng cách.
 * @param hoverEffect Bật để đổi màu viền khi người dùng hover vào card.
 */
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
                !noPadding && "p-5",
                hoverEffect && "hover:border-slate-300 dark:hover:border-slate-600",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
