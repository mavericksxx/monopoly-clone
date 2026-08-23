/**
 * A private switch for playtesting, off for everyone who doesn't ask for it by URL:
 * put `?test=1` on the room link to open a test seat, `?test=0` to clear it.
 *
 * This is obscurity, not security — the product has no accounts, so there is nothing to
 * check a person against. That is acceptable because of what the switch actually unlocks:
 * seating several players from one browser (each tab keeps its own identity in
 * `sessionStorage` instead of the shared `localStorage`) and starting a game with a single
 * player. Neither reaches another room or another person's game.
 *
 * The flag itself lives in `sessionStorage`, so it dies with the tab. That matters: a flag
 * in `localStorage` would silently outlive the playtest, and the next REAL game played in
 * this browser would keep its seat per-tab too — close that tab mid-game and the seat is
 * unrecoverable, because a started room refuses a tokenless re-join. Per-tab means the
 * switch can only ever affect a tab that asked for it.
 *
 * Read once at import: the flag can only change by loading a URL, which reloads the app.
 */
const KEY = 'boardclone:test';

function read(): boolean {
  try {
    const param = new URLSearchParams(window.location.search).get('test');
    if (param === '1') window.sessionStorage.setItem(KEY, '1');
    if (param === '0') window.sessionStorage.removeItem(KEY);
    return window.sessionStorage.getItem(KEY) === '1';
  } catch {
    // Storage can throw in private browsing; test mode simply stays off.
    return false;
  }
}

const enabled = read();

export function isTestMode(): boolean {
  return enabled;
}
