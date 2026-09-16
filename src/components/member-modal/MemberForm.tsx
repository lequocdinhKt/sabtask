/**
 * File: MemberForm.tsx
 * Trách nhiệm: Form thêm/sửa thành viên — tên, email, role, avatar.
 * Liên quan: MemberModal.tsx, useEntityOperations.ts.
 */

import React, { useState, useRef } from 'react';
import { MemberFormProps, User } from '../../types';
import { Camera, User as UserIcon, Mail, Shield, Link, Briefcase } from 'lucide-react';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';

/** Form nhập thông tin member mới hoặc chỉnh sửa */
export const MemberForm: React.FC<MemberFormProps> = ({ member, onSave, onClose }) => {
  const { state } = useApp();
  const { t } = state;
  const [name, setName] = useState(member?.name || '');
  const [email, setEmail] = useState(member?.email || '');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>(member?.role || 'MEMBER');
  const [jobRole, setJobRole] = useState(member?.jobRole || '');
  
  // Logic for initial avatar
  const getInitialAvatar = () => {
      if (member?.avatar) return member.avatar;
      const seed = Math.random().toString(36).substring(7);
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  };
  
  const [avatar, setAvatar] = useState(getInitialAvatar());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRandomizeAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: member?.id || Math.random().toString(36).substr(2, 9),
      name,
      email,
      role,
      jobRole,
      avatar
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
              
        <div className="flex flex-col items-center justify-center mb-6 gap-3">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img src={avatar} alt="Avatar Preview" className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-700 shadow-md object-cover bg-slate-50" />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
            </div>
            </div>
            <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*"
            />
            <div className="flex gap-2">
            <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-primary-600 font-bold hover:underline"
            >
                {t('uploadImage')}
            </button>
            <span className="text-xs text-slate-300">|</span>
            <button 
                type="button" 
                onClick={handleRandomizeAvatar}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            >
                {t('randomize')}
            </button>
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('fullName')}</label>
            <div className="relative">
            <UserIcon size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium"
                placeholder="e.g. John Doe"
            />
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('emailAddress')}</label>
            <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium"
                placeholder="john@example.com"
            />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('accessLevel')}</label>
                <div className="relative">
                <Shield size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <select 
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium appearance-none"
                >
                    <option value="MEMBER">{t('member')}</option>
                    <option value="ADMIN">{t('admin')}</option>
                </select>
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('jobRole')}</label>
                <div className="relative">
                <Briefcase size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input 
                    type="text" 
                    value={jobRole}
                    onChange={e => setJobRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium"
                    placeholder="e.g. Designer"
                />
                </div>
            </div>
        </div>
        
        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('avatarUrl')}</label>
            <div className="relative">
            <Link size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input 
                type="text" 
                value={avatar}
                onChange={e => setAvatar(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium"
                placeholder="https://..."
            />
            </div>
        </div>

        <div className="pt-4 flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>{t('cancel')}</Button>
            <Button type="submit" variant="primary" className="flex-1">{t('saveMember')}</Button>
        </div>
    </form>
  );
};
