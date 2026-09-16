/**
 * File: HeaderLanguage.tsx
 * Trách nhiệm: Dropdown chuyển ngôn ngữ giao diện (chỉ English / Tiếng Việt).
 * Liên quan: useUIState (language, setLanguage), translations.ts, Header.tsx.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { ChevronDown, Check } from 'lucide-react';
import { Language } from '../../../types';

/** Cờ Anh (UK) */
const FlagUK = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 60 30" className={className || "w-6 h-4 rounded shadow-sm object-cover"}>
    <rect width="60" height="30" fill="#012169"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="2"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
  </svg>
);

/** Cờ Việt Nam */
const FlagVN = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 60 40" className={className || "w-6 h-4 rounded shadow-sm object-cover"}>
    <rect width="60" height="40" fill="#DA251D"/>
    <polygon
      points="30,8 33.5,19 45,19 35.5,26 39,37 30,30 21,37 24.5,26 15,19 26.5,19"
      fill="#FFFF00"
    />
  </svg>
);

export const HeaderLanguage: React.FC = () => {
  const { state, actions } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; Flag: typeof FlagUK }[] = [
    { code: 'en', label: 'English', Flag: FlagUK },
    { code: 'vi', label: 'Tiếng Việt', Flag: FlagVN },
  ];

  const currentLang = languages.find(l => l.code === state.language) || languages[0];

  /** Đóng menu khi click ra ngoài */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 h-11 px-2 md:px-3 rounded-xl md:rounded-2xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm group"
          title="Switch Language"
        >
          <currentLang.Flag className="w-6 h-4 rounded-sm shadow-sm object-cover" />
          <span className="hidden md:inline text-sm font-bold">{currentLang.label}</span>
          <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-slate-100 dark:border-dark-border overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
              <div className="p-1.5">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      actions.setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                      ${state.language === lang.code 
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <lang.Flag className="w-5 h-3.5 rounded-sm shadow-sm" />
                      <span>{lang.label}</span>
                    </div>
                    {state.language === lang.code && <Check size={14} />}
                  </button>
                ))}
              </div>
          </div>
        )}
    </div>
  );
};
