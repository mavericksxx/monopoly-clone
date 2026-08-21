/** All randomness flows through an injected `rng: () => number` returning [0, 1). */

export function rollDie(rng: () => number): number {
  return Math.floor(rng() * 6) + 1;
}

export function rollDice(rng: () => number): readonly [number, number] {
  return [rollDie(rng), rollDie(rng)];
}

/** Fisher-Yates shuffle, pure — returns a new array. */
export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}
