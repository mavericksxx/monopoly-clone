/**
 * RESOLVING_DEBT: blocking phase, one active Debt at a time (SPEC decision 4).
 *
 * Every Debt-creating path in this engine has debtor === the current player
 * (rent/tax/card charges and money_from_each all fire during that player's
 * own landing resolution) — openDebt asserts this so a future path that
 * violates it fails loudly instead of quietly letting a non-debtor mutate
 * assets. Voluntary concession (declare_bankruptcy outside RESOLVING_DEBT)
 * is the one place a non-current player can go bankrupt, and settleBankruptcy
 * handles that by only advancing the turn when the debtor IS the current
 * player.
 */
import type { Debt, GameEvent, GameMap, GameState, Phase, PlayerId } from '../shared/types';
import {
  activePlayers,
  addToVacationPot,
  currentPlayer,
  hotelSaleValue,
  houseSaleValue,
  maxLiquidationValue,
  ownableTileIndices,
  updateBank,
  updatePlayer,
  updateTile,
} from './state';

/** What phase to land in once a roll's landing resolution (and any debt it caused) is fully done. */
export function phaseAfterLanding(state: GameState): Phase {
  const roll = state.lastRoll;
  const wasDouble = roll !== null && roll[0] === roll[1];
  return wasDouble && state.doublesCount < 3 ? 'AWAITING_ROLL' : 'AWAITING_END_TURN';
}

/**
 * Steps to the next non-bankrupt player, skipping (and decrementing) anyone
 * sitting out a Vacation penalty. If every active player is currently
 * skipping — including the degenerate case where the lap wraps back onto a
 * bankrupt outgoing player (settleBankruptcy's caller) instead of a live one
 * — this still terminates after one lap: it lands on the first active player
 * it saw rather than looping forever or parking the turn on a bankrupt id.
 * That player's own pending skip (if any) is still consumed, just not
 * reported as a turn_skipped — they're the one who actually gets the turn,
 * not someone passed over.
 */
export function advanceTurn(state: GameState): { state: GameState; events: GameEvent[] } {
  const n = state.turnOrder.length;
  let next = state;
  let idx = state.currentPlayerIndex;
  let firstActiveIdx = -1;
  let broke = false;
  const events: GameEvent[] = [];
  for (let i = 0; i < n; i++) {
    idx = (idx + 1) % n;
    const id = next.turnOrder[idx]!;
    const p = next.players.find((pl) => pl.id === id)!;
    if (p.bankrupt) continue;
    if (firstActiveIdx === -1) firstActiveIdx = idx;
    if (p.skipTurns === 0) {
      broke = true;
      break;
    }
    next = updatePlayer(next, id, { skipTurns: p.skipTurns - 1 });
    events.push({ type: 'turn_skipped', playerId: id });
  }
  if (!broke) {
    idx = firstActiveIdx;
    // firstActiveIdx is always the first active player visited, so if it was processed at
    // all its push is always events[0] — that player is the lander, not someone skipped.
    events.shift();
  }
  return { state: { ...next, currentPlayerIndex: idx, doublesCount: 0 }, events };
}

/** Opens a Debt and immediately attempts to settle it (SPEC decisions 4, 5, 13). */
export function openDebt(
  map: GameMap,
  state: GameState,
  debtorId: PlayerId,
  amount: number,
  creditor: PlayerId | null,
  queued: readonly { amount: number; creditor: PlayerId | null }[] = [],
): { state: GameState; events: GameEvent[] } {
  if (debtorId !== currentPlayer(state).id) {
    throw new Error('Engine invariant violated: debt debtor must be the current player');
  }
  const debt: Debt = { debtor: debtorId, amount, creditor, queued };
  const opened: GameState = { ...state, phase: 'RESOLVING_DEBT', debt };
  return trySettleOrBankrupt(map, opened, [{ type: 'debt_opened', debt }]);
}

/**
 * Call after any cash change to the current debtor while RESOLVING_DEBT is
 * active (opening the debt, or after a building sale). Pays off the debt if
 * cash now covers it, cascades to the next queued creditor, auto-bankrupts
 * if liquidation can never cover it, or otherwise leaves the phase as-is
 * waiting for the debtor to sell more.
 */
