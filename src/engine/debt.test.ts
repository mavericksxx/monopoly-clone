import { describe, expect, it } from 'vitest';
import { createGame, reduce } from './index';
import { SMALL_MAP, dieVal, identityRng, queueRng, settingsFor } from './fixtures';
import { updatePlayer, updateTile } from './state';
import { applyCardEffect } from './landing';

const P1 = { id: 'p1', name: 'Ann', color: 'red' };
const P2 = { id: 'p2', name: 'Bo', color: 'blue' };
const P3 = { id: 'p3', name: 'Cy', color: 'green' };
const P4 = { id: 'p4', name: 'Di', color: 'yellow' };

function started(players = [P1, P2], overrides = {}) {
  const settings = settingsFor({ randomizePlayerOrder: false, ...overrides });
  let state = createGame(SMALL_MAP, players, settings, identityRng);
  state = reduce(SMALL_MAP, state, { playerId: players[0]!.id, action: { type: 'start_game' } }, identityRng).state;
  return state;
}

describe('RESOLVING_DEBT entry and liquidation', () => {
  it('opens RESOLVING_DEBT when the debtor cannot afford rent, and clears it once they sell enough', () => {
    let state = started();
    state = updateTile(state, 3, { owner: 'p2', houses: 0 }); // p2 owns tile3
    // Give p1 a Charlie group (12,13,15,17) with some houses to liquidate, but almost no cash.
    for (const i of [12, 13, 15, 17]) state = updateTile(state, i, { owner: 'p1', houses: 2 });
    state = updatePlayer(state, 'p1', { cash: 1 });

    const r = reduce(SMALL_MAP, state, { playerId: 'p1', action: { type: 'roll' } }, queueRng([dieVal(1), dieVal(2)])); // lands on tile3, owes rent
    expect(r.state.phase).toBe('RESOLVING_DEBT');
    expect(r.state.debt).not.toBeNull();
    expect(r.state.debt!.debtor).toBe('p1');
    expect(r.state.debt!.creditor).toBe('p2');
    expect(r.events.some((e) => e.type === 'debt_opened')).toBe(true);

    // Sell enough houses to cover the debt.
    let s = r.state;
    let cleared = false;
    for (const i of [12, 13, 15, 17, 12, 13, 15, 17]) {
      if (s.phase !== 'RESOLVING_DEBT') break;
      const sell = reduce(SMALL_MAP, s, { playerId: 'p1', action: { type: 'sell_house', tileIndex: i } }, identityRng);
      if (!sell.error) s = sell.state;
      if (s.phase !== 'RESOLVING_DEBT') cleared = true;
    }
    expect(cleared).toBe(true);
    expect(s.phase).not.toBe('RESOLVING_DEBT');
    expect(s.debt).toBeNull();
    expect(s.players.find((p) => p.id === 'p1')!.cash).toBeGreaterThanOrEqual(0);
  });

  it('cannot build (buy_house) while resolving debt, only sell', () => {
    let state = started();
    state = updateTile(state, 3, { owner: 'p2' });
    for (const i of [12, 13, 15, 17]) state = updateTile(state, i, { owner: 'p1', houses: 1 });
    state = updatePlayer(state, 'p1', { cash: 1 });
    const r = reduce(SMALL_MAP, state, { playerId: 'p1', action: { type: 'roll' } }, queueRng([dieVal(1), dieVal(2)]));
    expect(r.state.phase).toBe('RESOLVING_DEBT');
    const buy = reduce(SMALL_MAP, r.state, { playerId: 'p1', action: { type: 'buy_house', tileIndex: 12 } }, identityRng);
    expect(buy.error).toBeTruthy();
    expect(buy.state).toBe(r.state);
  });

  it('auto-bankrupts the debtor to the creditor when liquidation could never cover the debt', () => {
    let state = started();
    state = updateTile(state, 3, { owner: 'p2', houses: 4 }); // steep rent
    state = updatePlayer(state, 'p1', { cash: 1 }); // p1 owns nothing to liquidate
    const creditorCashBefore = state.players.find((p) => p.id === 'p2')!.cash;

    const r = reduce(SMALL_MAP, state, { playerId: 'p1', action: { type: 'roll' } }, queueRng([dieVal(1), dieVal(2)]));
    const debtor = r.state.players.find((p) => p.id === 'p1')!;
    expect(debtor.bankrupt).toBe(true);
    expect(debtor.cash).toBe(0);
    expect(r.events.some((e) => e.type === 'bankrupt' && e.creditor === 'p2')).toBe(true);
    // With p1 out, p2 is the last player standing.
    expect(r.state.phase).toBe('GAME_OVER');
    expect(r.state.winner).toBe('p2');
    const creditorAfter = r.state.players.find((p) => p.id === 'p2')!;
    expect(creditorAfter.cash).toBeGreaterThan(creditorCashBefore);
  });
});

