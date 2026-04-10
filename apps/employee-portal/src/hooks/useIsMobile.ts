import { useState, useEffect } from 'react'

const MOBILE_QUERY = '(max-width: 640px)'

function getMatchMedia(): MediaQueryList | undefined {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia(MOBILE_QUERY)
  }
  return undefined
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => getMatchMedia()?.matches ?? false)

  useEffect(() => {
    const mql = getMatchMedia()
    if (!mql) return
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handler)
      return () => mql.removeEventListener('change', handler)
    }
    // Fallback for older Safari/iOS WebViews
    mql.addListener(handler)
    return () => mql.removeListener(handler)
  }, [])

  return isMobile
}
