import { describe, expect, it } from 'vitest';
import { createGame, reduce } from './index';
import { SMALL_MAP } from './fixtures';
import { dieVal, identityRng, queueRng, settingsFor } from './fixtures';
import { walkForward } from './state';

const P1 = { id: 'p1', name: 'Ann', color: 'red' };
const P2 = { id: 'p2', name: 'Bo', color: 'blue' };

function startedGame(overrides = {}) {
  const settings = settingsFor({ randomizePlayerOrder: false, ...overrides });
  const state = createGame(SMALL_MAP, [P1, P2], settings, identityRng);
  const { state: started } = reduce(SMALL_MAP, state, { playerId: 'p1', action: { type: 'start_game' } }, identityRng);
  return started;
}

describe('createGame / start_game', () => {
  it('starts in LOBBY, both players seated at start with starting cash', () => {
    const state = createGame(SMALL_MAP, [P1, P2], settingsFor(), identityRng);
    expect(state.phase).toBe('LOBBY');
    expect(state.players).toHaveLength(2);
    for (const p of state.players) {
      expect(p.cash).toBe(state.settings.startingCash);
      expect(p.tileIndex).toBe(SMALL_MAP.startIndex);
    }
  });

  it('start_game moves to AWAITING_ROLL for the first player in turn order', () => {
    const started = startedGame();
    expect(started.phase).toBe('AWAITING_ROLL');
    expect(started.turnOrder[started.currentPlayerIndex]).toBe(started.turnOrder[0]);
  });

  it('rejects start_game from a non-existent player without mutating state', () => {
    const state = createGame(SMALL_MAP, [P1, P2], settingsFor(), identityRng);
    const r = reduce(SMALL_MAP, state, { playerId: 'ghost', action: { type: 'start_game' } }, identityRng);
    expect(r.error).toBeTruthy();
    expect(r.state).toBe(state);
  });
});

describe('roll / move / buy / decline', () => {
  it('a non-double roll moves the player and offers a buy on an unowned tile', () => {
    const started = startedGame();
    const currentId = started.turnOrder[started.currentPlayerIndex]!;
    // 1+2 = 3 spaces from START lands on tile 3 (unowned city)
    const rng = queueRng([dieVal(1), dieVal(2)]);
    const r = reduce(SMALL_MAP, started, { playerId: currentId, action: { type: 'roll' } }, rng);
    expect(r.error).toBeUndefined();
    expect(r.state.phase).toBe('AWAITING_BUY');
    const player = r.state.players.find((p) => p.id === currentId)!;
    expect(player.tileIndex).toBe(3);
    expect(r.events.some((e) => e.type === 'rolled')).toBe(true);
    expect(r.events.some((e) => e.type === 'moved')).toBe(true);
  });

  it('buy transfers cash and ownership; decline leaves the tile unowned', () => {
    const started = startedGame();
    const currentId = started.turnOrder[started.currentPlayerIndex]!;
    const rolled = reduce(SMALL_MAP, started, { playerId: currentId, action: { type: 'roll' } }, queueRng([dieVal(1), dieVal(2)])).state;

    const bought = reduce(SMALL_MAP, rolled, { playerId: currentId, action: { type: 'buy' } }, identityRng);
    expect(bought.error).toBeUndefined();
    expect(bought.state.tiles[3]!.owner).toBe(currentId);
    const price = (SMALL_MAP.tiles[3] as { price: number }).price;
    const buyerCashAfter = bought.state.players.find((p) => p.id === currentId)!.cash;
    expect(buyerCashAfter).toBe(started.settings.startingCash - price);
    expect(bought.state.phase).toBe('AWAITING_END_TURN');

    // Decline path from a fresh identical roll: tile stays unowned.
    const declined = reduce(SMALL_MAP, rolled, { playerId: currentId, action: { type: 'decline_buy' } }, identityRng);
    expect(declined.state.tiles[3]!.owner).toBeNull();
    expect(declined.state.phase).toBe('AWAITING_END_TURN');
  });

  it('rejects rolling out of turn, leaving state unchanged', () => {
    const started = startedGame();
    const other = started.turnOrder[(started.currentPlayerIndex + 1) % started.turnOrder.length]!;
    const r = reduce(SMALL_MAP, started, { playerId: other, action: { type: 'roll' } }, queueRng([dieVal(3), dieVal(4)]));
    expect(r.error).toBeTruthy();
    expect(r.state).toBe(started);
  });

  it('walkForward flags passedStart both when wrapping past START and when landing exactly on it', () => {
    const past = walkForward(SMALL_MAP, 21, 2); // 21 -> 1, wraps through 0
    expect(past).toEqual({ to: 1, passedStart: true });
    const exact = walkForward(SMALL_MAP, 20, 2); // 20 -> 0 exactly
    expect(exact).toEqual({ to: 0, passedStart: true });
    const neither = walkForward(SMALL_MAP, 1, 2); // 1 -> 3, nowhere near START
    expect(neither).toEqual({ to: 3, passedStart: false });
  });

  it('landing exactly on START via a card pays the flat salary once (no bonus for exactness)', () => {
    const started = startedGame();
    const currentId = started.turnOrder[started.currentPlayerIndex]!;
    const cashBefore = started.players.find((p) => p.id === currentId)!.cash;
    // (1,1): tile0 -> tile2 (treasure). With the deck unshuffled (identityRng), the first card is
    // treasure-01: move_to(0, collectStart:true) — teleports back to START and pays salary once.
    const r = reduce(SMALL_MAP, started, { playerId: currentId, action: { type: 'roll' } }, queueRng([dieVal(1), dieVal(1)]));
    const player = r.state.players.find((p) => p.id === currentId)!;
    expect(player.tileIndex).toBe(0);
    expect(player.cash).toBe(cashBefore + r.state.settings.startSalary);
    expect(r.events.some((e) => e.type === 'card_drawn')).toBe(true);
  });
});

