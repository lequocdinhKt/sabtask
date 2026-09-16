/**
 * File: TaskTrendChart.tsx
 * Trách nhiệm: Biểu đồ xu hướng task tạo/đến hạn theo tuần hoặc tháng.
 * Liên quan: useDashboardData.ts, recharts, constants.ts (CHART_COLORS).
 */

import React, { useState } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { TaskTrendChartProps } from '../../types';
import { Card } from '../ui/Card';
import { CHART_COLORS } from '../../constants';
import { useApp } from '../../context/AppContext';
import { 
  BarChart2, LineChart as LineChartIcon, Activity, 
} from 'lucide-react';

/** Biểu đồ trend task với toggle weekly/monthly và loại chart */
export const TaskTrendChart: React.FC<TaskTrendChartProps> = ({ data, timeRange, onRangeChange }) => {
  const { state } = useApp();
  const { t, darkMode } = state;
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');
  const [metric, setMetric] = useState<'created' | 'due' | 'comparison'>('created');

  const tickFill = darkMode ? '#CBD5E1' : '#475569';
  const legendColor = darkMode ? '#E2E8F0' : '#334155';
  const gridStroke = darkMode ? '#334155' : '#E2E8F0';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
               <span className="text-sm font-bold text-slate-900 dark:text-white">
                 {entry.name === 'created' ? t('created') : t('due')}: {entry.value}
               </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: data,
      margin: { top: 10, right: 10, left: -20, bottom: 0 }
    };

    const axisTick = { fill: tickFill, fontSize: 11 };
    const legendStyle = { color: legendColor };

    switch(chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} opacity={0.5} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={axisTick} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={axisTick} />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0,0,0,0.05)'}} />
            <Legend iconType="circle" wrapperStyle={legendStyle} />
            {(metric === 'created' || metric === 'comparison') && (
              <Bar dataKey="created" name="Created" fill={CHART_COLORS.purple} radius={[4, 4, 0, 0]} barSize={20} />
            )}
            {(metric === 'due' || metric === 'comparison') && (
              <Bar dataKey="due" name="Due" fill={CHART_COLORS.orange} radius={[4, 4, 0, 0]} barSize={20} />
            )}
          </BarChart>
        );
      case 'line':
        return (
           <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} opacity={0.5} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={axisTick} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={axisTick} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={legendStyle} />
            {(metric === 'created' || metric === 'comparison') && (
              <Line type="monotone" dataKey="created" name="Created" stroke={CHART_COLORS.purple} strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
            )}
            {(metric === 'due' || metric === 'comparison') && (
              <Line type="monotone" dataKey="due" name="Due" stroke={CHART_COLORS.orange} strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
            )}
          </LineChart>
        );
      case 'area':
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.purple} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={CHART_COLORS.purple} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.orange} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={CHART_COLORS.orange} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} opacity={0.5} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={axisTick} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={axisTick} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={legendStyle} />
            {(metric === 'created' || metric === 'comparison') && (
              <Area type="monotone" dataKey="created" name="Created" stroke={CHART_COLORS.purple} fillOpacity={1} fill="url(#colorCreated)" strokeWidth={3} />
            )}
            {(metric === 'due' || metric === 'comparison') && (
              <Area type="monotone" dataKey="due" name="Due" stroke={CHART_COLORS.orange} fillOpacity={1} fill="url(#colorDue)" strokeWidth={3} />
            )}
          </AreaChart>
        );
    }
  };

  const inactiveBtn = 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200';
  const activeBtn = 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm';
  const activeIconBtn = 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-sm';

  return (
    <Card className="lg:col-span-2" hoverEffect>
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <div>
           <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('taskCreation')}</h3>
           <p className="text-sm text-slate-600 dark:text-slate-300">{t('newTasksOverTime')}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
           <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
              <button onClick={() => setChartType('area')} className={`p-1.5 rounded-lg transition-all ${chartType === 'area' ? activeIconBtn : inactiveBtn}`} title={t('areaChart')}>
                 <Activity size={16} />
              </button>
              <button onClick={() => setChartType('bar')} className={`p-1.5 rounded-lg transition-all ${chartType === 'bar' ? activeIconBtn : inactiveBtn}`} title={t('barChart')}>
                 <BarChart2 size={16} />
              </button>
              <button onClick={() => setChartType('line')} className={`p-1.5 rounded-lg transition-all ${chartType === 'line' ? activeIconBtn : inactiveBtn}`} title={t('lineChart')}>
                 <LineChartIcon size={16} />
              </button>
           </div>

           <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
             <button onClick={() => setMetric('created')} className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${metric === 'created' ? activeBtn : inactiveBtn}`}>
                {t('created')}
             </button>
             <button onClick={() => setMetric('due')} className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${metric === 'due' ? activeBtn : inactiveBtn}`}>
                {t('due')}
             </button>
             <button onClick={() => setMetric('comparison')} className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${metric === 'comparison' ? activeBtn : inactiveBtn}`}>
                {t('comparison')}
             </button>
           </div>

           <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
              <button onClick={() => onRangeChange('weekly')} className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${timeRange === 'weekly' ? activeBtn : inactiveBtn}`}>
                 {t('weekly')}
              </button>
              <button onClick={() => onRangeChange('monthly')} className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${timeRange === 'monthly' ? activeBtn : inactiveBtn}`}>
                 {t('monthly')}
              </button>
           </div>
        </div>
      </div>
      
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
           {renderChart()}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
