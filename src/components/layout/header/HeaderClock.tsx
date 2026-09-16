/**
 * File: HeaderClock.tsx
 * Trách nhiệm: Hiển thị ngày giờ hiện tại theo locale ngôn ngữ.
 * Liên quan: useUIState (language), Header.tsx.
 */

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

/** Đồng hồ header cập nhật mỗi giây, format theo vi-VN hoặc en-US */
export const HeaderClock: React.FC = () => {
  const { state } = useApp();
  const [date, setDate] = useState(new Date());
  
  // Locale-aware date formatting
  const dateLocale = state.language === 'vi' ? 'vi-VN' : 'en-US';

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden sm:flex flex-col justify-center min-w-[140px] md:min-w-[180px]">
      <h1 className="text-sm md:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
        {/* Tablet/Mobile View */}
        <span className="xl:hidden">{date.toLocaleDateString(dateLocale, { weekday: 'short', day: 'numeric' })}</span>
        {/* Desktop View */}
        <span className="hidden xl:inline">{date.toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </h1>
      <div className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400">
          <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary-500" />
          <span>
            <span className="xl:hidden">{date.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="hidden xl:inline">{date.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </span>
      </div>
    </div>
  );
};
