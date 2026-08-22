/**
 * End-to-end smoke test against a running room server. Run it after every deploy:
 *
 *   node scripts/smoke.mjs                 # defaults to the production Worker
 *   node scripts/smoke.mjs http://localhost:8787   # against `npx wrangler dev`
 *
 * The 89 unit tests cover the engine and the map data, but nothing in `src/server/`
 * — and both bugs found on the first live playtest lived in that seam rather than in
 * either side of it. This exercises the seam: Worker -> Durable Object -> two
 * independent WebSocket clients.
 */
const BASE = (process.argv[2] ?? 'https://boardclone.parthkohale.workers.dev').replace(/\/$/, '');
const WS = BASE.replace(/^http/, 'ws');

let failures = 0;
function check(ok, label) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures++;
}

async function newRoom() {
  const res = await fetch(`${BASE}/api/rooms`, { method: 'POST' });
  if (!res.ok) throw new Error(`POST /api/rooms -> ${res.status}`);
  return (await res.json()).code;
}

function connect(code, name) {
  const ws = new WebSocket(`${WS}/api/rooms/${code}/ws`);
  const c = { name, ws, playerId: null, seen: [], cursor: 0, waiter: null };
  ws.addEventListener('open', () => ws.send(JSON.stringify({ type: 'join', name })));
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (m.type === 'joined') c.playerId = m.playerId;
    c.seen.push(m);
    if (c.waiter) c.waiter();
  });
  return c;
}

/**
 * Resolves with the first message on `c` matching `pred`, INCLUDING messages that
 * already landed before this call — every client buffers everything it receives.
 *
 * Attaching a fresh listener per wait is not good enough: the server broadcasts the
 * new roster to the other players in the same tick it answers a join, so Alice's
 * two-player roster is delivered while the script is still awaiting Bob's `joined`
 * one microtask earlier. Against the deployed Worker network jitter hid that race;
 * against a local `wrangler dev` it loses every time.
 *
 * The cursor only moves forward, so each wait consumes the messages it scanned past.
 * That is what lets two waits with the same predicate (`type === 'room'`) mean
 * "the next roster" rather than both matching the same stale one. It also means the
 * waits on any one client must stay sequential — one pending `until` per client.
 */
function until(c, pred, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      c.waiter = null;
      reject(new Error(`${c.name}: timed out waiting for ${label}`));
    }, 10_000);
    const scan = () => {
      while (c.cursor < c.seen.length) {
        const m = c.seen[c.cursor++];
        if (!pred(m)) continue;
        clearTimeout(timer);
        c.waiter = null;
        resolve(m);
        return true;
      }
      return false;
    };
    if (!scan()) c.waiter = scan;
  });
}

const send = (c, msg) => c.ws.send(JSON.stringify(msg));
const act = (c, action) => send(c, { type: 'action', action });

async function playableGame() {
  const code = await newRoom();
  const a = connect(code, 'Alice');
  await until(a, m => m.type === 'joined', 'Alice joined');
  const b = connect(code, 'Bob');
  await until(b, m => m.type === 'joined', 'Bob joined');
  await until(a, m => m.type === 'room' && m.players.length === 2, 'a two-player roster');

  act(a, { type: 'start_game' });
  const started = await until(a, m => m.type === 'state', 'the started state');
  // `createGame` alone leaves the room in LOBBY; the server must also reduce `start_game`.
  // Without that, the room is flagged started but every action is refused forever.
  check(started.state.phase === 'AWAITING_ROLL', `game reaches AWAITING_ROLL (got ${started.state.phase})`);

  const onTurn = started.state.turnOrder[started.state.currentPlayerIndex];
  const roller = onTurn === a.playerId ? a : b;
  const waiter = roller === a ? b : a;

  act(waiter, { type: 'roll' });
  const refused = await until(waiter, m => m.type === 'error', 'an out-of-turn rejection');
  check(/not your turn/i.test(refused.message), `out-of-turn roll is refused (got "${refused.message}")`);

  act(roller, { type: 'roll' });
  const [ra, rb] = await Promise.all([
    until(a, m => m.type === 'state' && m.state.lastRoll, "Alice's copy of the roll"),
    until(b, m => m.type === 'state' && m.state.lastRoll, "Bob's copy of the roll"),
  ]);
  check(
    JSON.stringify(ra.state.lastRoll) === JSON.stringify(rb.state.lastRoll),
    `both clients see the same authoritative roll (${ra.state.lastRoll} / ${rb.state.lastRoll})`,
  );

  a.ws.close();
  b.ws.close();
}

async function presence() {
  const code = await newRoom();
  const a = connect(code, 'Alice');
  await until(a, m => m.type === 'joined', 'Alice joined');
  const b = connect(code, 'Bob');
  const joined = await until(b, m => m.type === 'joined', 'Bob joined');
  const roster = await until(a, m => m.type === 'room' && m.players.length === 2, 'a two-player roster');
  check(roster.players.every(p => p.connected), 'a second player does not knock the first offline');

  // Reconnecting closes the old socket, and that close lands after the new socket is
  // already online — so the player must stay online through it.
  const b2 = connect(code, 'Bob');
  b2.ws.addEventListener('open', () => send(b2, { type: 'join', name: 'Bob', token: joined.token }));
  const afterResume = await until(a, m => m.type === 'room', 'the roster after Bob reconnects');
  check(
    afterResume.players.find(p => p.name === 'Bob')?.connected === true,
    'a reconnect leaves the player online',
  );

  // A genuine disconnect, with no reconnect behind it, must still show as offline.
  const offline = until(a, m => m.type === 'room' && m.players.some(p => p.name === 'Bob' && !p.connected));
  b2.ws.close();
  await offline;
  check(true, 'a genuine disconnect still marks the player offline');

  a.ws.close();
}

console.log(`smoke: ${BASE}\n`);
await playableGame();
await presence();
console.log(failures === 0 ? '\nall checks passed' : `\n${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
