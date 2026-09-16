/**
 * File: TeamHub.tsx
 * Trách nhiệm: Hub chat team — kênh text/voice, tin nhắn (persist DB), AI bot.
 * Liên quan: useTeamHub.ts, team-hub/*, groqService.
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { askTeamAssistant } from '../services/groqService';
import { useTeamHub } from '../hooks/useTeamHub';

import { ChannelSidebar } from './team-hub/ChannelSidebar';
import { HubHeader } from './team-hub/HubHeader';
import { ChatArea } from './team-hub/ChatArea';
import { VoiceStage } from './team-hub/VoiceStage';
import { MessageInput } from './team-hub/MessageInput';
import { VoiceControls } from './team-hub/VoiceControls';

/** View Team Hub — chat persist + voice UI mock + Groq */
export const TeamHub: React.FC = () => {
  const { state } = useApp();
  const { user, users, isAuth } = state;
  const hub = useTeamHub(isAuth, user);

  const [activeChannelId, setActiveChannelId] = useState('c1');
  const [inputMessage, setInputMessage] = useState('');
  const [attachment, setAttachment] = useState<{ type: 'image' | 'file', url: string, name: string } | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const activeChannel = hub.channels.find(c => c.id === activeChannelId) || hub.channels[0];

  const handleChannelSelect = (channelId: string) => {
      setActiveChannelId(channelId);
      setMobileView('chat');
  };

  const processFile = (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
        alert("File size too large (max 5MB)");
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const result = e.target?.result as string;
        const isImage = file.type.startsWith('image/');
        setAttachment({ type: isImage ? 'image' : 'file', url: result, name: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        processFile(e.target.files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
            const file = items[i].getAsFile();
            if (file) processFile(file);
        }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() && !attachment) return;
    if (!activeChannel) return;

    const currentText = inputMessage;
    const currentAttachment = attachment ? { ...attachment } : undefined;
    setInputMessage('');
    setAttachment(null);

    await hub.sendMessage(activeChannel.id, currentText, currentAttachment);

    const lower = currentText.toLowerCase();
    if (lower.includes('@ai') || lower.includes('@groq')) {
       setIsAiThinking(true);
       try {
          const reply = await askTeamAssistant(currentText);
          await hub.sendAiMessage(activeChannel.id, reply);
       } catch (err) {
          console.error(err);
       } finally {
          setIsAiThinking(false);
       }
    }
  };

  const toggleVoiceRoom = (channelId: string) => {
     if (isJoined && activeChannelId === channelId) {
         setIsJoined(false);
         hub.setVoiceConnectedLocal(channelId, false);
     } else {
         if (isJoined && activeChannel) {
             hub.setVoiceConnectedLocal(activeChannel.id, false);
         }
         setActiveChannelId(channelId);
         setMobileView('chat'); 
         setIsJoined(true);
         hub.setVoiceConnectedLocal(channelId, true);
     }
  };

  const handleCreateChannel = async (name: string, type: 'TEXT' | 'VOICE') => {
      const created = await hub.createChannel(name, type);
      if (created) {
        setActiveChannelId(created.id);
        setMobileView('chat');
      }
  };

  const handleDeleteChannel = async (id: string) => {
      const ok = await hub.deleteChannel(id);
      if (ok && activeChannelId === id) {
          const next = hub.channels.find(c => c.id !== id);
          if (next) setActiveChannelId(next.id);
      }
  };

  return (
    <div className="flex h-full bg-white dark:bg-dark-surface rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-sm relative">
      
      <ChannelSidebar 
        channels={hub.channels}
        activeChannelId={activeChannel?.id || activeChannelId}
        onSelect={handleChannelSelect}
        users={users}
        currentUser={user}
        onCreateChannel={handleCreateChannel}
        onDeleteChannel={handleDeleteChannel}
        mobileView={mobileView}
      />

      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-dark-bg/50 w-full h-full relative z-10">
          
          <HubHeader 
            activeChannel={activeChannel}
            isJoined={isJoined && activeChannelId === activeChannel?.id}
            onToggleVoiceRoom={toggleVoiceRoom}
            onBack={() => setMobileView('list')}
          />

          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
              {activeChannel?.type === 'TEXT' ? (
                 <ChatArea 
                    messages={hub.messages.filter(m => m.channelId === activeChannel.id)}
                    users={users}
                    currentUser={user}
                    isAiThinking={isAiThinking}
                 />
              ) : (
                 <VoiceStage 
                    channel={activeChannel}
                    users={users}
                    currentUser={user}
                    isJoined={isJoined}
                    isMuted={isMuted}
                    onJoin={() => toggleVoiceRoom(activeChannelId)}
                 />
              )}
          </div>

          <div className="p-3 md:p-4 bg-white dark:bg-dark-surface border-t border-slate-200 dark:border-white/5 relative">
              {activeChannel?.type === 'TEXT' ? (
                  <MessageInput 
                    value={inputMessage}
                    onChange={setInputMessage}
                    onSend={handleSendMessage}
                    onFileSelect={handleFileSelect}
                    onPaste={handlePaste}
                    attachment={attachment}
                    onClearAttachment={() => setAttachment(null)}
                    isDisabled={!inputMessage.trim() && !attachment}
                  />
              ) : (
                  isJoined && (
                    <VoiceControls 
                        isMuted={isMuted}
                        isVideoOn={isVideoOn}
                        onToggleMute={() => setIsMuted(!isMuted)}
                        onToggleVideo={() => setIsVideoOn(!isVideoOn)}
                        onLeave={() => toggleVoiceRoom(activeChannelId)}
                    />
                  )
              )}
          </div>
      </div>
    </div>
  );
};
