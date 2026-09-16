/**
 * File: FilterBar.tsx
 * Trách nhiệm: Thanh lọc task theo tìm kiếm, ưu tiên và người phụ trách.
 * Liên quan: types/props.ts (FilterBarProps), KanbanBoard, TaskListView.
 */

import React from 'react';
import { FilterBarProps, Priority } from '../../types';
import { Search, Filter, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

/** Thanh bộ lọc task với search, priority và assignee */
export const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, users }) => {
    const { state } = useApp();
    const { t } = state;
    const hasActiveFilters = filters.priority !== 'ALL' || filters.assigneeId !== 'ALL' || filters.search !== '';

    /** Đặt lại tất cả bộ lọc về mặc định */
    const clearFilters = () => {
        setFilters({ search: '', priority: 'ALL', assigneeId: 'ALL' });
    };

    return (
        <div className="flex flex-col md:flex-row gap-3 mb-6 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">

            {/* Search Input */}
            <div className="flex items-center flex-1 bg-slate-50 dark:bg-slate-900 rounded-xl px-3 py-2 border border-transparent focus-within:border-primary-500/50 focus-within:ring-2 focus-within:ring-primary-500/10 transition-all">
                <Search size={16} className="text-slate-500 dark:text-slate-400 mr-2" />
                <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder={t('filterPlaceholder')}
                    className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
                />
                {filters.search && (
                    <button onClick={() => setFilters({ ...filters, search: '' })} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"><X size={14} /></button>
                )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                {/* Priority Filter */}
                <div className="relative group min-w-[120px]">
                    <Filter size={14} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                    <select
                        value={filters.priority}
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value as any })}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500/10 cursor-pointer appearance-none hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <option value="ALL">{t('allPriorities')}</option>
                        {Object.values(Priority).map(p => <option key={p} value={p}>{t(p as any)}</option>)}
                    </select>
                </div>

                {/* Assignee Filter */}
                <div className="relative group min-w-[140px]">
                    <select
                        value={filters.assigneeId}
                        onChange={(e) => setFilters({ ...filters, assigneeId: e.target.value })}
                        className="w-full pl-3 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500/10 cursor-pointer appearance-none hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <option value="ALL">{t('allMembers')}</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>

                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors whitespace-nowrap"
                    >
                        {t('clearFilters')}
                    </button>
                )}
            </div>
        </div>
    );
};
