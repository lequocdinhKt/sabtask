/**
 * File: Dashboard.tsx
 * Trách nhiệm: Trang tổng quan — thống kê, biểu đồ, hoạt động gần đây.
 * Liên quan: useDashboardData.ts, dashboard/* sub-components.
 */

import React from 'react';
import { DashboardProps } from '../types';
import { useDashboardData } from '../hooks/useDashboardData';
import { useApp } from '../context/AppContext';

// Sub Components
import { DashboardStats } from './dashboard/DashboardStats';
import { ProductivityCard } from './dashboard/ProductivityCard';
import { TaskTrendChart } from './dashboard/TaskTrendChart';
import { StatusDonutChart } from './dashboard/StatusDonutChart';
import { RecentActivity } from './dashboard/RecentActivity';
import { Skeleton } from './ui/Skeleton';

/** View dashboard chính với stats, charts và recent activity */
export const Dashboard: React.FC<DashboardProps> = ({ tasks, projects, onNavigate }) => {
  const { state } = useApp();
  const { t, isLoading } = state;
  const { 
    timeRange, 
    setTimeRange, 
    statusData, 
    chartData, 
    productivityStats, 
    completedCount 
  } = useDashboardData(tasks);

  if (isLoading) {
      return (
        <div className="space-y-8 pb-10">
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32 md:col-span-2" />
            </div>
            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Skeleton className="h-[400px] lg:col-span-2" />
                <Skeleton className="h-[400px]" />
            </div>
            {/* Activity Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-20 mb-3" count={3} />
            </div>
        </div>
      )
  }

  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStats 
          projectsCount={projects.length}
          completedTasksCount={completedCount}
          onNavigateProjects={() => onNavigate && onNavigate('projects')}
        />
        <ProductivityCard stats={productivityStats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <TaskTrendChart 
          data={chartData} 
          timeRange={timeRange} 
          onRangeChange={setTimeRange} 
        />
        <StatusDonutChart 
          data={statusData} 
          totalTasks={tasks.length} 
        />
      </div>

      <RecentActivity 
        tasks={tasks} 
        onViewAll={() => onNavigate && onNavigate('list')}
      />
    </div>
  );
};
