/**
 * File: components/auth/LoginScreen.tsx
 * Mục đích: Màn hình đăng nhập của SabTask, hiển thị khi người dùng chưa có phiên đăng nhập.
 * File này thu thập email và mật khẩu rồi gọi hàm onLogin do tầng logic cung cấp (đăng nhập
 * bằng Supabase Auth email/password), hiển thị trạng thái đang xử lý và thông báo lỗi khi
 * thông tin không hợp lệ. Toàn bộ nhãn giao diện có sẵn hai ngôn ngữ Anh và Việt.
 */

import React, { useState, FormEvent } from 'react';
import { LoginScreenProps } from '../../types';
import { Mail, Lock, AlertCircle } from 'lucide-react';

/**
 * Component màn hình đăng nhập với form email/mật khẩu và nền động.
 * @param onLogin Hàm thực hiện đăng nhập, trả về true khi thành công và false khi thất bại.
 * @param language Ngôn ngữ hiển thị nhãn của form, mặc định là tiếng Việt.
 */
export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, language = 'vi' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Bộ chuỗi hiển thị của form theo ngôn ngữ đang chọn. */
  const copy = language === 'en'
    ? {
        title: 'Sign in',
        subtitle: 'Sign in with your SabTask account',
        email: 'Email Address',
        password: 'Password',
        button: 'Sign in',
        error: 'Invalid email or password',
        hint: 'Accounts — see TAI_KHOAN.md (Supabase Auth)',
      }
    : {
        title: 'Đăng nhập',
        subtitle: 'Nhập email và mật khẩu để tiếp tục',
        email: 'Email',
        password: 'Mật khẩu',
        button: 'Đăng nhập',
        error: 'Email hoặc mật khẩu không đúng',
        hint: 'Tài khoản — xem TAI_KHOAN.md (Supabase Auth)',
      };

  /**
   * Xử lý khi người dùng gửi form: chặn reload trang, xoá lỗi cũ, bật trạng thái đang xử lý,
   * gọi onLogin và hiển thị thông báo lỗi nếu đăng nhập không thành công.
   * @param e Sự kiện submit của form đăng nhập.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const ok = await onLogin(email, password);
      if (!ok) setError(copy.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: 'ken-burns 30s ease-in-out infinite alternate'
        }}
      />
      <div className="absolute inset-0 z-0 bg-white/20 dark:bg-black/50 backdrop-blur-sm" />

      <style>{`
          @keyframes ken-burns {
              0% { transform: scale(1) translate(0, 0); }
              100% { transform: scale(1.15) translate(-2%, -2%); }
          }
      `}</style>

      <div className="relative z-10 bg-white/90 dark:bg-slate-900/85 p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 dark:border-white/10 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow rotate-6">
            <div className="w-10 h-10 bg-white rounded-xl opacity-20 rotate-45" />
          </div>
          <h1 className="text-3xl font-logo font-extrabold text-brand dark:text-brand-bright tracking-tight">SabTask</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2 font-medium">{copy.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              {copy.email}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                placeholder="admin@sabtask.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              {copy.password}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-3 py-2 rounded-lg">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black hover:bg-neutral-800 dark:bg-primary-500 dark:hover:bg-primary-400 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 text-base"
          >
            {isSubmitting ? '...' : copy.button}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">{copy.hint}</p>
      </div>
    </div>
  );
};
