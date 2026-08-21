import type { Player, PlayerId } from '../../shared/types';

export function PlayerList({ players, hostId }: { players: readonly Player[]; hostId: PlayerId | null }) {
  return (
    <div className="player-list">
      <h3 className="player-list__title">Players ({players.length})</h3>
      <ul className="player-list__items">
        {players.map(p => (
          <li key={p.id} className="player-list__item">
            <span className="player-list__dot" style={{ background: p.color }} />
            <span className="player-list__name">{p.name}</span>
            {p.id === hostId && <span className="player-list__host">host</span>}
            {!p.connected && <span className="player-list__offline">offline</span>}
          </li>
        ))}
        {players.length === 0 && <li className="player-list__empty">No one here yet.</li>}
      </ul>
    </div>
  );
}
