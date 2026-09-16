/**
 * File: ChatArea.tsx
 * Trách nhiệm: Vùng hiển thị tin nhắn text trong kênh chat.
 * Liên quan: TeamHub.tsx, types/models.ts (ChatMessage).
 */

import React, { useEffect, useRef } from 'react';
import { ChatMessage, User } from '../../types';
import { Sparkles, FileText } from 'lucide-react';

interface ChatAreaProps {
    messages: ChatMessage[];
    users: User[];
    currentUser: User;
    isAiThinking: boolean;
}

/** Khu vực scroll tin nhắn với auto-scroll xuống cuối */
export const ChatArea: React.FC<ChatAreaProps> = ({ messages, users, currentUser, isAiThinking }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isAiThinking]);

    return (
        <div className="p-4 md:p-6 space-y-6">
            {messages.map(msg => {
                const author = users.find(u => u.id === msg.userId);
                const isMe = msg.userId === currentUser.id;
                const isBot = msg.isAi;
                
                return (
                    <div key={msg.id} className={`flex gap-3 md:gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isBot ? 'bg-gradient-to-br from-primary-500 to-indigo-600 text-white' : ''}`}>
                            {isBot ? <Sparkles size={18} /> : <img src={author?.avatar} className="w-full h-full rounded-xl object-cover" />}
                        </div>
                        <div className={`max-w-[80%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">{isBot ? 'SabTask AI' : author?.name}</span>
                                <span className="text-[10px] text-slate-400">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className={`p-3 md:p-3.5 rounded-2xl text-sm ${
                                isMe 
                                ? 'bg-primary-600 text-white rounded-tr-none' 
                                : isBot
                                ? 'bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 text-slate-800 dark:text-slate-100 border border-primary-100 dark:border-primary-800/50 rounded-tl-none'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none shadow-sm'
                            }`}>
                                {/* Attachment Rendering */}
                                {msg.attachment && (
                                <div className="mb-2">
                                    {msg.attachment.type === 'image' ? (
                                        <img src={msg.attachment.url} alt="attachment" className="rounded-lg max-h-60 border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => window.open(msg.attachment?.url, '_blank')} />
                                    ) : (
                                        <a href={msg.attachment.url} download={msg.attachment.name} className="flex items-center gap-3 bg-slate-100 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                            <div className="w-10 h-10 bg-white dark:bg-slate-600 rounded-lg flex items-center justify-center text-primary-500">
                                                <FileText size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold truncate">{msg.attachment.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Click to download</p>
                                            </div>
                                        </a>
                                    )}
                                </div>
                                )}
                                {msg.text && <p>{msg.text}</p>}
                            </div>
                        </div>
                    </div>
                )
            })}
            {isAiThinking && (
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                        <Sparkles size={20} className="animate-pulse" />
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};