describe('doubles', () => {
  it('rolling doubles grants an immediate reroll (AWAITING_ROLL again)', () => {
    const started = startedGame();
    const currentId = started.turnOrder[started.currentPlayerIndex]!;
    // (2,2): tile0 -> tile4, the tax bonus tile (non-ownable, so no buy prompt intervenes).
    const r = reduce(SMALL_MAP, started, { playerId: currentId, action: { type: 'roll' } }, queueRng([dieVal(2), dieVal(2)]));
    expect(r.state.phase).toBe('AWAITING_ROLL');
    expect(r.state.doublesCount).toBe(1);
  });

  it('three consecutive doubles sends the player to jail with no landing resolution', () => {
    const started = startedGame();
    const currentId = started.turnOrder[started.currentPlayerIndex]!;
    let state = started;
    let events;
    // (2,2): tile0 -> tile4 (tax, non-ownable).
    ({ state, events } = reduce(SMALL_MAP, state, { playerId: currentId, action: { type: 'roll' } }, queueRng([dieVal(2), dieVal(2)])));
    expect(state.phase).toBe('AWAITING_ROLL');
    // (5,5): tile4 -> tile14 (premium-tax, non-ownable).
    ({ state, events } = reduce(SMALL_MAP, state, { playerId: currentId, action: { type: 'roll' } }, queueRng([dieVal(5), dieVal(5)])));
    expect(state.phase).toBe('AWAITING_ROLL');
    // Third double: sent to jail with no landing resolution, regardless of what tile it would be.
    ({ state, events } = reduce(SMALL_MAP, state, { playerId: currentId, action: { type: 'roll' } }, queueRng([dieVal(6), dieVal(6)])));
    expect(state.phase).toBe('AWAITING_END_TURN');
    const player = state.players.find((p) => p.id === currentId)!;
    expect(player.inJail).toBe(true);
    expect(player.tileIndex).toBe(SMALL_MAP.jailIndex);
    expect(events.some((e) => e.type === 'jailed' && e.reason === 'doubles')).toBe(true);
    // No 'bought'/'moved' landing-resolution event from this third roll.
    expect(events.some((e) => e.type === 'moved')).toBe(false);
  });
});

