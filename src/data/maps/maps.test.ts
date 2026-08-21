import { describe, expect, it } from 'vitest';
import type { MapId } from '../../shared/types';
import { MAPS, getMap } from './index';
import { validateMap } from './validate';

const EXPECTED_COUNTS: Record<MapId, { tiles: number; cities: number; airports: number; companies: number }> = {
  classic: { tiles: 40, cities: 22, airports: 4, companies: 2 },
  'mr-worldwide': { tiles: 48, cities: 28, airports: 4, companies: 3 },
  'death-valley': { tiles: 40, cities: 22, airports: 4, companies: 2 },
  'lucky-wheel': { tiles: 40, cities: 16, airports: 4, companies: 0 },
};

describe('validateMap', () => {
  for (const mapId of Object.keys(MAPS) as MapId[]) {
    it(`reports zero problems for "${mapId}"`, () => {
      const problems = validateMap(MAPS[mapId]);
      expect(problems).toEqual([]);
    });
  }
});

describe('getMap', () => {
  for (const mapId of Object.keys(MAPS) as MapId[]) {
    it(`returns the map for "${mapId}"`, () => {
      expect(getMap(mapId)).toBe(MAPS[mapId]);
      expect(getMap(mapId).id).toBe(mapId);
    });
  }
});

describe('tile/city/airport/company counts', () => {
  for (const mapId of Object.keys(EXPECTED_COUNTS) as MapId[]) {
    const expected = EXPECTED_COUNTS[mapId];

    it(`"${mapId}" matches the registry counts`, () => {
      const map = getMap(mapId);
      const cities = map.tiles.filter((t) => t.type === 'city');
      const airports = map.tiles.filter((t) => t.type === 'airport');
      const companies = map.tiles.filter((t) => t.type === 'company');

      expect(map.tiles.length).toBe(expected.tiles);
      expect(cities.length).toBe(expected.cities);
      expect(airports.length).toBe(expected.airports);
      expect(companies.length).toBe(expected.companies);
    });
  }
});

describe('derived indices', () => {
  it('classic corners land at 0/10/20/30', () => {
    const map = getMap('classic');
    expect(map.startIndex).toBe(0);
    expect(map.jailIndex).toBe(10);
    expect(map.goToJailIndex).toBe(30);
  });

  it('mr-worldwide corners land at 0/12/24/36 (12 tiles per side)', () => {
    const map = getMap('mr-worldwide');
    expect(map.startIndex).toBe(0);
    expect(map.jailIndex).toBe(12);
    expect(map.goToJailIndex).toBe(36);
  });

  it('death-valley corners land at 0/10/20/30', () => {
    const map = getMap('death-valley');
    expect(map.startIndex).toBe(0);
    expect(map.jailIndex).toBe(10);
    expect(map.goToJailIndex).toBe(30);
  });

  it('lucky-wheel corners land at 0/10/20/30', () => {
    const map = getMap('lucky-wheel');
    expect(map.startIndex).toBe(0);
    expect(map.jailIndex).toBe(10);
    expect(map.goToJailIndex).toBe(30);
  });
});

describe('countrySizes', () => {
  it('death-valley has four countries in groups of 5, 6, 6, 5', () => {
    const map = getMap('death-valley');
    expect(map.countrySizes).toEqual({
      canada: 5,
      germany: 6,
      'united-kingdom': 6,
      'united-states-of-america': 5,
    });
  });

  it('mr-worldwide has two four-property groups (italy, united-kingdom)', () => {
    const map = getMap('mr-worldwide');
    expect(map.countrySizes.italy).toBe(4);
    expect(map.countrySizes['united-kingdom']).toBe(4);
  });

  it('lucky-wheel has eight two-property groups', () => {
    const map = getMap('lucky-wheel');
    const sizes = Object.values(map.countrySizes);
    expect(sizes).toHaveLength(8);
    expect(sizes.every((size) => size === 2)).toBe(true);
  });
});

describe('validateMap catches invariant violations', () => {
  it('flags a map whose tiles are no longer densely ordered', () => {
    const map = getMap('classic');
    const brokenTiles = map.tiles.map((t) => ({ ...t }));
    // Break density: give tile at array position 5 an index of 6 instead of 5.
    brokenTiles[5] = { ...brokenTiles[5]!, index: 6 };
    const broken = { ...map, tiles: brokenTiles };

    const problems = validateMap(broken);
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.some((p) => p.includes('index 6'))).toBe(true);
  });

  it('flags a map with a wrong countrySizes count', () => {
    const map = getMap('classic');
    const broken = { ...map, countrySizes: { ...map.countrySizes, brazil: 99 } };

    const problems = validateMap(broken);
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.some((p) => p.includes('brazil'))).toBe(true);
  });
});

describe('death-valley inferred value', () => {
  it('tile 39 (New York) keeps the inferred house/hotel price of 200', () => {
    const map = getMap('death-valley');
    const tile = map.tiles[39];
    if (tile?.type !== 'city') throw new Error('expected tiles[39] to be a city');
    expect(tile.housePrice).toBe(200);
    expect(tile.hotelPrice).toBe(200);
  });
});
