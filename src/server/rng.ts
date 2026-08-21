/**
 * Deterministic PRNG (mulberry32) so a game is replayable from its stored seed.
 * The engine never sees `Math.random` — only `Rng.next` wrapped as `() => number`.
 *
 * `state()` exposes the generator's current internal word so the room can persist it
 * alongside the seed: on a cold start (post-hibernation/eviction) the room resumes the
 * exact sequence from where it left off, without replaying the action log.
 */
export interface Rng {
  next(): number;
  state(): number;
}

export function createRng(state: number): Rng {
  let a = state >>> 0;
  return {
    next(): number {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    state(): number {
      return a;
    },
  };
}

/** A fresh random seed for a new room, from `crypto.getRandomValues` — never `Math.random`. */
export function randomSeed(): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0]!;
}
