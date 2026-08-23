import { useSyncExternalStore } from 'react';

/**
 * A private switch for playtesting: Ctrl+Alt+D turns it on and off, and it sticks in this
 * browser until turned off again. With it on, the lobby grows a Developer panel that seats
 * dummy players the host drives from their own tab, and lets a game start with one seat.
 *
 * This is obscurity, not security — the product has no accounts, so there is nothing to
 * check a person against, and anyone who learns the shortcut has it. That is acceptable
 * because of what it unlocks: extra seats in a room you host and already control. It
 * reaches no other room and no other person's game. It is also why the server checks
 * dummy ownership itself on every action rather than believing this flag.
 */
const KEY = 'boardclone:dev';

function read(): boolean {
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    // Storage can throw in private browsing; the switch simply stays off.
    return false;
  }
}

let enabled = read();
const listeners = new Set<() => void>();

export function setDevMode(next: boolean): void {
  if (next === enabled) return;
  enabled = next;
  try {
    if (next) window.localStorage.setItem(KEY, '1');
    else window.localStorage.removeItem(KEY);
  } catch {
    // Not persisting is survivable: the switch still works for this page.
  }
  for (const l of listeners) l();
}

// `code` rather than `key`: Alt+D emits "∂" on a Mac layout, so the character is no use.
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.altKey && e.code === 'KeyD') {
    e.preventDefault();
    setDevMode(!enabled);
  }
});

export function useDevMode(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => enabled,
  );
}
