/**
 * File: components/ui/ErrorBoundary.tsx
 * Mục đích: Error boundary bao ngoài cây component của ứng dụng. Khi một component con throw lỗi trong lúc render, file này chặn lỗi để tránh trắng trang và hiển thị màn hình thông báo kèm nút tải lại ứng dụng.
 */

import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './Button';
import { ErrorBoundaryProps, ErrorBoundaryState } from '../../types';

/** Class component đóng vai trò error boundary: theo dõi trạng thái lỗi và quyết định render nội dung con hay màn hình fallback. */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  /** Khởi tạo state ban đầu với trạng thái chưa có lỗi. */
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * Được React gọi khi component con throw lỗi, dùng để chuyển state sang chế độ hiển thị fallback.
   * @param error Lỗi mà component con throw ra.
   * @returns State mới đánh dấu đã có lỗi kèm chính lỗi đó.
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * Ghi log lỗi ra console sau khi boundary bắt được, phục vụ việc gỡ lỗi.
   * @param error Lỗi đã xảy ra.
   * @param errorInfo Thông tin bổ sung của React về cây component gây lỗi.
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  /** Tải lại toàn bộ trang để người dùng thoát khỏi trạng thái lỗi. */
  handleReload = () => {
    window.location.reload();
  };

  /**
   * Hiển thị màn hình fallback kèm thông điệp lỗi và nút tải lại nếu đã bắt được lỗi, ngược lại render nội dung con như bình thường.
   * @returns Màn hình fallback hoặc children của boundary.
   */
  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100 dark:border-slate-700">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Don't worry, your data is safe. It's just a rendering glitch.
            </p>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-left mb-8 overflow-auto max-h-32">
                 <code className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                     {this.state.error?.message}
                 </code>
            </div>
            <Button onClick={this.handleReload} icon={<RefreshCcw size={18} />} className="w-full">
              Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}