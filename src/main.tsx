/**
 * File: main.tsx
 * Trách nhiệm: Điểm vào Vite/React — mount App vào #root.
 * Liên quan: index.html, App.tsx, index.css.
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
