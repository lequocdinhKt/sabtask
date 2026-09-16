/**
 * File: HubHeader.tsx
 * Trách nhiệm: Header kênh đang chọn — tên, loại, nút join voice.
 * Liên quan: TeamHub.tsx, VoiceStage.tsx.
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Channel } from '../../types';
import { ArrowLeft, Volume2, Hash, Phone } from 'lucide-react';

interface HubHeaderProps {
    activeChannel: Channel | undefined;
    isJoined: boolean;
    onToggleVoiceRoom: (id: string) => void;
    onBack: () => void;
}

/** Header hiển thị tên kênh và điều khiển voice room */
export const HubHeader: React.FC<HubHeaderProps> = ({
    activeChannel, isJoined, onToggleVoiceRoom, onBack 
}) => {
    const { state } = useApp();
    const { t } = state;

    const getChannelIcon = (type: Channel['type']) => {
        return type === 'VOICE' ? <Volume2 size={18} /> : <Hash size={18} />;
    };

    return (
        <div className="h-16 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-dark-surface">
              <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button 
                    onClick={onBack}
                    className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                      <ArrowLeft size={20} />
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="text-slate-500 dark:text-slate-400">
                        {getChannelIcon(activeChannel?.type || 'TEXT')}
                    </div>
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white truncate max-w-[150px] md:max-w-xs">{activeChannel?.name}</h2>
                  </div>
              </div>

              {activeChannel?.type === 'VOICE' && (
                  <button 
                    onClick={() => onToggleVoiceRoom(activeChannel.id)}
                    className={`px-3 py-2 md:px-4 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${isJoined && 'bg-rose-500 text-white hover:bg-rose-600' } ${!isJoined && 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                  >
                      {isJoined ? (
                          <><Phone size={16} className="rotate-135" /> <span className="hidden md:inline">{t('leaveRoom')}</span><span className="md:hidden">Leave</span></>
                      ) : (
                          <><Phone size={16} /> <span className="hidden md:inline">{t('joinRoom')}</span><span className="md:hidden">Join</span></>
                      )}
                  </button>
              )}
        </div>
    );
};