describe('multi-creditor debt in turn order (SPEC decision 13)', () => {
  it('pays creditors in turn order, bankrupts to the first one it cannot fully pay, and later queued creditors get nothing', () => {
    // Four players. p1 (current) owes p2, p3 and p4 (in that turn order) via a money_from_each(-N)
    // card effect — tested directly through applyCardEffect since that is the exact mechanism this
    // path uses. p1 can fully pay p2 (first), goes short on p3 (second) and bankrupts there, so p4
    // (queued third) must get nothing at all.
    let state = started([P1, P2, P3, P4]);
    state = updatePlayer(state, 'p1', { cash: 150 }); // covers p2 (100) fully, then only 50 left for p3 (100)
    const p2Before = state.players.find((p) => p.id === 'p2')!.cash;
    const p4Before = state.players.find((p) => p.id === 'p4')!.cash;

    const result = applyCardEffect(SMALL_MAP, state, 'p1', { kind: 'money_from_each', amount: -100 }, []);

    const p1 = result.state.players.find((p) => p.id === 'p1')!;
    expect(p1.bankrupt).toBe(true);
    const p2 = result.state.players.find((p) => p.id === 'p2')!;
    const p4 = result.state.players.find((p) => p.id === 'p4')!;
    // p2 (first) got paid in full; p4 (queued behind the one that actually triggers bankruptcy) gets nothing.
    expect(p2.cash).toBe(p2Before + 100);
    expect(p4.cash).toBe(p4Before);
    expect(result.events.some((e) => e.type === 'bankrupt' && e.creditor === 'p3')).toBe(true);
  });
});

describe('voluntary concession', () => {
  it('routes to the Bank even when the conceding player has no active debt', () => {
    let state = started();
    state = updateTile(state, 3, { owner: 'p1', houses: 2 });
    const r = reduce(SMALL_MAP, state, { playerId: 'p1', action: { type: 'declare_bankruptcy' } }, identityRng);
    expect(r.error).toBeUndefined();
    const p1 = r.state.players.find((p) => p.id === 'p1')!;
    expect(p1.bankrupt).toBe(true);
    expect(p1.cash).toBe(0);
    expect(r.state.tiles[3]!.owner).toBeNull(); // to the Bank, not to p2 — no kingmaking gift
    expect(r.events.some((e) => e.type === 'bankrupt' && e.creditor === null)).toBe(true);
    expect(r.state.phase).toBe('GAME_OVER');
    expect(r.state.winner).toBe('p2');
  });

  it('a non-current player may also concede, without disturbing whose turn it is', () => {
    let state = started([P1, P2, P3]);
    const before = state.currentPlayerIndex;
    const r = reduce(SMALL_MAP, state, { playerId: 'p3', action: { type: 'declare_bankruptcy' } }, identityRng);
    expect(r.error).toBeUndefined();
    expect(r.state.players.find((p) => p.id === 'p3')!.bankrupt).toBe(true);
    expect(r.state.currentPlayerIndex).toBe(before);
    expect(r.state.phase).not.toBe('GAME_OVER'); // two players remain
  });
});
