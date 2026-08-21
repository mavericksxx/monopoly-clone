import type { GameEvent, GameState } from '../shared/types';

/**
 * Extends the pinned `reduce` signature with an optional `error`. On an
 * illegal action `state` is the SAME object reference the caller passed in
 * (so a server-side version diff is a no-op) and `events` is empty.
 */
export interface ActionResult {
  state: GameState;
  events: GameEvent[];
  error?: string;
}

export function ok(state: GameState, events: GameEvent[] = []): ActionResult {
  return { state, events };
}

export function reject(state: GameState, error: string): ActionResult {
  return { state, events: [], error };
}
