import type { CountryId, Tile } from '../shared/types';

/**
 * Every visual a tile needs beyond its data. Country groups are identified by a
 * flag badge rather than a colour stripe — the maps model groups as real countries,
 * so the flag is both the most legible grouping cue and the most obvious one.
 *
 * Emoji only: the client ships no image assets and loads no external fonts.
 */

const FLAGS: Record<CountryId, string> = {
  brazil: '🇧🇷',
  canada: '🇨🇦',
  china: '🇨🇳',
  france: '🇫🇷',
  germany: '🇩🇪',
  india: '🇮🇳',
  ireland: '🇮🇪',
  israel: '🇮🇱',
  italy: '🇮🇹',
  japan: '🇯🇵',
  romania: '🇷🇴',
  turkey: '🇹🇷',
  'united-kingdom': '🇬🇧',
  'united-states-of-america': '🇺🇸',
};

export function countryFlag(id: CountryId): string {
  return FLAGS[id];
}

/** Companies differ by name across maps (Power / Water / Gas), so key off the name. */
function companyIcon(name: string): string {
  if (name.startsWith('Water')) return '💧';
  if (name.startsWith('Gas')) return '🔥';
  return '⚡';
}

/** The glyph shown in the body of a non-city tile. Cities use their flag instead. */
export function tileIcon(tile: Tile): string {
  switch (tile.type) {
    case 'airport':
      return '✈️';
    case 'company':
      return companyIcon(tile.name);
    case 'corner':
      switch (tile.subtype) {
        case 'start': return '🏁';
        case 'jail': return '🔒';
        case 'free_parking': return '🌴';
        case 'go_to_jail': return '🚔';
      }
      break;
    case 'bonus':
      switch (tile.bonusType) {
        case 'treasure': return '🧰';
        case 'surprise': return '❓';
        case 'tax': return '🧾';
        case 'premium-tax': return '💎';
        case 'tax-refund': return '💸';
      }
      break;
    case 'city':
      return countryFlag(tile.countryId);
  }
  return '';
}

/** The small line under a corner tile's icon, and the label for tax tiles. */
export function tileSubLabel(tile: Tile): string | null {
  if (tile.type === 'bonus') {
    if (tile.bonusType === 'tax') return `${tile.taxPercentage}%`;
    if (tile.bonusType === 'premium-tax') return `$${tile.taxAmount}`;
    if (tile.bonusType === 'tax-refund') return `+$${tile.taxAmount}`;
  }
  return null;
}
