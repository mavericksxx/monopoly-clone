import type { Card, DeckId } from '../../shared/types';
import { treasureCards } from './treasure';
import { surpriseCards } from './surprise';

const DECKS: Record<DeckId, Card[]> = {
  treasure: treasureCards,
  surprise: surpriseCards,
};

const CARDS_BY_ID: Record<string, Card> = Object.fromEntries(
  [...treasureCards, ...surpriseCards].map((card) => [card.id, card]),
);

export function getDeck(deck: DeckId): Card[] {
  // Return a copy: callers (deck shuffling at game start) must not be able to
  // mutate the module-level source of truth.
  return [...DECKS[deck]];
}

export function getCard(id: string): Card {
  const card = CARDS_BY_ID[id];
  if (!card) {
    throw new Error(`Unknown card id: ${id}`);
  }
  return card;
}
