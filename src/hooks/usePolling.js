import { useEffect, useRef } from 'react';

/** Calls `callback` every `intervalMs` while the tab is visible, and right away when it becomes visible again. */
export function usePolling(callback, intervalMs, enabled = true) {
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  });

  useEffect(() => {
    if (!enabled) return undefined;
    const tick = () => document.visibilityState === 'visible' && saved.current();
    const id = setInterval(tick, intervalMs);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [intervalMs, enabled]);
}
