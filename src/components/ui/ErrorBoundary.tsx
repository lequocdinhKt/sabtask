/**
 * File: ErrorBoundary.tsx
 * Trách nhiệm: Bắt lỗi render React và hiển thị màn hình fallback.
 * Liên quan: types/props.ts, main.tsx/App.tsx bọc ErrorBoundary.
 */

import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './Button';
import { ErrorBoundaryProps, ErrorBoundaryState } from '../../types';

/** Error boundary class component — bắt lỗi con và hiện UI reload */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  /** Tải lại trang khi người dùng bấm nút reload */
  handleReload = () => {
    window.location.reload();
  };

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