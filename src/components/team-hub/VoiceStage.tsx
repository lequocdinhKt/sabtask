/**
 * File: components/team-hub/VoiceStage.tsx
 * Mục đích: Khu vực chính của phòng voice trong Team Hub, hiển thị lưới avatar những người đang tham gia kèm dấu hiệu bật/tắt micro.
 * Khi phòng chưa có ai, component hiện trạng thái rỗng cùng nút tham gia.
 * Toàn bộ hiệu ứng "đang nói" chỉ là mô phỏng giao diện vì tính năng voice chưa có kết nối WebRTC thật.
 */

import React from 'react';
import { Channel, User } from '../../types';
import { Volume2, Mic, MicOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface VoiceStageProps {
    channel: Channel | undefined;
    users: User[];
    currentUser: User;
    isJoined: boolean;
    isMuted: boolean;
    onJoin: () => void;
}

/** Component sân khấu phòng voice: hiện trạng thái phòng rỗng kèm nút tham gia, hoặc lưới avatar các thành viên đang trong phòng. */
export const VoiceStage: React.FC<VoiceStageProps> = ({
    channel, users, currentUser, isJoined, isMuted, onJoin 
}) => {
    const { state } = useApp();
    const { t } = state;

    if (!channel?.connectedUserIds || channel.connectedUserIds.length === 0) {
        return (
            <div className="p-4 md:p-8 h-full flex flex-col items-center justify-center">
                <div className="text-center text-slate-400">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Volume2 size={40} className="opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Room is empty</h3>
                        <p className="mb-6">Join to start the conversation</p>
                        <button 
                        onClick={onJoin}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all"
                        >
                            {t('joinRoom')}
                        </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 h-full flex flex-col items-center justify-center">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl">
                {channel.connectedUserIds.map(uid => {
                    const u = users.find(user => user.id === uid);
                    const isUserMe = uid === currentUser.id;
                    return (
                        <div key={uid} className="relative aspect-square">
                            <div className={`w-full h-full rounded-3xl overflow-hidden border-4 relative ${isUserMe && !isMuted ? 'border-emerald-500 shadow-glow' : 'border-white dark:border-slate-700 shadow-xl'}`}>
                                <img src={u?.avatar} className="w-full h-full object-cover" />
                                <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1.5 max-w-[85%]">
                                    {isUserMe && isMuted ? <MicOff size={12} className="text-rose-400 flex-shrink-0" /> : <Mic size={12} className="text-emerald-400 flex-shrink-0" />}
                                    <span className="truncate">{u?.name} {isUserMe && '(You)'}</span>
                                </div>
                            </div>
                            {isUserMe && !isMuted && (
                                <div className="absolute inset-0 rounded-3xl border-4 border-emerald-500 animate-ping opacity-20 pointer-events-none"></div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};