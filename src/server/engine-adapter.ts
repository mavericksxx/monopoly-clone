/**
 * Thin adapter over the engine lane's pinned module API (SPEC.md "Module API"):
 *
 *   createGame(map, players, settings, rng): GameState
 *   reduce(map, state, pa, rng): { state, events }
 *
 * `src/engine/index.ts` is owned by another lane and may not exist yet. The `@ts-ignore`
 * below is load-bearing: it keeps this lane's typecheck green whether or not that module
 * exists (a normal `import` fails `tsc` with "Cannot find module" the moment the file is
 * missing, and that error surfaces here — not in the missing lane's empty directory).
 * The local `CreateGameFn`/`ReduceFn` types re-impose the pinned signatures on whatever
 * `import * as engine` resolves to, so every other file in this lane still gets full type
 * safety. Once `src/engine/index.ts` lands, nothing here needs to change.
 */
import type { GameEvent, GameMap, GameState, PlayerAction, RoomSettings } from '../shared/types';

export type Rng = () => number;

type EnginePlayer = { id: string; name: string; color: string };

type CreateGameFn = (
  map: GameMap,
  players: EnginePlayer[],
  settings: RoomSettings,
  rng: Rng,
) => GameState;

type ReduceFn = (
  map: GameMap,
  state: GameState,
  pa: PlayerAction,
  rng: Rng,
) => { state: GameState; events: GameEvent[] };

// @ts-ignore -- src/engine/index.ts belongs to another lane; may not exist yet.
import * as engine from '../engine/index';

export const createGame: CreateGameFn = engine.createGame;
export const reduce: ReduceFn = engine.reduce;
