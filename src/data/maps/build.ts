/**
 * Shared helper for turning a raw tile list into a full `GameMap`. Every per-map
 * file (classic.ts, mr-worldwide.ts, death-valley.ts, lucky-wheel.ts) calls this
 * instead of hardcoding startIndex/jailIndex/goToJailIndex/countrySizes — those are
 * always derived from the tiles, never written as constants.
 */
import type { GameMap, MapId, Tile } from '../../shared/types';

export function buildMap(id: MapId, name: string, tiles: readonly Tile[]): GameMap {
  const start = tiles.find((t) => t.type === 'corner' && t.subtype === 'start');
  const jail = tiles.find((t) => t.type === 'corner' && t.subtype === 'jail');
  const goToJail = tiles.find((t) => t.type === 'corner' && t.subtype === 'go_to_jail');

  if (!start || !jail || !goToJail) {
    throw new Error(`map "${id}" is missing one or more required corner tiles`);
  }

  const countrySizes: Record<string, number> = {};
  for (const tile of tiles) {
    if (tile.type === 'city') {
      countrySizes[tile.countryId] = (countrySizes[tile.countryId] ?? 0) + 1;
    }
  }

  return {
    id,
    name,
    tiles,
    startIndex: start.index,
    jailIndex: jail.index,
    goToJailIndex: goToJail.index,
    countrySizes,
  };
}
