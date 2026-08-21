import { describe, expect, it } from 'vitest';
import { getCard, getDeck } from './index';
import { treasureCards } from './treasure';
import { surpriseCards } from './surprise';

const ALL_CARDS = [...treasureCards, ...surpriseCards];

// Hasbro's word mark plus a curated set of Hasbro property/card phrases.
// Checked case-insensitively against every card's `text`.
const HASBRO_BLOCKLIST = [
  'monopoly',
  'boardwalk',
  'park place',
  'marvin gardens',
  'st. charles',
  'illinois avenue',
  'illinois',
  'reading railroad',
  'community chest',
  'free parking',
  'get out of jail free',
  'title deed',
  'electric company',
  'water works',
  'baltic avenue',
  'mediterranean avenue',
  'short line',
  'pennsylvania railroad',
  'pennsylvania',
  'b&o railroad',
  'ventnor avenue',
  'atlantic avenue',
  'kentucky avenue',
  'kentucky',
  'indiana',
  'virginia',
  'st. james',
  'tennessee',
  'north carolina',
  'pacific avenue',
  'connecticut',
  'vermont',
  'oriental avenue',
  'luxury tax',
  'income tax',
  'chance',
  'jail',
];

describe('treasure deck', () => {
  it('has exactly 16 cards', () => {
    expect(treasureCards).toHaveLength(16);
  });

  it('has exactly one pardon card', () => {
    expect(treasureCards.filter((c) => c.effect.kind === 'pardon')).toHaveLength(1);
  });

  it('tags every card with the treasure deck', () => {
    for (const card of treasureCards) {
      expect(card.deck).toBe('treasure');
    }
  });
});

describe('surprise deck', () => {
  it('has exactly 16 cards', () => {
    expect(surpriseCards).toHaveLength(16);
  });

  it('has exactly one pardon card', () => {
    expect(surpriseCards.filter((c) => c.effect.kind === 'pardon')).toHaveLength(1);
  });

  it('tags every card with the surprise deck', () => {
    for (const card of surpriseCards) {
      expect(card.deck).toBe('surprise');
    }
  });
});

describe('both decks combined', () => {
  it('have 32 cards total', () => {
    expect(ALL_CARDS).toHaveLength(32);
  });

  it('have unique ids across both decks', () => {
    const ids = ALL_CARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('use stable, kebab-case, deck-prefixed ids', () => {
    for (const card of ALL_CARDS) {
      expect(card.id).toMatch(/^(treasure|surprise)-\d{2}$/);
    }
  });

  it('give every card non-empty text', () => {
    for (const card of ALL_CARDS) {
      expect(card.text.trim().length).toBeGreaterThan(0);
    }
  });

  it('never contain Hasbro\'s word mark or property/card phrases in text', () => {
    for (const card of ALL_CARDS) {
      const lower = card.text.toLowerCase();
      for (const banned of HASBRO_BLOCKLIST) {
        expect(lower).not.toContain(banned);
      }
    }
  });

  it('only reference safe absolute tile indices (START=0) in move_to effects', () => {
    for (const card of ALL_CARDS) {
      if (card.effect.kind === 'move_to') {
        expect([0, 10]).toContain(card.effect.tileIndex);
      }
    }
  });

  it('never include out-of-scope v1 effects (mortgage/auction/trade)', () => {
    const allowedKinds = new Set([
      'money',
      'money_from_each',
      'move_to',
      'move_relative',
      'move_to_nearest',
      'go_to_jail',
      'pardon',
      'repairs',
    ]);
    for (const card of ALL_CARDS) {
      expect(allowedKinds.has(card.effect.kind)).toBe(true);
    }
  });
});

describe('getDeck / getCard', () => {
  it('getDeck returns the matching 16-card deck', () => {
    expect(getDeck('treasure')).toEqual(treasureCards);
    expect(getDeck('surprise')).toEqual(surpriseCards);
  });

  it('getDeck returns a fresh copy each call, so callers cannot mutate the source deck', () => {
    const first = getDeck('treasure');
    first.sort(() => 0.5 - Math.random());
    first.pop();
    expect(getDeck('treasure')).toHaveLength(16);
    expect(getDeck('treasure')).toEqual(treasureCards);
  });

  it('getCard resolves every card id in both decks', () => {
    for (const card of ALL_CARDS) {
      expect(getCard(card.id)).toEqual(card);
    }
  });

  it('getCard throws on an unknown id', () => {
    expect(() => getCard('nope-99')).toThrow();
  });
});
