/**
 * File: components/TeamView.tsx
 * Mục đích: Hiển thị danh sách thành viên của nhóm dưới dạng lưới card, kèm thống kê số task được
 * giao và số task đã hoàn thành của từng người. Nếu người đang đăng nhập có vai trò ADMIN thì view
 * hiện thêm các hành động thêm, sửa, xoá thành viên (chỉ là guard phía client, RLS mới là lớp bảo mật chính).
 */

import React from 'react';
import { TeamViewProps, TaskStatus } from '../types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Mail, Briefcase, CheckCircle2, Plus, Trash2, Edit } from 'lucide-react';
import { useApp } from '../context/AppContext';

/** Component chính của trang Team: render lưới card thành viên và các nút quản trị dành cho ADMIN. */
export const TeamView: React.FC<TeamViewProps> = ({
  currentUser, users, tasks, onAddMember, onEditMember, onDeleteMember, onMemberClick
}) => {
  const { state } = useApp();
  const { t } = state;
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('team')}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('manageTeam')}</p>
         </div>
         {isAdmin && (
            <Button onClick={onAddMember} icon={<Plus size={18}/>}>
               {t('addMember')}
            </Button>
         )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map(user => {
          /** Tổng hợp số task được giao, số task đã xong và đang làm của một thành viên để hiển thị trên card. */
          const userTasks = tasks.filter(t => t.assigneeId === user.id);
          const completed = userTasks.filter(t => t.status === TaskStatus.DONE).length;
          const inProgress = userTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
          const isMe = user.id === currentUser.id;
          
          return (
            <Card 
                key={user.id} 
                className="flex flex-col gap-4 group hover:border-primary-200 dark:hover:border-primary-800 transition-colors cursor-pointer"
                onClick={() => onMemberClick(user)}
            >
               <div className="flex items-start justify-between">
                  <div className="relative">
                     <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-3xl object-cover border-2 border-white dark:border-slate-700 shadow-md group-hover:scale-105 transition-transform duration-300 bg-white" />
                     <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                  </div>
                  <Badge variant={user.role === 'ADMIN' ? 'primary' : 'secondary'}>{t(user.role === 'ADMIN' ? 'admin' : 'member')}</Badge>
               </div>
               
               <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors flex items-center gap-2">
                      {user.name} 
                      {isMe && <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">({t('you')})</span>}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mb-1">{user.jobRole || t('member')}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                     <Mail size={14} />
                     <span className="truncate">{user.email}</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl">
                     <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        <Briefcase size={12} /> {t('assigned')}
                     </div>
                     <span className="text-lg font-bold text-slate-900 dark:text-white">{userTasks.length}</span>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-2xl">
                     <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-1">
                        <CheckCircle2 size={12} /> {t('done')}
                     </div>
                     <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{completed}</span>
                  </div>
               </div>

               <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-primary-500 rounded-full" 
                        style={{ width: `${userTasks.length > 0 ? (inProgress / userTasks.length) * 100 : 0}%` }}
                     ></div>
                  </div>
                  <span className="text-xs font-bold text-primary-600">{inProgress} {t('active')}</span>
               </div>

               {isAdmin && !isMe && (
                   <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto" onClick={e => e.stopPropagation()}>
                       <button 
                           onClick={() => onEditMember(user)} 
                           className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors"
                       >
                           <Edit size={14} /> {t('edit')}
                       </button>
                       <button 
                           onClick={() => {
                               /** Hỏi xác nhận rồi mới yêu cầu xoá thành viên khỏi hệ thống. */
                               if (window.confirm(t('confirmDelete'))) {
                                   onDeleteMember(user.id);
                               }
                           }} 
                           className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 transition-colors"
                       >
                           <Trash2 size={14} /> {t('remove')}
                       </button>
                   </div>
               )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
