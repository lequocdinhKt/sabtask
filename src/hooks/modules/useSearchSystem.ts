/**
 * File: useSearchSystem.ts
 * Trách nhiệm: Lọc task cục bộ và tìm kiếm toàn cục (project/task/member/comment).
 * Liên quan: HeaderSearch.tsx, FilterBar.tsx, useAppLogic.ts.
 */

import { useState, useMemo } from 'react';
import { Task, Project, User, SearchResult, FilterState } from '../../types';

/** Hook bộ lọc và fuzzy search toàn app */
export const useSearchSystem = (tasks: Task[], projects: Project[], users: User[]) => {
  // Local View Filters
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    priority: 'ALL',
    assigneeId: 'ALL'
  });

  // Global Search Results
  const [globalSearchResults, setGlobalSearchResults] = useState<SearchResult[]>([]);

  // Computed Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const searchMatch = 
        t.title.toLowerCase().includes(filters.search.toLowerCase()) || 
        t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
      
      if (!searchMatch) return false;
      if (filters.priority !== 'ALL' && t.priority !== filters.priority) return false;
      if (filters.assigneeId !== 'ALL' && t.assigneeId !== filters.assigneeId) return false;

      return true;
    });
  }, [tasks, filters]);

  // Global Fuzzy Search Logic
  /** Tìm kiếm fuzzy trên project, task, comment, member; sắp xếp theo điểm */
  const performGlobalSearch = (query: string) => {
    if (!query.trim()) {
      setGlobalSearchResults([]);
      return;
    }

    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    const getScore = (text: string, query: string, weight = 1): number => {
      const t = text.toLowerCase();
      if (t === query) return 100 * weight;
      if (t.startsWith(query)) return 80 * weight;
      if (t.includes(query)) return 60 * weight;
      const words = query.split(' ');
      if (words.every(w => t.includes(w))) return 40 * weight;
      return 0;
    };

    // 1. Projects
    projects.forEach(p => {
      const nameScore = getScore(p.name, q, 1.2);
      const descScore = getScore(p.description || '', q, 0.8);
      const score = Math.max(nameScore, descScore);
      if (score > 0) {
        results.push({
          id: p.id, type: 'PROJECT', title: p.name, subtitle: p.description || 'Project',
          score, metadata: { status: p.status }, data: p
        });
      }
    });

    // 2. Tasks & Comments
    tasks.forEach(t => {
      const titleScore = getScore(t.title, q, 1.1);
      const descScore = getScore(t.description || '', q, 0.7);
      const tagScore = t.tags.some(tag => getScore(tag, q) > 0) ? 50 : 0;
      const score = Math.max(titleScore, descScore, tagScore);

      if (score > 0) {
        const project = projects.find(p => p.id === t.projectId);
        results.push({
          id: t.id, type: 'TASK', title: t.title, subtitle: project?.name || 'Task',
          score, metadata: { status: t.status, priority: t.priority }, data: t
        });
      }

      t.comments.forEach(c => {
         const commentScore = getScore(c.text, q, 0.6);
         if (commentScore > 0) {
            results.push({
               id: c.id, type: 'COMMENT', title: `Comment on "${t.title}"`, subtitle: c.text,
               score: commentScore, data: c, referenceId: t.id
            });
         }
      });
    });

    // 3. Members
    users.forEach(u => {
      const nameScore = getScore(u.name, q, 1.1);
      const emailScore = getScore(u.email || '', q, 0.9);
      const score = Math.max(nameScore, emailScore);
      if (score > 0) {
        results.push({
          id: u.id, type: 'MEMBER', title: u.name, subtitle: u.jobRole || u.role,
          score, metadata: { avatar: u.avatar }, data: u
        });
      }
    });

    setGlobalSearchResults(results.sort((a, b) => b.score - a.score).slice(0, 10));
  };

  return {
    filters, setFilters,
    filteredTasks,
    globalSearchResults, setGlobalSearchResults,
    performGlobalSearch
  };
};
