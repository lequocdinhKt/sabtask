/**
 * File: services/supabaseClient.ts
 * Mục đích: Khởi tạo và export một instance Supabase dùng chung cho toàn bộ ứng dụng
 * (xác thực, truy vấn Postgres, realtime). Cấu hình đọc từ biến môi trường SUPABASE_URL
 * và SUPABASE_ANON_KEY; nếu thiếu thì chủ động ném lỗi ngay khi nạp module.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Hàm lock rỗng thay thế cơ chế Navigator LockManager mặc định của Supabase Auth.
 * Dùng để tránh lỗi tranh chấp lock auth-token khi chạy React Strict Mode, mở nhiều tab hoặc HMR:
 * hàm bỏ qua tên lock và thời gian chờ, gọi trực tiếp tác vụ được truyền vào.
 * @param _name Tên lock do Supabase truyền vào (không sử dụng).
 * @param _acquireTimeout Thời gian chờ lấy lock (không sử dụng).
 * @param fn Tác vụ bất đồng bộ cần thực thi.
 * @returns Kết quả trả về của fn.
 */
const authLock = async <R>(
  _name: string,
  _acquireTimeout: number,
  fn: () => Promise<R>
): Promise<R> => fn()

/**
 * Instance Supabase dùng chung (singleton) với chế độ lưu phiên, tự làm mới token,
 * nhận session từ URL và dùng authLock ở trên.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    lock: authLock,
  },
})
