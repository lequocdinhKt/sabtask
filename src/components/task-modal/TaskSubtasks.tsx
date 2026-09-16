/**
 * File: components/task-modal/TaskSubtasks.tsx
 * Mục đích: Nội dung tab "Subtasks" trong modal task, hiển thị checklist các công việc con.
 * Cho phép thêm subtask mới, tích/bỏ tích hoàn thành, sửa tiêu đề trực tiếp, chọn người thực hiện
 * cho từng subtask và xóa subtask; mọi thay đổi được gửi lên modal cha qua các callback.
 */

import React from 'react';
import { TaskSubtasksProps } from '../../types';
import { Plus, CheckSquare, Trash2, User as UserIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

/**
 * Component danh sách subtask: hiển thị trạng thái rỗng khi chưa có subtask nào, ngược lại
 * render từng dòng subtask kèm các điều khiển tích hoàn thành, sửa tên, gán người và xóa.
 */
export const TaskSubtasks: React.FC<TaskSubtasksProps> = ({
  subtasks, users, onAdd, onUpdate, onDelete
}) => {
  const { state } = useApp();
  const { t } = state;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
       <div className="flex items-center justify-between mb-2">
         <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('checklist')}</h3>
         <button onClick={onAdd} className="text-xs flex items-center gap-1 text-primary-600 hover:bg-primary-50 px-2 py-1 rounded transition-colors">
           <Plus size={14} /> {t('addItem')}
         </button>
       </div>
       
       {subtasks.length === 0 && (
         <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm italic border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl">
           {t('newItemPlaceholder')}
         </div>
       )}

       <div className="space-y-2">
         {subtasks.map((st) => {
           const assignedUser = users.find(u => u.id === st.assigneeId);
           
           return (
             <div key={st.id} className="flex items-center gap-3 p-2 group hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
               <button 
                 onClick={() => onUpdate(st.id, { completed: !st.completed })}
                 className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${st.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-500'}`}
               >
                 {st.completed && <CheckSquare size={14} />}
               </button>
               <input 
                 type="text" 
                 value={st.title}
                 onChange={e => onUpdate(st.id, { title: e.target.value })}
                 className={`flex-1 bg-transparent border-none outline-none text-sm ${st.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}
               />
               
               <div className="relative group/assignee">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${assignedUser ? 'border-primary-200' : 'border-dashed border-slate-300 dark:border-slate-600'} overflow-hidden bg-white dark:bg-slate-800 cursor-pointer`}>
                      {assignedUser ? (
                        <img src={assignedUser.avatar} alt={assignedUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={14} className="text-slate-400" />
                      )}
                  </div>
                  <select 
                    value={st.assigneeId || ''}
                    onChange={(e) => onUpdate(st.id, { assigneeId: e.target.value || undefined })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    <option value="">{t('unassigned')}</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
               </div>

               <button onClick={() => onDelete(st.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                 <Trash2 size={16} />
               </button>
             </div>
           );
         })}
       </div>
    </div>
  );
};
