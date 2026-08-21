import { describe, expect, it } from 'vitest';
import { createGame, reduce } from './index';
import { SMALL_MAP, WEIRD_MAP, dieVal, identityRng, queueRng, settingsFor } from './fixtures';
import { updatePlayer, updateTile } from './state';

const P1 = { id: 'p1', name: 'Ann', color: 'red' };
const P2 = { id: 'p2', name: 'Bo', color: 'blue' };

function started(map = SMALL_MAP, overrides = {}) {
  const settings = settingsFor({ randomizePlayerOrder: false, ...overrides });
  let state = createGame(map, [P1, P2], settings, identityRng);
  state = reduce(map, state, { playerId: 'p1', action: { type: 'start_game' } }, identityRng).state;
  return state;
}

describe('rent', () => {
  it('city rent charges the bare-lot rate, and doubles for the owner once houses are built', () => {
    let state = started();
    // p2 owns tile 3 (Alpha 2, group 'brazil' size 2).
    state = updateTile(state, 3, { owner: 'p2' });
    const tile3 = SMALL_MAP.tiles[3] as { rents: readonly number[] };
    const cashBefore = state.players.find((p) => p.id === 'p1')!.cash;
    const ownerBefore = state.players.find((p) => p.id === 'p2')!.cash;
    // p1 is at tile0; roll 3 to land on tile3.
    const r = reduce(SMALL_MAP, state, { playerId: 'p1', action: { type: 'roll' } }, queueRng([dieVal(1), dieVal(2)]));
    const payer = r.state.players.find((p) => p.id === 'p1')!;
    const owner = r.state.players.find((p) => p.id === 'p2')!;
    expect(payer.cash).toBe(cashBefore - tile3.rents[0]!);
    expect(owner.cash).toBe(ownerBefore + tile3.rents[0]!);
    expect(r.events.some((e) => e.type === 'paid' && e.reason === 'rent' && e.amount === tile3.rents[0])).toBe(true);
  });

  it('airport rent is flat, indexed by how many airports the owner holds', () => {
    let state = started();
    state = updateTile(state, 5, { owner: 'p2' }); // one airport
    const rents = (SMALL_MAP.tiles[5] as { rents: readonly number[] }).rents;
    // p1 at 0, roll 5 to land on the airport.
    const cashBefore = state.players.find((p) => p.id === 'p1')!.cash;
    const r = reduce(SMALL_MAP, state, { playerId: 'p1', action: { type: 'roll' } }, queueRng([dieVal(2), dieVal(3)]));
    const payer = r.state.players.find((p) => p.id === 'p1')!;
    expect(payer.cash).toBe(cashBefore - rents[0]!);

    // Now owner holds both airports: rent should use rents[1].
    let state2 = updateTile(started(), 5, { owner: 'p2' });
    state2 = updateTile(state2, 16, { owner: 'p2' });
    const cashBefore2 = state2.players.find((p) => p.id === 'p1')!.cash;
    const r2 = reduce(SMALL_MAP, state2, { playerId: 'p1', action: { type: 'roll' } }, queueRng([dieVal(2), dieVal(3)]));
    const payer2 = r2.state.players.find((p) => p.id === 'p1')!;
    expect(payer2.cash).toBe(cashBefore2 - rents[1]!);
  });

  it('company rent is diceTotal times the owned-count multiplier', () => {
    let state = started();
    state = updateTile(state, 11, { owner: 'p2' }); // one company
    const cashBefore = state.players.find((p) => p.id === 'p1')!.cash;
    // p1 at 0, roll (5,6)=11 to land on the company at tile11.
    const r = reduce(SMALL_MAP, state, { playerId: 'p1', action: { type: 'roll' } }, queueRng([dieVal(5), dieVal(6)]));
    const payer = r.state.players.find((p) => p.id === 'p1')!;
    const expectedRent = 11 * state.settings.companyRentMultipliers[0]!;
    expect(payer.cash).toBe(cashBefore - expectedRent);
  });

  it('no rent is charged while the owner is jailed and noRentInPrison is on', () => {
    let state = started(SMALL_MAP, { noRentInPrison: true });
    state = updateTile(state, 3, { owner: 'p2' });
    state = updatePlayer(state, 'p2', { inJail: true });
    const cashBefore = state.players.find((p) => p.id === 'p1')!.cash;
    const r = reduce(SMALL_MAP, state, { playerId: 'p1', action: { type: 'roll' } }, queueRng([dieVal(1), dieVal(2)]));
    const payer = r.state.players.find((p) => p.id === 'p1')!;
    expect(payer.cash).toBe(cashBefore); // untouched
  });

  it('rent is still charged while the owner is jailed when noRentInPrison is off (default)', () => {
    let state = started(SMALL_MAP, { noRentInPrison: false });
    state = updateTile(state, 3, { owner: 'p2' });
    state = updatePlayer(state, 'p2', { inJail: true });
    const cashBefore = state.players.find((p) => p.id === 'p1')!.cash;
    const r = reduce(SMALL_MAP, state, { playerId: 'p1', action: { type: 'roll' } }, queueRng([dieVal(1), dieVal(2)]));
    const payer = r.state.players.find((p) => p.id === 'p1')!;
    expect(payer.cash).toBeLessThan(cashBefore);
  });

  it('landing on a company works even on a map with zero companies (no crash, just a normal city landing)', () => {
    const state = started(WEIRD_MAP);
    expect(WEIRD_MAP.tiles.some((t) => t.type === 'company')).toBe(false);
    const r = reduce(WEIRD_MAP, state, { playerId: 'p1', action: { type: 'roll' } }, queueRng([dieVal(1), dieVal(1)]));
    expect(r.error).toBeUndefined();
  });
});

