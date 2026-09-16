/**
 * File: components/dashboard/ProductivityCard.tsx
 * Mục đích: Thẻ nổi bật nền tối trên Dashboard, hiển thị chỉ số năng suất đã được hook useDashboardData tính sẵn: nhãn mốc thời gian, số task hoàn thành trên tổng số và thanh tiến độ theo phần trăm.
 */

import React from 'react';
import { ProductivityCardProps } from '../../types';
import { TrendingUp, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

/**
 * Render thẻ năng suất; chỉ hiển thị dữ liệu nhận từ props, không tự tính toán.
 * @param stats Bộ số liệu năng suất gồm label, completed, total và percentage.
 */
export const ProductivityCard: React.FC<ProductivityCardProps> = ({ stats }) => {
  const { state } = useApp();
  const { t } = state;
  return (
    <div className="md:col-span-2 bg-black dark:bg-neutral-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all border border-neutral-800/50">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.08] rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:opacity-[0.12] transition-opacity duration-700"></div>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1 opacity-90">
                <TrendingUp size={16} />
                <p className="text-sm font-semibold tracking-wide uppercase">{t('productivity')}</p>
            </div>
            <h3 className="text-3xl font-extrabold mt-1 text-white">{stats.label}</h3>
            <p className="text-xs mt-1 font-medium text-neutral-200">{stats.completed} / {stats.total} {t('tasks')}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl shadow-inner border border-white/10">
             <Clock className="text-white" size={24} />
          </div>
        </div>
        <div className="mt-6">
           <div className="flex justify-between text-sm mb-2 font-medium opacity-90">
             <span className="text-neutral-200">{t('completionRate')}</span>
             <span className="text-white">{stats.percentage}%</span>
           </div>
           <div className="h-2.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
             <div 
               className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out" 
               style={{ width: `${stats.percentage}%` }}
             ></div>
           </div>
        </div>
      </div>
    </div>
  );
};