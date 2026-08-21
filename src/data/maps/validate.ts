import type { GameMap } from '../../shared/types';

const CORNER_SUBTYPES = ['start', 'jail', 'free_parking', 'go_to_jail'] as const;

/**
 * Validates a `GameMap` against the structural invariants the engine relies on.
 * Returns a list of human-readable problems; an empty array means the map is valid.
 */
export function validateMap(map: GameMap): string[] {
  const problems: string[] = [];
  const { tiles } = map;

  // Dense, ordered tiles: tiles[i].index === i.
  tiles.forEach((tile, i) => {
    if (tile.index !== i) {
      problems.push(`tile at array position ${i} has index ${tile.index} (expected ${i})`);
    }
  });

  // Exactly one corner of each subtype.
  for (const subtype of CORNER_SUBTYPES) {
    const matches = tiles.filter((t) => t.type === 'corner' && t.subtype === subtype);
    if (matches.length !== 1) {
      problems.push(`expected exactly one corner tile with subtype "${subtype}", found ${matches.length}`);
    }
  }

  // City checks: 6 rents, ascending, housePrice === hotelPrice.
  for (const tile of tiles) {
    if (tile.type === 'city') {
      if (tile.rents.length !== 6) {
        problems.push(`city "${tile.name}" (index ${tile.index}) has ${tile.rents.length} rent levels, expected 6`);
      }
      for (let i = 1; i < tile.rents.length; i++) {
        const prev = tile.rents[i - 1];
        const cur = tile.rents[i];
        if (prev === undefined || cur === undefined || !(cur > prev)) {
          problems.push(`city "${tile.name}" (index ${tile.index}) rents are not strictly ascending at position ${i}: ${tile.rents.join(', ')}`);
        }
      }
      if (tile.housePrice !== tile.hotelPrice) {
        problems.push(`city "${tile.name}" (index ${tile.index}) has housePrice (${tile.housePrice}) !== hotelPrice (${tile.hotelPrice})`);
      }
    }

    // Airport checks: 4 rents.
    if (tile.type === 'airport') {
      if (tile.rents.length !== 4) {
        problems.push(`airport "${tile.name}" (index ${tile.index}) has ${tile.rents.length} rent levels, expected 4`);
      }
    }
  }

  // Derived indices must match the actual corner tiles.
  const start = tiles.find((t) => t.type === 'corner' && t.subtype === 'start');
  const jail = tiles.find((t) => t.type === 'corner' && t.subtype === 'jail');
  const goToJail = tiles.find((t) => t.type === 'corner' && t.subtype === 'go_to_jail');

  if (start && map.startIndex !== start.index) {
    problems.push(`map.startIndex (${map.startIndex}) does not match the start corner tile's index (${start.index})`);
  }
  if (jail && map.jailIndex !== jail.index) {
    problems.push(`map.jailIndex (${map.jailIndex}) does not match the jail corner tile's index (${jail.index})`);
  }
  if (goToJail && map.goToJailIndex !== goToJail.index) {
    problems.push(`map.goToJailIndex (${map.goToJailIndex}) does not match the go_to_jail corner tile's index (${goToJail.index})`);
  }

  // countrySizes must match the actual per-country city counts.
  const actualCounts: Record<string, number> = {};
  for (const tile of tiles) {
    if (tile.type === 'city') {
      actualCounts[tile.countryId] = (actualCounts[tile.countryId] ?? 0) + 1;
    }
  }
  const expectedKeys = Object.keys(actualCounts).sort();
  const actualKeys = Object.keys(map.countrySizes).sort();
  if (JSON.stringify(expectedKeys) !== JSON.stringify(actualKeys)) {
    problems.push(`map.countrySizes keys (${actualKeys.join(', ')}) do not match the countries actually present (${expectedKeys.join(', ')})`);
  } else {
    for (const country of expectedKeys) {
      if (map.countrySizes[country] !== actualCounts[country]) {
        problems.push(`map.countrySizes["${country}"] is ${map.countrySizes[country]}, but ${actualCounts[country]} city tiles were found`);
      }
    }
  }

  return problems;
}
