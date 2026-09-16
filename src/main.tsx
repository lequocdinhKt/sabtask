/**
 * File: main.tsx
 * Mục đích: Điểm vào (entry point) của ứng dụng SabTask khi chạy bằng Vite.
 * File nạp stylesheet toàn cục rồi tạo React root trên thẻ có id "root" trong index.html
 * và render component App bên trong StrictMode.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