describe('jail', () => {
  function jailedState() {
    const started = startedGame();
    const currentId = started.turnOrder[started.currentPlayerIndex]!;
    let state = started;
    ({ state } = reduce(SMALL_MAP, state, { playerId: currentId, action: { type: 'roll' } }, queueRng([dieVal(2), dieVal(2)])));
    ({ state } = reduce(SMALL_MAP, state, { playerId: currentId, action: { type: 'roll' } }, queueRng([dieVal(5), dieVal(5)])));
    ({ state } = reduce(SMALL_MAP, state, { playerId: currentId, action: { type: 'roll' } }, queueRng([dieVal(6), dieVal(6)])));
    ({ state } = reduce(SMALL_MAP, state, { playerId: currentId, action: { type: 'end_turn' } }, identityRng));
    return { state, jailedId: currentId };
  }

  it('pay_jail_fee releases immediately and the next roll moves normally', () => {
    let { state, jailedId } = jailedState();
    // advance turns back around to the jailed player
    while (state.turnOrder[state.currentPlayerIndex] !== jailedId) {
      state = reduce(SMALL_MAP, state, { playerId: state.turnOrder[state.currentPlayerIndex]!, action: { type: 'roll' } }, queueRng([dieVal(1), dieVal(2)])).state;
      if (state.phase === 'AWAITING_BUY') state = reduce(SMALL_MAP, state, { playerId: state.turnOrder[state.currentPlayerIndex]!, action: { type: 'decline_buy' } }, identityRng).state;
      if (state.phase === 'AWAITING_END_TURN') state = reduce(SMALL_MAP, state, { playerId: state.turnOrder[state.currentPlayerIndex]!, action: { type: 'end_turn' } }, identityRng).state;
    }
    const before = state.players.find((p) => p.id === jailedId)!;
    expect(before.inJail).toBe(true);
    const r = reduce(SMALL_MAP, state, { playerId: jailedId, action: { type: 'pay_jail_fee' } }, identityRng);
    expect(r.error).toBeUndefined();
    const after = r.state.players.find((p) => p.id === jailedId)!;
    expect(after.inJail).toBe(false);
    expect(after.cash).toBe(before.cash - state.settings.jailFee);
    expect(r.state.phase).toBe('AWAITING_ROLL');
  });

  it('rolling doubles in jail escapes but never grants a bonus reroll', () => {
    let { state, jailedId } = jailedState();
    while (state.turnOrder[state.currentPlayerIndex] !== jailedId) {
      state = reduce(SMALL_MAP, state, { playerId: state.turnOrder[state.currentPlayerIndex]!, action: { type: 'roll' } }, queueRng([dieVal(1), dieVal(2)])).state;
      if (state.phase === 'AWAITING_BUY') state = reduce(SMALL_MAP, state, { playerId: state.turnOrder[state.currentPlayerIndex]!, action: { type: 'decline_buy' } }, identityRng).state;
      if (state.phase === 'AWAITING_END_TURN') state = reduce(SMALL_MAP, state, { playerId: state.turnOrder[state.currentPlayerIndex]!, action: { type: 'end_turn' } }, identityRng).state;
    }
    // From jail (tile 7), (3,3) lands on tile 13 — an unowned city, so a normal buy prompt is
    // still owed (escaping jail still resolves the landed tile). Decline it, then the turn ends —
    // no bonus reroll for escaping jail via doubles.
    let r = reduce(SMALL_MAP, state, { playerId: jailedId, action: { type: 'roll' } }, queueRng([dieVal(3), dieVal(3)]));
    const player = r.state.players.find((p) => p.id === jailedId)!;
    expect(player.inJail).toBe(false);
    expect(r.events.some((e) => e.type === 'left_jail' && e.how === 'doubles')).toBe(true);
    expect(r.state.phase).toBe('AWAITING_BUY');
    r = reduce(SMALL_MAP, r.state, { playerId: jailedId, action: { type: 'decline_buy' } }, identityRng);
    expect(r.state.phase).toBe('AWAITING_END_TURN');
  });

  it('three failed attempts force-pays the fee and moves on the third roll', () => {
    let { state, jailedId } = jailedState();
    while (state.turnOrder[state.currentPlayerIndex] !== jailedId) {
      state = reduce(SMALL_MAP, state, { playerId: state.turnOrder[state.currentPlayerIndex]!, action: { type: 'roll' } }, queueRng([dieVal(1), dieVal(2)])).state;
      if (state.phase === 'AWAITING_BUY') state = reduce(SMALL_MAP, state, { playerId: state.turnOrder[state.currentPlayerIndex]!, action: { type: 'decline_buy' } }, identityRng).state;
      if (state.phase === 'AWAITING_END_TURN') state = reduce(SMALL_MAP, state, { playerId: state.turnOrder[state.currentPlayerIndex]!, action: { type: 'end_turn' } }, identityRng).state;
    }
    const cashBefore = state.players.find((p) => p.id === jailedId)!.cash;
    // Three non-double attempts.
    let r = reduce(SMALL_MAP, state, { playerId: jailedId, action: { type: 'roll' } }, queueRng([dieVal(1), dieVal(2)]));
    expect(r.state.players.find((p) => p.id === jailedId)!.inJail).toBe(true);
    expect(r.state.phase).toBe('AWAITING_END_TURN');
    r = reduce(SMALL_MAP, r.state, { playerId: jailedId, action: { type: 'end_turn' } }, identityRng);
    while (r.state.turnOrder[r.state.currentPlayerIndex] !== jailedId) {
      const cur = r.state.turnOrder[r.state.currentPlayerIndex]!;
      r = reduce(SMALL_MAP, r.state, { playerId: cur, action: { type: 'roll' } }, queueRng([dieVal(1), dieVal(2)]));
      if (r.state.phase === 'AWAITING_BUY') r = reduce(SMALL_MAP, r.state, { playerId: cur, action: { type: 'decline_buy' } }, identityRng);
      if (r.state.phase === 'AWAITING_END_TURN') r = reduce(SMALL_MAP, r.state, { playerId: cur, action: { type: 'end_turn' } }, identityRng);
    }
    r = reduce(SMALL_MAP, r.state, { playerId: jailedId, action: { type: 'roll' } }, queueRng([dieVal(1), dieVal(2)]));
    r = reduce(SMALL_MAP, r.state, { playerId: jailedId, action: { type: 'end_turn' } }, identityRng);
    while (r.state.turnOrder[r.state.currentPlayerIndex] !== jailedId) {
      const cur = r.state.turnOrder[r.state.currentPlayerIndex]!;
      r = reduce(SMALL_MAP, r.state, { playerId: cur, action: { type: 'roll' } }, queueRng([dieVal(1), dieVal(2)]));
      if (r.state.phase === 'AWAITING_BUY') r = reduce(SMALL_MAP, r.state, { playerId: cur, action: { type: 'decline_buy' } }, identityRng);
      if (r.state.phase === 'AWAITING_END_TURN') r = reduce(SMALL_MAP, r.state, { playerId: cur, action: { type: 'end_turn' } }, identityRng);
    }
    // Third attempt: forced exit + move.
    const third = reduce(SMALL_MAP, r.state, { playerId: jailedId, action: { type: 'roll' } }, queueRng([dieVal(1), dieVal(2)]));
    const player = third.state.players.find((p) => p.id === jailedId)!;
    expect(player.inJail).toBe(false);
    expect(player.jailTurns).toBe(0);
    expect(player.tileIndex).toBe((SMALL_MAP.jailIndex + 3) % SMALL_MAP.tiles.length);
    expect(third.events.some((e) => e.type === 'left_jail' && e.how === 'served')).toBe(true);
    expect(player.cash).toBe(cashBefore - state.settings.jailFee);
  });
});

