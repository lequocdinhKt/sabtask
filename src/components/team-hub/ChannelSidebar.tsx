/**
 * File: ChannelSidebar.tsx
 * Trách nhiệm: Sidebar kênh chat/voice trong Team Hub.
 * Liên quan: TeamHub.tsx, types/models.ts (Channel).
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Channel, User } from '../../types';
import { Hash, Volume2, Plus, X, Trash2 } from 'lucide-react';

interface ChannelSidebarProps {
    channels: Channel[];
    activeChannelId: string;
    onSelect: (id: string) => void;
    users: User[];
    currentUser: User;
    onCreateChannel: (name: string, type: 'TEXT' | 'VOICE') => void;
    onDeleteChannel: (id: string) => void;
    mobileView: 'list' | 'chat';
}

/** Sidebar danh sách kênh text/voice và tạo kênh mới */
export const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
    channels, activeChannelId, onSelect, users, currentUser, 
    onCreateChannel, onDeleteChannel, mobileView 
}) => {
  const { state } = useApp();
  const { t } = state;
  const isAdmin = currentUser.role === 'ADMIN';

  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<'TEXT' | 'VOICE'>('TEXT');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    onCreateChannel(newChannelName, newChannelType);
    setNewChannelName('');
    setIsCreatingChannel(false);
  };

  return (
    <div className={`
        absolute inset-0 z-20 bg-slate-50 dark:bg-slate-900 border-r border-slate-100 dark:border-white/5 flex flex-col transition-transform duration-300 ease-in-out
        md:relative md:w-64 md:translate-x-0
        ${mobileView === 'list' ? 'translate-x-0' : '-translate-x-full'}
      `}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between h-16 bg-slate-50 dark:bg-slate-900">
              <h2 className="font-bold text-slate-700 dark:text-slate-200">{t('channels')}</h2>
              {isAdmin && (
                  <button 
                    onClick={() => setIsCreatingChannel(!isCreatingChannel)}
                    className={`p-1.5 rounded-lg transition-colors ${isCreatingChannel ? 'bg-rose-100 text-rose-600' : 'bg-white dark:bg-slate-800 text-primary-600 hover:bg-primary-50 dark:hover:bg-white/10'}`}
                    title="Create Channel"
                  >
                      {isCreatingChannel ? <X size={18} /> : <Plus size={18} />}
                  </button>
              )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-6">
              
              {/* Creator Form (Admin Only) */}
              {isCreatingChannel && (
                  <div className="mb-4 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-top-2">
                      <form onSubmit={handleSubmit} className="space-y-3">
                          <input 
                              autoFocus
                              type="text" 
                              placeholder="Channel name..." 
                              value={newChannelName}
                              onChange={e => setNewChannelName(e.target.value)}
                              className="w-full text-sm p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-primary-500"
                          />
                          <div className="flex gap-2">
                              <button 
                                type="button" 
                                onClick={() => setNewChannelType('TEXT')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${newChannelType === 'TEXT' ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300' : 'border-slate-100 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                              >
                                  Text
                              </button>
                              <button 
                                type="button" 
                                onClick={() => setNewChannelType('VOICE')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${newChannelType === 'VOICE' ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300' : 'border-slate-100 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                              >
                                  Voice
                              </button>
                          </div>
                          <button type="submit" disabled={!newChannelName} className="w-full py-2 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 disabled:opacity-50 transition-colors">
                              Create
                          </button>
                      </form>
                  </div>
              )}

              {/* Text Channels */}
              <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">{t('channels')}</h3>
                  <div className="space-y-1">
                      {channels.filter(c => c.type === 'TEXT').map(channel => (
                          <div key={channel.id} className="group relative">
                            <button
                                onClick={() => onSelect(channel.id)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeChannelId === channel.id ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <Hash size={16} />
                                <span className="truncate">{channel.name}</span>
                            </button>
                            {isAdmin && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteChannel(channel.id); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                                    title="Delete Channel"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                          </div>
                      ))}
                  </div>
              </div>

              {/* Voice Channels */}
              <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">{t('voiceRooms')}</h3>
                  <div className="space-y-1">
                      {channels.filter(c => c.type === 'VOICE').map(channel => (
                          <div key={channel.id} className="relative group">
                            <button
                                onClick={() => onSelect(channel.id)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeChannelId === channel.id ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <Volume2 size={16} />
                                <span className="truncate">{channel.name}</span>
                            </button>
                            {isAdmin && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteChannel(channel.id); }}
                                    className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                                    title="Delete Channel"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                            {/* Connected Users List */}
                            {(channel.connectedUserIds?.length || 0) > 0 && (
                                <div className="ml-8 mt-1 space-y-1 pb-1">
                                    {channel.connectedUserIds?.map(uid => {
                                        const u = users.find(user => user.id === uid);
                                        return (
                                            <div key={uid} className="flex items-center gap-2 text-xs text-slate-500">
                                                <img src={u?.avatar} className="w-4 h-4 rounded-full bg-slate-200" />
                                                <span className="truncate max-w-[120px]">{u?.name}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                          </div>
                      ))}
                  </div>
              </div>
          </div>
          
          {/* User Bar */}
          <div className="p-3 bg-slate-100 dark:bg-slate-800 flex items-center gap-3">
              <div className="relative">
                  <img src={currentUser.avatar} className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-700 object-cover" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white dark:border-slate-800"></div>
              </div>
              <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-800 dark:text-white truncate">{currentUser.name}</div>
                  <div className="text-xs text-slate-500">{t('online')}</div>
              </div>
          </div>
      </div>
  );
};