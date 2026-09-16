/**
 * File: components/layout/Header.tsx
 * Mục đích: Thanh header cố định phía trên của ứng dụng SabTask. File này ghép các
 * widget con của header (đồng hồ, timer đang chạy, ô tìm kiếm, chọn ngôn ngữ, theme,
 * thông báo, nút bật/tắt sidebar) và nút tạo task mới thành một bố cục duy nhất.
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';

import { HeaderClock } from './header/HeaderClock';
import { HeaderSearch } from './header/HeaderSearch';
import { HeaderTimer } from './header/HeaderTimer';
import { HeaderLanguage } from './header/HeaderLanguage';
import { HeaderControls, SidebarToggle } from './header/HeaderControls';

/** Component header chính: sắp xếp các widget con và nút mở modal tạo task mới. */
export const Header: React.FC = () => {
    const { state, actions } = useApp();
    const { t } = state;

    return (
        <header className="h-16 px-4 md:px-6 xl:px-8 flex items-center justify-between sticky top-0 z-30 bg-white dark:bg-dark-surface border-b border-slate-200 dark:border-dark-border transition-all">
            <div className="flex items-center gap-4">
                <SidebarToggle />
                <HeaderClock />
            </div>

            <div className="flex items-center gap-3 md:gap-4">
                <HeaderTimer />
                <HeaderSearch />

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

                <HeaderLanguage />
                <HeaderControls />

                <Button onClick={() => actions.openNewTaskModal()} className="hidden md:flex" icon={<Plus size={16} />}>
                    {t('newTask')}
                </Button>
            </div>
        </header>
    );
};
