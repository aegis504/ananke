import { useState, useEffect } from 'react'
export function useTheme() {
  const [dark, setDark] = useState(() => { if (typeof window === 'undefined') return false; const s = localStorage.getItem('ananke-theme'); if (s) return s === 'dark'; return window.matchMedia('(prefers-color-scheme: dark)').matches })
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('ananke-theme', dark ? 'dark' : 'light') }, [dark])
  return { dark, toggle: () => setDark(p => !p) }
}
