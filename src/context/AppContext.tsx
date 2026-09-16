/**
 * File: context/AppContext.tsx
 * Mục đích: Định nghĩa React Context toàn cục của SabTask. Provider gọi hook useAppLogic
 * một lần duy nhất rồi chia sẻ toàn bộ state và actions xuống cây component,
 * giúp mọi component truy cập dữ liệu chung qua hook useApp().
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useAppLogic } from '../hooks/useAppLogic';

type AppContextType = ReturnType<typeof useAppLogic>;

const AppContext = createContext<AppContextType | null>(null);

/** Provider bọc cây component con và cung cấp state/actions toàn cục từ useAppLogic. */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const logic = useAppLogic();
  return (
    <AppContext.Provider value={logic}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * Hook dùng để lấy state/actions toàn cục trong component.
 * @returns Giá trị context của ứng dụng (kết quả của useAppLogic).
 * @throws Error khi được gọi bên ngoài AppProvider.
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
