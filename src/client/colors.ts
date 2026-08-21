import type { CountryId } from '../shared/types';

/**
 * Country groups are colored by evenly spacing hues around the color wheel
 * in the order `CountryId` lists them, so any subset of the 14 countries a
 * given map actually uses still gets well-separated colors without a
 * hand-maintained per-country table.
 */
const COUNTRY_ORDER: readonly CountryId[] = [
  'brazil', 'canada', 'china', 'france', 'germany', 'india', 'ireland',
  'israel', 'italy', 'japan', 'romania', 'turkey', 'united-kingdom',
  'united-states-of-america',
];

export function countryColor(id: CountryId): string {
  const index = COUNTRY_ORDER.indexOf(id);
  const hue = Math.round((360 / COUNTRY_ORDER.length) * Math.max(index, 0));
  return `hsl(${hue}, 62%, 52%)`;
}

export function displayName(id: string): string {
  return id.split('-').map(w => (w[0] ?? '').toUpperCase() + w.slice(1)).join(' ');
}
