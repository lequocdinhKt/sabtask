/**
 * File: VoiceControls.tsx
 * Trách nhiệm: Nút điều khiển voice — mute, video, rời phòng.
 * Liên quan: VoiceStage.tsx, TeamHub.tsx.
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

/** Thanh điều khiển mic, camera và rời voice room */
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