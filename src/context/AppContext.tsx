/**
 * File: AppContext.tsx
 * Trách nhiệm: Provider React Context bọc useAppLogic; expose hook useApp() cho components.
 * Liên quan: useAppLogic.ts, App.tsx, mọi component dùng useApp().
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useAppLogic } from '../hooks/useAppLogic';

type AppContextType = ReturnType<typeof useAppLogic>;

const AppContext = createContext<AppContextType | null>(null);

/** Bọc cây component bằng state/actions toàn cục */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const logic = useAppLogic();
  return (
    <AppContext.Provider value={logic}>
      {children}
    </AppContext.Provider>
  );
};

/** Lấy context app; ném lỗi nếu ngoài AppProvider */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
