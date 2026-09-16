/**
 * File: components/dashboard/StatusDonutChart.tsx
 * Mục đích: Biểu đồ donut (recharts) thể hiện tỷ lệ task theo từng trạng thái trên Dashboard. Hiển thị tổng số task ở giữa vòng tròn và phần chú giải kèm phần trăm bên dưới; màu sắc và tooltip đổi theo chế độ sáng/tối.
 */

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { StatusDonutChartProps } from '../../types';
import { Card } from '../ui/Card';
import { useApp } from '../../context/AppContext';

/**
 * Render donut chart trạng thái task và phần chú giải phần trăm tương ứng.
 * @param data Mảng dữ liệu từng trạng thái, mỗi phần tử gồm name, value và color.
 * @param totalTasks Tổng số task, dùng làm số hiển thị ở tâm biểu đồ và mẫu số tính phần trăm.
 */
export const StatusDonutChart: React.FC<StatusDonutChartProps> = ({ data, totalTasks }) => {
  const { state } = useApp();
  const { t, darkMode } = state;

  return (
    <Card>
      <div className="flex justify-between items-start mb-6">
        <div>
           <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('statusOverview')}</h3>
           <p className="text-sm text-slate-600 dark:text-slate-300">{t('realTimeStats')}</p>
        </div>
      </div>
      
      <div className="h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={6}
              dataKey="value"
              cornerRadius={8}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
               contentStyle={{
                 backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                 borderRadius: '12px',
                 border: 'none',
                 boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                 color: darkMode ? '#F1F5F9' : '#0F172A',
               }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{totalTasks}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mt-1">{t('totalTasks')}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
            <div className="flex flex-col">
               <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.name}</span>
               <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                 {totalTasks > 0 ? Math.round((item.value / totalTasks) * 100) : 0}%
               </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
