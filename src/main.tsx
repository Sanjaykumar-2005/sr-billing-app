import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const storedTheme = window.localStorage.getItem('sr-theme')
let theme = 'dark'
if (storedTheme) {
  try {
    theme = JSON.parse(storedTheme)?.state?.theme === 'light' ? 'light' : 'dark'
  } catch {
    theme = 'dark'
  }
}
document.documentElement.classList.toggle('dark', theme !== 'light')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
