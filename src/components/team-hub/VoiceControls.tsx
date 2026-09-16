/**
 * File: components/team-hub/VoiceControls.tsx
 * Mục đích: Thanh nút điều khiển hiển thị bên dưới phòng voice của Team Hub, gồm bật/tắt micro, bật/tắt camera và rời phòng.
 * Đây là component thuần giao diện: nó chỉ đổi trạng thái ở phía client và gọi callback, chưa điều khiển thiết bị thật vì tính năng voice chưa tích hợp WebRTC.
 */

import React from 'react';
import { Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react';

interface VoiceControlsProps {
    isMuted: boolean;
    isVideoOn: boolean;
    onToggleMute: () => void;
    onToggleVideo: () => void;
    onLeave: () => void;
}

/** Component ba nút điều khiển phòng voice: micro, camera và kết thúc tham gia; hình dạng nút thay đổi theo trạng thái nhận từ props. */
export const VoiceControls: React.FC<VoiceControlsProps> = ({
    isMuted, isVideoOn, onToggleMute, onToggleVideo, onLeave
}) => {
    return (
        <div className="flex items-center justify-center gap-4">
            <button 
            onClick={onToggleMute}
            className={`p-4 rounded-full transition-all ${isMuted ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white'}`}
            >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button 
            onClick={onToggleVideo}
            className={`p-4 rounded-full transition-all ${!isVideoOn ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white'}`}
            >
                {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>
            <button 
            onClick={onLeave}
            className="p-4 rounded-full bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/30"
            >
                <Phone size={24} className="rotate-135" />
            </button>
        </div>
    );
};