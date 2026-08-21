import type { GameEvent, Player, PlayerId } from '../../shared/types';

function nameOf(players: readonly Player[], id: PlayerId | null): string {
  if (!id) return 'the bank';
  return players.find(p => p.id === id)?.name ?? 'a player';
}

function formatEvent(event: GameEvent, players: readonly Player[]): string {
  switch (event.type) {
    case 'game_started':
      return 'The game has started.';
    case 'rolled':
      return `${nameOf(players, event.playerId)} rolled ${event.dice[0]} + ${event.dice[1]}${event.isDouble ? ' (doubles!)' : ''}.`;
    case 'moved':
      return `${nameOf(players, event.playerId)} moved to tile ${event.to}${event.passedStart ? ', passing START' : ''}.`;
    case 'paid':
      return `${nameOf(players, event.from)} paid $${event.amount} to ${nameOf(players, event.to)} (${event.reason}).`;
    case 'bought':
      return `${nameOf(players, event.playerId)} bought tile ${event.tileIndex} for $${event.price}.`;
    case 'built':
      return `${nameOf(players, event.playerId)} built on tile ${event.tileIndex} (${event.hotel ? 'hotel' : `${event.houses} house(s)`}).`;
    case 'card_drawn':
      return `${nameOf(players, event.playerId)} drew a ${event.deck} card.`;
    case 'jailed':
      return `${nameOf(players, event.playerId)} was sent to prison (${event.reason}).`;
    case 'left_jail':
      return `${nameOf(players, event.playerId)} left prison (${event.how}).`;
    case 'debt_opened':
      return `${nameOf(players, event.debt.debtor)} owes $${event.debt.amount} to ${nameOf(players, event.debt.creditor)}.`;
    case 'debt_cleared':
      return `${nameOf(players, event.playerId)} cleared their debt.`;
    case 'bankrupt':
      return `${nameOf(players, event.playerId)} went bankrupt.`;
    case 'turn_ended':
      return `Turn passed to ${nameOf(players, event.nextPlayerId)}.`;
    case 'game_over':
      return `${nameOf(players, event.winner)} won the game!`;
  }
}

export function EventLog({ events, players }: { events: readonly GameEvent[]; players: readonly Player[] }) {
  const recent = events.slice(-100).reverse();
  return (
    <div className="event-log">
      <h3 className="event-log__title">Log</h3>
      <ul className="event-log__list">
        {recent.map((event, i) => (
          <li key={i} className="event-log__item">{formatEvent(event, players)}</li>
        ))}
        {recent.length === 0 && <li className="event-log__empty">Nothing has happened yet.</li>}
      </ul>
    </div>
  );
}
