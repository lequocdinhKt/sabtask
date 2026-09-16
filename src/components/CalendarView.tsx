/**
 * File: CalendarView.tsx
 * Trách nhiệm: Lịch task theo ngày/tuần/tháng với điều hướng thời gian.
 * Liên quan: date-fns, types/props.ts (CalendarViewProps), TaskModal.
 */

import React, { useState, useMemo } from 'react';
import { CalendarViewProps, Priority } from '../types';
import { ChevronLeft, ChevronRight, Search, Filter, Plus, Calendar as CalendarIcon, Users, Bell, MoreHorizontal, Clock } from 'lucide-react';
import { Button } from './ui/Button';
import { useApp } from '../context/AppContext';
import { 
  format, addMonths, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, 
  eachDayOfInterval, isSameMonth, isSameDay, addDays, isToday, addWeeks, subWeeks,
  startOfDay, setHours, getHours, getMinutes
} from 'date-fns';

/** View lịch hiển thị task theo ngày/tuần/tháng */
export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onEditTask }) => {
  const { state } = useApp();
  const { users } = state;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');

  // Navigation Handlers
  /** Lùi về kỳ trước theo chế độ xem hiện tại */
  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, -1));
  };
  
  /** Tiến tới kỳ sau theo chế độ xem hiện tại */
  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  /** Quay về ngày hôm nay */
  const handleToday = () => setCurrentDate(new Date());

  // Date Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const monthDays = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [currentDate]);

  const hours = Array.from({ length: 24 }, (_, i) => i); 

  // Helpers
  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => isSameDay(new Date(task.dueDate), date));
  };

  const getTasksForSlot = (day: Date, hour: number) => {
    return tasks.filter(task => {
        const d = new Date(task.dueDate);
        return isSameDay(d, day) && getHours(d) === hour;
    });
  };

  const getPriorityStyle = (p: Priority) => {
      switch(p) {
          case Priority.HIGH: return 'bg-rose-50 text-rose-700 border-rose-500 dark:bg-rose-900/30 dark:text-rose-200';
          case Priority.MEDIUM: return 'bg-amber-50 text-amber-700 border-amber-500 dark:bg-amber-900/30 dark:text-amber-200';
          default: return 'bg-slate-50 text-slate-700 border-slate-500 dark:bg-slate-800 dark:text-slate-300';
      }
  };

  const formatTimeShort = (dateString: string) => {
      const d = new Date(dateString);
      return format(d, 'HH:mm');
  };

  return (
    <div className="flex flex-col bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-slate-200 dark:border-white/5 font-sans h-full min-h-[600px]">
      
      {/* 1. Header Section */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-6 flex-shrink-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Calendar</h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage your schedule and upcoming deadlines</p>
              </div>
              <div className="flex items-center gap-3">
                   <div className="flex -space-x-2">
                      {users.slice(0,3).map(u => (
                          <img key={u.id} src={u.avatar} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 object-cover" />
                      ))}
                      {users.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold border-2 border-white dark:border-slate-800">
                            +{users.length - 3}
                        </div>
                      )}
                  </div>
                  <Button variant="secondary" size="sm" icon={<Users size={14}/>}>Invite</Button>
                  <Button icon={<Plus size={16}/>}>New Event</Button>
              </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
               {/* View Controls */}
               <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button 
                        onClick={() => setViewMode('month')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'month' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                        Month
                    </button>
                    <button 
                        onClick={() => setViewMode('week')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'week' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                        Week
                    </button>
                    <button 
                        onClick={() => setViewMode('day')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'day' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                        Day
                    </button>
               </div>

               {/* Date Navigation */}
               <div className="flex items-center gap-2">
                    <button onClick={handlePrev} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white min-w-[140px] text-center">
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <button onClick={handleNext} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                    <button onClick={handleToday} className="ml-2 px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        Today
                    </button>
               </div>
          </div>
      </div>

      {/* 2. Grid Views */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-slate-50 dark:bg-slate-900/50 rounded-b-xl relative">
          
          {/* MONTH VIEW */}
          {viewMode === 'month' && (
              <div className="grid grid-cols-7 min-w-[800px] h-full auto-rows-fr bg-white dark:bg-dark-surface border-l border-slate-200 dark:border-slate-800">
                  {/* Days Header */}
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="py-2 text-center text-xs font-bold text-slate-400 uppercase border-b border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20">
                          {day}
                      </div>
                  ))}
                  
                  {/* Calendar Grid */}
                  {monthDays.map((day, i) => {
                      const dayTasks = getTasksForDay(day);
                      const isCurrMonth = isSameMonth(day, currentDate);
                      return (
                          <div 
                              key={day.toISOString()} 
                              className={`
                                min-h-[100px] p-2 border-b border-r border-slate-200 dark:border-slate-800 flex flex-col gap-1 transition-colors
                                ${!isCurrMonth ? 'bg-slate-50/50 dark:bg-slate-900/30' : 'bg-white dark:bg-dark-surface'}
                                hover:bg-slate-50 dark:hover:bg-slate-800/10
                              `}
                              onClick={() => {/* Open day view or add task */}}
                          >
                              <div className="flex justify-between items-start mb-1">
                                  <span className={`
                                      text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                                      ${isToday(day) ? 'bg-primary-600 text-white' : isCurrMonth ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}
                                  `}>
                                      {format(day, 'd')}
                                  </span>
                                  {dayTasks.length > 0 && <span className="text-[10px] text-slate-400 font-medium">{dayTasks.length} tasks</span>}
                              </div>
                              
                              <div className="space-y-1 overflow-y-auto max-h-[100px] custom-scrollbar">
                                  {dayTasks.map(task => (
                                      <div 
                                          key={task.id}
                                          onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                                          className={`
                                              text-[10px] px-1.5 py-1 rounded border-l-2 cursor-pointer truncate font-medium hover:opacity-80 transition-opacity
                                              ${getPriorityStyle(task.priority)}
                                          `}
                                      >
                                          {formatTimeShort(task.dueDate)} {task.title}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      );
                  })}
              </div>
          )}

          {/* WEEK VIEW */}
          {viewMode === 'week' && (
              <div className="min-w-[800px] bg-white dark:bg-dark-surface relative">
                   <div className="grid grid-cols-[60px_1fr] sticky top-0 z-20 bg-white dark:bg-dark-surface border-b border-slate-200 dark:border-slate-800 shadow-sm">
                       <div className="p-4 border-r border-slate-200 dark:border-slate-800"></div>
                       <div className="grid grid-cols-7">
                           {weekDays.map(day => (
                               <div key={day.toISOString()} className={`px-2 py-3 text-center border-r border-slate-200 dark:border-slate-800 ${isToday(day) ? 'bg-primary-50/10' : ''}`}>
                                   <p className="text-xs font-bold text-slate-400 uppercase mb-1">{format(day, 'EEE')}</p>
                                   <div className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm font-bold ${isToday(day) ? 'bg-primary-600 text-white' : 'text-slate-900 dark:text-white'}`}>
                                       {format(day, 'd')}
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
                   
                   <div className="grid grid-cols-[60px_1fr]">
                       {/* Time Labels */}
                       <div className="border-r border-slate-200 dark:border-slate-800">
                           {hours.map(hour => (
                               <div key={hour} className="h-20 border-b border-slate-100 dark:border-slate-800/50 flex items-start justify-center pt-2">
                                   <span className="text-xs font-medium text-slate-400">{hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}</span>
                               </div>
                           ))}
                       </div>
                       
                       {/* Week Grid Body */}
                       <div className="grid grid-cols-7 relative">
                           {/* Render Horizontal Guidelines */}
                           {hours.map(hour => (
                               <div key={`guide-${hour}`} className="absolute w-full border-b border-slate-100 dark:border-slate-800/50 h-20 pointer-events-none" style={{ top: hour * 80 }} />
                           ))}

                           {weekDays.map(day => (
                               <div key={day.toISOString()} className="relative h-[1920px] border-r border-slate-100 dark:border-slate-800/50">
                                   {/* Tasks for this day */}
                                   {getTasksForDay(day).map(task => {
                                       const taskDate = new Date(task.dueDate);
                                       const startHour = getHours(taskDate);
                                       const startMin = getMinutes(taskDate);
                                       const top = (startHour * 80) + ((startMin / 60) * 80);
                                       
                                       return (
                                           <div 
                                                key={task.id}
                                                onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                                                className={`absolute left-1 right-1 p-2 rounded-md border-l-2 text-xs cursor-pointer hover:z-10 hover:scale-[1.02] shadow-sm transition-all ${getPriorityStyle(task.priority)}`}
                                                style={{ top: `${top}px`, height: '70px' }} // Fixed height for simplicity in this demo
                                           >
                                                <div className="font-bold truncate">{task.title}</div>
                                                <div className="opacity-80 flex items-center gap-1 mt-0.5">
                                                    <Clock size={10} /> {format(taskDate, 'h:mm a')}
                                                </div>
                                           </div>
                                       )
                                   })}
                                   
                                   {/* Current Time Indicator */}
                                   {isToday(day) && (
                                       <div 
                                          className="absolute w-full border-t-2 border-rose-500 z-10 pointer-events-none flex items-center"
                                          style={{ top: `${(new Date().getHours() * 80) + ((new Date().getMinutes() / 60) * 80)}px` }}
                                       >
                                           <div className="w-2 h-2 rounded-full bg-rose-500 -ml-1"></div>
                                       </div>
                                   )}
                               </div>
                           ))}
                       </div>
                   </div>
              </div>
          )}

           {/* DAY VIEW (Simple Reuse of Week Structure Logic) */}
           {viewMode === 'day' && (
               <div className="min-w-full bg-white dark:bg-dark-surface relative">
                   <div className="grid grid-cols-[60px_1fr]">
                       <div className="border-r border-slate-200 dark:border-slate-800">
                           {hours.map(hour => (
                               <div key={hour} className="h-24 border-b border-slate-100 dark:border-slate-800/50 flex items-start justify-center pt-2">
                                   <span className="text-xs font-medium text-slate-400">{hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}</span>
                               </div>
                           ))}
                       </div>
                       <div className="relative h-[2304px]"> 
                            {hours.map(hour => (
                               <div key={`guide-${hour}`} className="absolute w-full border-b border-slate-100 dark:border-slate-800/50 h-24 pointer-events-none" style={{ top: hour * 96 }} />
                           ))}
                           {getTasksForDay(currentDate).map(task => {
                               const taskDate = new Date(task.dueDate);
                               const startHour = getHours(taskDate);
                               const startMin = getMinutes(taskDate);
                               const top = (startHour * 96) + ((startMin / 60) * 96);
                               
                               return (
                                   <div 
                                        key={task.id}
                                        onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                                        className={`absolute left-2 right-2 p-3 rounded-lg border-l-4 text-sm cursor-pointer hover:shadow-md transition-all ${getPriorityStyle(task.priority)}`}
                                        style={{ top: `${top}px`, height: '80px' }}
                                   >
                                        <div className="font-bold flex justify-between">
                                            <span>{task.title}</span>
                                            <span className="opacity-70">{format(taskDate, 'h:mm a')}</span>
                                        </div>
                                        <div className="opacity-80 mt-1 line-clamp-2">{task.description}</div>
                                   </div>
                               )
                           })}
                           {/* Current Time */}
                           {isToday(currentDate) && (
                               <div 
                                  className="absolute w-full border-t-2 border-rose-500 z-10 pointer-events-none"
                                  style={{ top: `${(new Date().getHours() * 96) + ((new Date().getMinutes() / 60) * 96)}px` }}
                               >
                                   <div className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-rose-500"></div>
                               </div>
                           )}
                       </div>
                   </div>
               </div>
           )}
      </div>
    </div>
  );
};