export function trySettleOrBankrupt(
  map: GameMap,
  state: GameState,
  events: GameEvent[] = [],
): { state: GameState; events: GameEvent[] } {
  let next = state;
  const out = events.slice();

  for (;;) {
    const debt = next.debt;
    if (!debt) return { state: next, events: out };
    const debtor = next.players.find((p) => p.id === debt.debtor)!;

    if (debtor.cash >= debt.amount) {
      next = updatePlayer(next, debtor.id, { cash: debtor.cash - debt.amount });
      if (debt.creditor) {
        const creditor = next.players.find((p) => p.id === debt.creditor)!;
        next = updatePlayer(next, creditor.id, { cash: creditor.cash + debt.amount });
      } else {
        next = addToVacationPot(next, debt.amount);
      }
      out.push({ type: 'paid', from: debtor.id, to: debt.creditor, amount: debt.amount, reason: 'debt' });

      const [head, ...rest] = debt.queued;
      if (head) {
        next = { ...next, debt: { debtor: debtor.id, amount: head.amount, creditor: head.creditor, queued: rest } };
        out.push({ type: 'debt_opened', debt: next.debt! });
        continue; // re-check solvency against the next creditor in line
      }
      out.push({ type: 'debt_cleared', playerId: debtor.id });
      next = { ...next, debt: null, phase: phaseAfterLanding(next) };
      return { state: next, events: out };
    }

    if (maxLiquidationValue(map, next, debtor.id) < debt.amount) {
      return settleBankruptcy(map, next, debtor.id, debt.creditor, out);
    }

    // Solvent-on-paper but cash-poor: stay in RESOLVING_DEBT, wait for the debtor to sell.
    return { state: next, events: out };
  }
}

/**
 * Full liquidation. Buildings always sell to the bank first regardless of
 * creditor (SPEC quick reference: "buildings sold to Bank even when
 * bankrupting to a player"). To the Bank, properties become unowned — v1 has
 * no auctions, matching the decline-to-buy rule. To a player, the debtor's
 * entire remaining cash and all their bare properties transfer to that one
 * creditor; any further queued creditors get nothing (SPEC decision 13).
 */
export function settleBankruptcy(
  map: GameMap,
  state: GameState,
  debtorId: PlayerId,
  creditor: PlayerId | null,
  events: GameEvent[] = [],
): { state: GameState; events: GameEvent[] } {
  const out = events.slice();
  let next = state;
  const debtor = next.players.find((p) => p.id === debtorId)!;

  let buildingCash = 0;
  let housesFreed = 0;
  let hotelsFreed = 0;
  const ownedIndices: number[] = [];
  for (const index of ownableTileIndices(map)) {
    const ownership = next.tiles[index]!;
    if (ownership.owner !== debtorId) continue;
    ownedIndices.push(index);
    const tile = map.tiles[index]!;
    if (tile.type === 'city') {
      if (ownership.hotel) {
        buildingCash += hotelSaleValue(tile);
        hotelsFreed += 1;
      } else if (ownership.houses > 0) {
        buildingCash += ownership.houses * houseSaleValue(tile);
        housesFreed += ownership.houses;
      }
    }
  }
  if (!next.settings.unlimitedBuildings && (housesFreed > 0 || hotelsFreed > 0)) {
    next = updateBank(next, { houses: next.bank.houses + housesFreed, hotels: next.bank.hotels + hotelsFreed });
  }

  const debtorCash = debtor.cash;
  const totalCash = debtorCash + buildingCash;
  const newOwner: PlayerId | null = creditor;
  for (const index of ownedIndices) {
    next = updateTile(next, index, { owner: newOwner, houses: 0, hotel: false, mortgaged: false });
  }
  if (creditor) {
    const c = next.players.find((p) => p.id === creditor)!;
    next = updatePlayer(next, creditor, { cash: c.cash + totalCash });
  }
  next = updatePlayer(next, debtorId, { cash: 0, bankrupt: true });
  next = { ...next, debt: null };
  // Two separate paid events, not one lumped sum: debtorCash is a real balance the debtor actually
  // held (from: debtorId); buildingCash never touched the debtor's balance — it's the bank's payout
  // for the liquidated buildings, sourced from the bank (from: null). Bundling them as one
  // from:debtorId event would overstate the debtor's real cash outflow. To the Bank (creditor null)
  // the buildingCash leg is the bank paying itself, so it emits nothing.
  if (debtorCash > 0) {
    out.push({ type: 'paid', from: debtorId, to: creditor, amount: debtorCash, reason: 'bankruptcy_settlement' });
  }
  if (buildingCash > 0 && creditor) {
    out.push({ type: 'paid', from: null, to: creditor, amount: buildingCash, reason: 'bankruptcy_settlement' });
  }
  out.push({ type: 'bankrupt', playerId: debtorId, creditor });

  const remaining = activePlayers(next);
  if (remaining.length === 1) {
    const winner = remaining[0]!.id;
    next = { ...next, phase: 'GAME_OVER', winner };
    out.push({ type: 'game_over', winner });
    return { state: next, events: out };
  }

  if (debtorId === currentPlayer(next).id) {
    const advanced = advanceTurn(next);
    next = { ...advanced.state, phase: 'AWAITING_ROLL' };
    out.push(...advanced.events, { type: 'turn_ended', nextPlayerId: currentPlayer(next).id });
  }

  return { state: next, events: out };
}
