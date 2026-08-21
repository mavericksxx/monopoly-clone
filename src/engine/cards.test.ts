import { describe, expect, it } from 'vitest';
import { createGame, reduce } from './index';
import { SMALL_MAP, WEIRD_MAP, identityRng, settingsFor } from './fixtures';
import { applyCardEffect } from './landing';
import { updatePlayer, updateTile } from './state';

const P1 = { id: 'p1', name: 'Ann', color: 'red' };
const P2 = { id: 'p2', name: 'Bo', color: 'blue' };

function started(map = SMALL_MAP) {
  const settings = settingsFor({ randomizePlayerOrder: false });
  let state = createGame(map, [P1, P2], settings, identityRng);
  state = reduce(map, state, { playerId: 'p1', action: { type: 'start_game' } }, identityRng).state;
  return state;
}

describe('applyCardEffect', () => {
  it('money: positive pays the player from the Bank', () => {
    const state = started();
    const before = state.players.find((p) => p.id === 'p1')!.cash;
    const r = applyCardEffect(SMALL_MAP, state, 'p1', { kind: 'money', amount: 75 }, []);
    expect(r.state.players.find((p) => p.id === 'p1')!.cash).toBe(before + 75);
  });

  it('money: negative charges the player, or opens a debt if unaffordable', () => {
    const state = started();
    const before = state.players.find((p) => p.id === 'p1')!.cash;
    const r = applyCardEffect(SMALL_MAP, state, 'p1', { kind: 'money', amount: -75 }, []);
    expect(r.state.players.find((p) => p.id === 'p1')!.cash).toBe(before - 75);

    // Cash-poor but with buildings to liquidate: should block in RESOLVING_DEBT, not auto-bankrupt.
    let poor = updatePlayer(state, 'p1', { cash: 10 });
    for (const i of [12, 13, 15, 17]) poor = updateTile(poor, i, { owner: 'p1', houses: 2 });
    const r2 = applyCardEffect(SMALL_MAP, poor, 'p1', { kind: 'money', amount: -50 }, []);
    expect(r2.state.phase).toBe('RESOLVING_DEBT');
    expect(r2.state.debt!.creditor).toBeNull();
  });

  it('money_from_each: positive collects from every other active player, capped at what each can pay', () => {
    let state = started();
    state = updatePlayer(state, 'p2', { cash: 30 });
    const p1Before = state.players.find((p) => p.id === 'p1')!.cash;
    const r = applyCardEffect(SMALL_MAP, state, 'p1', { kind: 'money_from_each', amount: 50 }, []);
    const p1 = r.state.players.find((p) => p.id === 'p1')!;
    const p2 = r.state.players.find((p) => p.id === 'p2')!;
    expect(p2.cash).toBe(0); // paid everything they had, not forgiven
    expect(p1.cash).toBe(p1Before + 30); // creditor only ever receives what was actually collected
  });

  it('money_from_each: negative pays every other active player (SPEC decision 13 path)', () => {
    const state = started();
    const p1Before = state.players.find((p) => p.id === 'p1')!.cash;
    const p2Before = state.players.find((p) => p.id === 'p2')!.cash;
    const r = applyCardEffect(SMALL_MAP, state, 'p1', { kind: 'money_from_each', amount: -50 }, []);
    expect(r.state.players.find((p) => p.id === 'p1')!.cash).toBe(p1Before - 50);
    expect(r.state.players.find((p) => p.id === 'p2')!.cash).toBe(p2Before + 50);
  });

  it('go_to_jail sends the player to the map jail tile with no landing resolution', () => {
    const state = started();
    const r = applyCardEffect(SMALL_MAP, state, 'p1', { kind: 'go_to_jail' }, []);
    const p1 = r.state.players.find((p) => p.id === 'p1')!;
    expect(p1.inJail).toBe(true);
    expect(p1.tileIndex).toBe(SMALL_MAP.jailIndex);
    expect(r.state.phase).toBe('AWAITING_END_TURN');
    expect(r.events.some((e) => e.type === 'jailed' && e.reason === 'card')).toBe(true);
  });

  it('pardon grants a Get Out of Jail Free card', () => {
    const state = started();
    const r = applyCardEffect(SMALL_MAP, state, 'p1', { kind: 'pardon' }, []);
    expect(r.state.players.find((p) => p.id === 'p1')!.pardonCards).toBe(1);
  });

  it('repairs charges perHouse/perHotel across every owned house and hotel', () => {
    let state = started();
    state = updateTile(state, 1, { owner: 'p1', houses: 3 });
    state = updateTile(state, 3, { owner: 'p1', hotel: true, houses: 0 });
    const before = state.players.find((p) => p.id === 'p1')!.cash;
    const r = applyCardEffect(SMALL_MAP, state, 'p1', { kind: 'repairs', perHouse: 25, perHotel: 100 }, []);
    const p1 = r.state.players.find((p) => p.id === 'p1')!;
    expect(p1.cash).toBe(before - (3 * 25 + 100));
  });

  it('move_to teleports and pays salary only when collectStart is set', () => {
    const state = started();
    const before = state.players.find((p) => p.id === 'p1')!.cash;
    // Tile 7 is the jail corner (just visiting) — a plain no-op landing, so this isolates
    // collectStart's effect on salary without a card-draw or rent complicating the assertion.
    const r = applyCardEffect(SMALL_MAP, state, 'p1', { kind: 'move_to', tileIndex: 7, collectStart: false }, []);
    const p1 = r.state.players.find((p) => p.id === 'p1')!;
    expect(p1.tileIndex).toBe(7);
    expect(p1.cash).toBe(before);

    const r2 = applyCardEffect(SMALL_MAP, state, 'p1', { kind: 'move_to', tileIndex: 0, collectStart: true }, []);
    const p1b = r2.state.players.find((p) => p.id === 'p1')!;
    expect(p1b.tileIndex).toBe(0);
    expect(p1b.cash).toBe(before + state.settings.startSalary);
  });

  it('move_relative: forward pays salary if it passes START; backward never does', () => {
    let state = started();
    state = updatePlayer(state, 'p1', { tileIndex: 20 });
    const before = state.players.find((p) => p.id === 'p1')!.cash;
    const forward = applyCardEffect(SMALL_MAP, state, 'p1', { kind: 'move_relative', spaces: 3 }, []); // 20 -> 1, wraps past START
    const pf = forward.state.players.find((p) => p.id === 'p1')!;
    expect(pf.tileIndex).toBe(1);
    expect(pf.cash).toBe(before + state.settings.startSalary);

    const backward = applyCardEffect(SMALL_MAP, state, 'p1', { kind: 'move_relative', spaces: -3 }, []); // 20 -> 17, no salary
    const pb = backward.state.players.find((p) => p.id === 'p1')!;
    expect(pb.tileIndex).toBe(17);
    expect(pb.cash).toBe(before);
  });

  it('move_to_nearest finds the next airport/company ahead, and is a no-op on a map with none of that type', () => {
    let state = started();
    state = updatePlayer(state, 'p1', { tileIndex: 0 });
    const r = applyCardEffect(SMALL_MAP, state, 'p1', { kind: 'move_to_nearest', tileType: 'airport', rentMultiplier: 2 }, []);
    const p1 = r.state.players.find((p) => p.id === 'p1')!;
    expect(p1.tileIndex).toBe(5); // first airport on SMALL_MAP

    // WEIRD_MAP has zero companies: this must be a safe no-op, not a crash.
    const weird = started(WEIRD_MAP);
    const r2 = applyCardEffect(WEIRD_MAP, weird, 'p1', { kind: 'move_to_nearest', tileType: 'company', rentMultiplier: 10 }, []);
    expect(r2.state.players.find((p) => p.id === 'p1')!.tileIndex).toBe(0); // unchanged
  });

  it('move_to_nearest charges rent at the card multiplier when the destination is owned', () => {
    let state = started();
    state = updateTile(state, 5, { owner: 'p2' });
    state = updatePlayer(state, 'p1', { tileIndex: 0 });
    const before = state.players.find((p) => p.id === 'p1')!.cash;
    const rents = (SMALL_MAP.tiles[5] as { rents: readonly number[] }).rents;
    const r = applyCardEffect(SMALL_MAP, state, 'p1', { kind: 'move_to_nearest', tileType: 'airport', rentMultiplier: 2 }, []);
    const p1 = r.state.players.find((p) => p.id === 'p1')!;
    expect(p1.cash).toBe(before - rents[0]! * 2);
  });
});
