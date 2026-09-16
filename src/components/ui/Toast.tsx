/**
 * File: components/ui/Toast.tsx
 * Mục đích: Hệ thống thông báo nổi (toast) của SabTask. File này gồm container xếp các toast ở góc dưới phải màn hình và component toast đơn lẻ với ba loại thành công, lỗi và thông tin.
 */

import React, { useEffect } from 'react';
import { ToastProps } from '../../types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

/**
 * Vùng chứa cố định ở góc dưới phải, render toàn bộ toast đang có trong danh sách.
 * @param toasts Danh sách toast cần hiển thị.
 * @param removeToast Hàm xoá một toast khỏi danh sách theo id.
 */
export const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map(toast => (
        <ToastItem key={toast.id} {...toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

/**
 * Một toast đơn lẻ với màu sắc và icon theo loại thông báo, kèm nút đóng thủ công.
 * @param id Mã toast, dùng làm phụ thuộc để hẹn lại thời gian tự ẩn.
 * @param type Loại thông báo quyết định màu nền và icon.
 * @param message Nội dung thông báo hiển thị cho người dùng.
 * @param onRemove Callback yêu cầu gỡ toast này khỏi danh sách.
 */
const ToastItem: React.FC<{ id: string; type: 'success' | 'error' | 'info'; message: string; onRemove: () => void }> = ({
  id, type, message, onRemove 
}) => {
  /** Hẹn tự động gỡ toast sau 4 giây; chạy lại khi id hoặc onRemove đổi và huỷ timer khi unmount. */
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 4000);
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-200',
    error: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-200'
  };

  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-500" />,
    error: <AlertCircle size={18} className="text-rose-500" />,
    info: <Info size={18} className="text-blue-500" />
  };

  return (
    <div className={`
       flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md
       animate-in slide-in-from-right-full duration-300
       ${styles[type]}
    `}>
      {icons[type]}
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onRemove} className="ml-2 hover:opacity-70">
        <X size={14} />
      </button>
    </div>
  );
};
