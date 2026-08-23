import type { GameState, PlayerId } from '../shared/types';

/**
 * Which seat this tab is acting for right now.
 *
 * Normally your own. Dummy players added from the Developer panel have no socket of their
 * own, so the person who added them drives them from the same tab: whenever the game is
 * waiting on a seat they control, the action bar becomes that seat. Debt comes first —
 * a dummy of yours can owe money while it is somebody else's turn, and nothing else moves
 * until that clears.
 *
 * Bankrupt seats are skipped, including your own: going bankrupt while your dummies are
 * still playing must not leave you with no way to act.
 */
export function actingPlayerId(state: GameState, myPlayerId: PlayerId): PlayerId {
  const controls = (id: PlayerId | undefined): id is PlayerId =>
    !!id && (id === myPlayerId || state.players.find(p => p.id === id)?.dummyOf === myPlayerId);
  const live = (id: PlayerId): boolean => !state.players.find(p => p.id === id)?.bankrupt;

  const debtor = state.debt?.debtor;
  if (state.phase === 'RESOLVING_DEBT' && controls(debtor)) return debtor;

  const current = state.turnOrder[state.currentPlayerIndex];
  if (controls(current) && live(current)) return current;

  if (live(myPlayerId)) return myPlayerId;
  return state.players.find(p => p.dummyOf === myPlayerId && !p.bankrupt)?.id ?? myPlayerId;
}
