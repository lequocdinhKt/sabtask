/**
 * File: HeaderSearch.tsx
 * Trách nhiệm: Ô tìm kiếm toàn cục với dropdown kết quả (debounce 300ms).
 * Liên quan: useSearchSystem.ts, Header.tsx, AppContext.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { Search, Folder, FileText, Users, MessageSquare } from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { SearchResult } from '../../../types';

/** Tìm kiếm global với debounce và dropdown kết quả */
export const HeaderSearch: React.FC = () => {
  const { state, actions } = useApp();
  const { t } = state;
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchQuery) {
        actions.performGlobalSearch(localSearchQuery);
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearchQuery]);

  /** Trả icon tương ứng loại kết quả tìm kiếm */
  const getResultIcon = (type: SearchResult['type']) => {
     switch(type) {
       case 'PROJECT': return <Folder size={16} className="text-primary-500" />;
       case 'TASK': return <FileText size={16} className="text-blue-500" />;
       case 'MEMBER': return <Users size={16} className="text-emerald-500" />;
       case 'COMMENT': return <MessageSquare size={16} className="text-amber-500" />;
     }
  };

  return (
    <div ref={searchContainerRef} className="relative hidden xl:block w-72">
      <div className="flex items-center bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all shadow-sm">
        <Search size={18} className="text-slate-500 dark:text-slate-400 mr-2" />
        <input 
          type="text" 
          placeholder={t('searchPlaceholder')}
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          onFocus={() => localSearchQuery && setShowResults(true)}
          className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white" 
        />
      </div>

      {showResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                {state.globalSearchResults.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                      {t('noTasksFound')}
                  </div>
                ) : (
                  <>
                    <div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Top Matches</div>
                    {state.globalSearchResults.map((result) => (
                        <button 
                          key={`${result.type}-${result.id}`}
                          onClick={() => {
                              actions.handleSearchResultClick(result);
                              setLocalSearchQuery('');
                              setShowResults(false);
                          }}
                          className="w-full text-left flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                        >
                          <div className="mt-1 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              {getResultIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate pr-2">
                                  {result.title}
                                </h4>
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 h-auto">
                                    {result.type}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {result.subtitle}
                              </p>
                          </div>
                        </button>
                    ))}
                  </>
                )}
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-[10px] text-center text-slate-500 dark:text-slate-400">
                Press ESC to close
            </div>
          </div>
      )}
    </div>
  );
};
