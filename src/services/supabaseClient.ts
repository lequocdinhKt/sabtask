/**
 * File: supabaseClient.ts
 * Trách nhiệm: Khởi tạo client Supabase dùng chung cho mọi CRUD.
 * Liên quan: .env (SUPABASE_URL, SUPABASE_ANON_KEY), useDataFetching, useEntityOperations, useTimeTracking.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Lock no-op: tránh lỗi Navigator LockManager
 * "Acquiring an exclusive Navigator LockManager lock ... immediately failed"
 * khi React Strict Mode / nhiều tab / HMR tranh lock auth-token.
 */
const authLock = async <R>(
  _name: string,
  _acquireTimeout: number,
  fn: () => Promise<R>
): Promise<R> => fn()

/** Instance Supabase singleton */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    lock: authLock,
  },
})
