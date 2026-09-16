/**
 * File: ProfileModal.tsx
 * Trách nhiệm: Modal chỉnh sửa profile người dùng hiện tại (avatar, tên, email).
 * Liên quan: useEntityOperations (handleProfileUpdate), Sidebar.
 */

import React, { useState, useEffect, useRef } from 'react';
import { ProfileModalProps, User } from '../types';
import { X, Camera, Mail, Shield, User as UserIcon, Upload, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';
import { useApp } from '../context/AppContext';

/** Modal cập nhật thông tin profile người dùng đang đăng nhập */
export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
  const { state } = useApp();
  const { t } = state;
  const [formData, setFormData] = useState<User>(user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(user);
  }, [user, isOpen]);

  if (!isOpen) return null;

  /** Lưu thay đổi profile và gọi onUpdate */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  /** Upload ảnh avatar từ file input */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRandomizeAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    setFormData(prev => ({ ...prev, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}` }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-primary-600 to-violet-600">
           <button 
              onClick={onClose} 
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 rounded-full text-white backdrop-blur-sm transition-colors"
           >
             <X size={20} />
           </button>
        </div>
        
        <div className="px-8 pb-8">
           <div className="relative -mt-16 mb-6 flex flex-col items-center">
              <div 
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                 <img src={formData.avatar} alt="Profile" className="w-32 h-32 rounded-[2rem] border-4 border-white dark:border-slate-800 object-cover shadow-lg bg-white" />
                 <div className="absolute inset-0 bg-black/40 rounded-[2rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={32} />
                 </div>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
              />

              <div className="flex gap-4 mt-3">
                <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
                >
                    <Upload size={14} /> {t('upload')}
                </button>
                <button 
                    type="button" 
                    onClick={handleRandomizeAvatar}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                    <RefreshCw size={14} /> {t('randomize')}
                </button>
              </div>
           </div>

           <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center mb-6">
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('editProfile')}</h2>
                 <p className="text-sm text-slate-600 dark:text-slate-300">{t('updateDetails')}</p>
              </div>

              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 ml-1">{t('fullName')}</label>
                    <div className="relative">
                       <UserIcon size={18} className="absolute left-3.5 top-3.5 text-slate-500 dark:text-slate-400" />
                       <input 
                          type="text" 
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium text-slate-900 dark:text-white"
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 ml-1">{t('emailAddress')}</label>
                    <div className="relative">
                       <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-500 dark:text-slate-400" />
                       <input 
                          type="email" 
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium text-slate-900 dark:text-white"
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 ml-1">{t('role')}</label>
                    <div className="relative">
                       <Shield size={18} className="absolute left-3.5 top-3.5 text-slate-500 dark:text-slate-400" />
                       {user.role === 'ADMIN' ? (
                         <select 
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value as User['role']})}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium appearance-none text-slate-900 dark:text-white"
                         >
                            <option value="ADMIN">{t('administrator')}</option>
                            <option value="MEMBER">{t('teamMember')}</option>
                         </select>
                       ) : (
                         <input
                            type="text"
                            readOnly
                            value={formData.role === 'ADMIN' ? t('administrator') : t('teamMember')}
                            className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300"
                         />
                       )}
                    </div>
                 </div>
              </div>

              <div className="pt-4 flex gap-3">
                 <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>{t('cancel')}</Button>
                 <Button type="submit" variant="primary" className="flex-1">{t('saveChanges')}</Button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};
