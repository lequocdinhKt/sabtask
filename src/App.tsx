/**
 * File: App.tsx
 * Mục đích: Component gốc của SabTask, chịu trách nhiệm quyết định hiển thị màn hình
 * đăng nhập hay bộ khung giao diện chính (Sidebar, Header, vùng nội dung, modal, toast)
 * dựa trên trạng thái xác thực lấy từ AppContext.
 */

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { NotificationsPanel } from './components/NotificationsPanel';
import { LoginScreen } from './components/auth/LoginScreen';
import { ViewManager } from './components/views/ViewManager';
import { ModalManager } from './components/modals/ModalManager';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

/**
 * Khung giao diện chính: hiển thị trạng thái chờ khi phiên đăng nhập chưa khôi phục xong,
 * hiển thị LoginScreen nếu chưa đăng nhập, ngược lại dựng layout Sidebar + Header + ViewManager
 * kèm panel thông báo, modal và toast.
 */
const AppLayout = () => {
  const { state, actions } = useApp();

  if (!state.authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-bg text-slate-500">
        Loading...
      </div>
    );
  }

  if (!state.isAuth) {
    return (
      <LoginScreen
        onLogin={actions.handleLogin}
        language={state.language}
      />
    );
  }
  const isFixedView = state.activeTab === 'hub';

  return (
    <div className="flex h-screen bg-background dark:bg-dark-bg overflow-hidden text-slate-900 dark:text-slate-100 selection:bg-primary-500/30">

      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header />

        {state.showNotifications && <NotificationsPanel />}

        <div className={`
            flex-1 p-4 md:p-6 lg:p-8 relative
            ${isFixedView ? 'overflow-hidden flex flex-col' : 'overflow-auto scroll-smooth custom-scrollbar'}
        `}>
          {state.isLoading && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary-100 overflow-hidden z-50">
              <div className="h-full bg-primary-500 animate-pulse w-full origin-left-right"></div>
            </div>
          )}

          <div className={`mx-auto ${isFixedView ? 'h-full w-full' : ''}`}>
            <ErrorBoundary>
              <ViewManager />
            </ErrorBoundary>
          </div>
        </div>
      </main>

      <ModalManager />
      <ToastContainer toasts={state.toasts} removeToast={actions.removeToast} />
    </div>
  );
};

/** Component được export mặc định, bọc AppLayout trong AppProvider để cấp state/actions toàn cục. */
export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