describe('determinism', () => {
  it('same seed and same action sequence produce identical resulting state', () => {
    const settings = settingsFor({ randomizePlayerOrder: false });

    function run(seed: number) {
      let n = seed;
      const rng = () => {
        // simple deterministic LCG, seeded identically across both runs
        n = (n * 1103515245 + 12345) & 0x7fffffff;
        return (n % 10000) / 10000;
      };
      let state = createGame(SMALL_MAP, [P1, P2], settings, rng);
      state = reduce(SMALL_MAP, state, { playerId: 'p1', action: { type: 'start_game' } }, rng).state;
      for (let i = 0; i < 15; i++) {
        const cur = state.turnOrder[state.currentPlayerIndex]!;
        if (state.phase === 'AWAITING_ROLL') {
          state = reduce(SMALL_MAP, state, { playerId: cur, action: { type: 'roll' } }, rng).state;
        } else if (state.phase === 'AWAITING_BUY') {
          state = reduce(SMALL_MAP, state, { playerId: cur, action: { type: 'decline_buy' } }, rng).state;
        } else if (state.phase === 'AWAITING_END_TURN') {
          state = reduce(SMALL_MAP, state, { playerId: cur, action: { type: 'end_turn' } }, rng).state;
        } else {
          break;
        }
      }
      return state;
    }

    const a = run(42);
    const b = run(42);
    expect(a).toEqual(b);
  });
});