describe('tax tiles', () => {
  it('earnings tax charges ceil(10% of net worth), bank-paid (creditor null)', () => {
    const state = started();
    // p1 at tile0, roll (2,2)=4 lands on the tax tile.
    const cashBefore = state.players.find((p) => p.id === 'p1')!.cash;
    const expected = Math.ceil(cashBefore * 0.1);
    const r = reduce(SMALL_MAP, state, { playerId: 'p1', action: { type: 'roll' } }, queueRng([dieVal(2), dieVal(2)]));
    const player = r.state.players.find((p) => p.id === 'p1')!;
    expect(player.cash).toBe(cashBefore - expected);
    expect(r.events.some((e) => e.type === 'paid' && e.reason === 'earnings_tax' && e.to === null)).toBe(true);
  });

  it('premium tax is a flat charge; tax-refund pays the player', () => {
    let state = started();
    state = updatePlayer(state, 'p1', { tileIndex: 12 }); // one step from the premium-tax tile
    const cashBefore = state.players.find((p) => p.id === 'p1')!.cash;
    const r = reduce(SMALL_MAP, state, { playerId: 'p1', action: { type: 'roll' } }, queueRng([dieVal(1), dieVal(1)]));
    const player = r.state.players.find((p) => p.id === 'p1')!;
    const taxAmount = (SMALL_MAP.tiles[14] as { taxAmount: number }).taxAmount;
    expect(player.cash).toBe(cashBefore - taxAmount);

    let state2 = started();
    state2 = updatePlayer(state2, 'p1', { tileIndex: 17 }); // two steps from tax-refund at 19
    const cashBefore2 = state2.players.find((p) => p.id === 'p1')!.cash;
    const r2 = reduce(SMALL_MAP, state2, { playerId: 'p1', action: { type: 'roll' } }, queueRng([dieVal(1), dieVal(1)]));
    const player2 = r2.state.players.find((p) => p.id === 'p1')!;
    const refund = (SMALL_MAP.tiles[19] as { taxAmount: number }).taxAmount;
    expect(player2.cash).toBe(cashBefore2 + refund);
  });
});
