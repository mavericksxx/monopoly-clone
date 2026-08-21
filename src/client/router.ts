import { useEffect, useState } from 'react';

/**
 * Minimal `history.pushState` router — no dependency, just enough for
 * `/` and `/<code>`. `pushState` doesn't fire `popstate` on its own, so
 * `navigate` notifies subscribers itself.
 */

type Listener = () => void;

const listeners = new Set<Listener>();

export function navigate(path: string): void {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
  }
  for (const l of listeners) l();
}

window.addEventListener('popstate', () => {
  for (const l of listeners) l();
});

export function useLocation(): string {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const listener = () => setPath(window.location.pathname);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return path;
}
