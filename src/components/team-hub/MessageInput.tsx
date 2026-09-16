/**
 * File: MessageInput.tsx
 * Trách nhiệm: Ô nhập tin nhắn, đính kèm file, gửi, và gợi ý mention (@ai / @groq).
 * Liên quan: TeamHub.tsx (handleSendMessage).
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Paperclip, Send, X, FileText, Bot, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MessageInputProps {
    value: string;
    onChange: (val: string) => void;
    onSend: (e: React.FormEvent) => void;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPaste: (e: React.ClipboardEvent) => void;
    attachment: { type: 'image' | 'file', url: string, name: string } | null;
    onClearAttachment: () => void;
    isDisabled: boolean;
}

interface MentionOption {
    tag: string;
    label: string;
    description: string;
    icon: 'bot' | 'sparkles';
}

const MENTION_OPTIONS: MentionOption[] = [
    {
        tag: '@ai',
        label: 'AI Assistant',
        description: 'Hỏi bot trợ lý SabTask (Groq)',
        icon: 'bot',
    },
    {
        tag: '@groq',
        label: 'Groq',
        description: 'Gọi AI qua Groq (cùng bot)',
        icon: 'sparkles',
    },
];

/** Tìm đoạn mention đang gõ ngay trước con trỏ (dạng @xxx) */
const getActiveMention = (text: string, cursor: number) => {
    const before = text.slice(0, cursor);
    const match = before.match(/(^|\s)(@[\w.-]*)$/);
    if (!match) return null;
    return {
        query: match[2].slice(1).toLowerCase(), // bỏ ký tự @
        start: before.length - match[2].length,
        end: cursor,
    };
};

/** Ô nhập tin nhắn với hỗ trợ file đính kèm và gợi ý @mention */
export const MessageInput: React.FC<MessageInputProps> = ({
    value, onChange, onSend, onFileSelect, onPaste, attachment, onClearAttachment, isDisabled
}) => {
    const { state } = useApp();
    const { t } = state;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [cursor, setCursor] = useState(0);
    const [showMentions, setShowMentions] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(0);

    const activeMention = useMemo(() => getActiveMention(value, cursor), [value, cursor]);

    const filteredMentions = useMemo(() => {
        if (!activeMention) return [];
        return MENTION_OPTIONS.filter(
            (m) =>
                m.tag.slice(1).startsWith(activeMention.query) ||
                m.label.toLowerCase().includes(activeMention.query)
        );
    }, [activeMention]);

    useEffect(() => {
        const open = !!activeMention && filteredMentions.length > 0;
        setShowMentions(open);
        setHighlightIndex(0);
    }, [activeMention, filteredMentions.length]);

    const applyMention = (tag: string) => {
        if (!activeMention) return;
        const before = value.slice(0, activeMention.start);
        const after = value.slice(activeMention.end);
        const next = `${before}${tag} ${after}`;
        onChange(next);
        setShowMentions(false);
        requestAnimationFrame(() => {
            const pos = before.length + tag.length + 1;
            inputRef.current?.focus();
            inputRef.current?.setSelectionRange(pos, pos);
            setCursor(pos);
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
        setCursor(e.target.selectionStart ?? e.target.value.length);
    };

    const syncCursor = (e: React.SyntheticEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        setCursor(target.selectionStart ?? target.value.length);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showMentions || filteredMentions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightIndex((i) => (i + 1) % filteredMentions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightIndex((i) => (i - 1 + filteredMentions.length) % filteredMentions.length);
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            applyMention(filteredMentions[highlightIndex].tag);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setShowMentions(false);
        }
    };

    return (
        <form onSubmit={onSend} className="flex gap-2 md:gap-3 items-end relative">
            
            {/* Attachment Preview (Absolute Overlay) */}
            {attachment && (
                <div className="absolute bottom-full left-4 mb-2 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 z-20">
                    <div className="relative group">
                    {attachment.type === 'image' ? (
                        <img src={attachment.url} className="h-16 w-16 object-cover rounded-lg border border-slate-200 dark:border-slate-600" />
                    ) : (
                        <div className="h-16 w-16 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-600 text-slate-500">
                            <FileText size={24} />
                        </div>
                    )}
                    <button 
                        type="button"
                        onClick={() => {
                            onClearAttachment();
                            if (fileInputRef.current) fileInputRef.current.value = '';
                        }} 
                        className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5 shadow-sm hover:bg-rose-600 transition-colors"
                    >
                        <X size={12}/>
                    </button>
                    </div>
                    <div className="pr-2">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[150px] truncate">{attachment.name}</p>
                        <p className="text-[10px] text-slate-400">Ready to send</p>
                    </div>
                </div>
            )}

            {/* Mention suggestions */}
            {showMentions && (
                <div
                    className="absolute bottom-full left-12 mb-2 w-[min(100%,320px)] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-30 animate-in fade-in slide-in-from-bottom-2"
                    role="listbox"
                >
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700">
                        Mentions
                    </div>
                    <ul className="py-1 max-h-48 overflow-y-auto">
                        {filteredMentions.map((m, idx) => (
                            <li key={m.tag}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={idx === highlightIndex}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        applyMention(m.tag);
                                    }}
                                    onMouseEnter={() => setHighlightIndex(idx)}
                                    className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors ${
                                        idx === highlightIndex
                                            ? 'bg-primary-50 dark:bg-primary-900/30'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                    }`}
                                >
                                    <span className="mt-0.5 w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 flex items-center justify-center flex-shrink-0">
                                        {m.icon === 'bot' ? <Bot size={16} /> : <Sparkles size={16} />}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                                            {m.tag}
                                            <span className="ml-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                {m.label}
                                            </span>
                                        </span>
                                        <span className="block text-xs text-slate-500 dark:text-slate-400 truncate">
                                            {m.description}
                                        </span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center focus-within:ring-2 focus-within:ring-primary-500 transition-all">
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    onChange={onFileSelect}
                />
                <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-slate-400 hover:text-primary-600 transition-colors"
                    title="Attach file or image"
                >
                    <Paperclip size={20} />
                </button>
                <input 
                    ref={inputRef}
                    type="text" 
                    value={value}
                    onChange={handleChange}
                    onClick={syncCursor}
                    onKeyUp={syncCursor}
                    onSelect={syncCursor}
                    onKeyDown={handleKeyDown}
                    onPaste={onPaste}
                    placeholder={t('typeMessage')}
                    className="flex-1 bg-transparent border-none outline-none px-2 py-3 text-sm min-w-0"
                    autoComplete="off"
                />
            </div>
            <button 
                type="submit" 
                disabled={isDisabled}
                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white p-3 rounded-xl transition-all shadow-lg shadow-primary-500/20 flex-shrink-0"
            >
                <Send size={20} />
            </button>
        </form>
    );
};
