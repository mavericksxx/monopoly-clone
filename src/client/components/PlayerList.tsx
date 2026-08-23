import { useEffect, useRef, useState } from 'react';
import type { Player, PlayerId } from '../../shared/types';

/**
 * Milliseconds since this roster arrived. `removeInMs` is a duration the server measured
 * when it broadcast, not a timestamp, so counting down from receipt keeps the display
 * honest on a client whose clock disagrees with Cloudflare's.
 */
function useElapsedSince(players: readonly Player[]): number {
  const [elapsed, setElapsed] = useState(0);
  const receivedAt = useRef(Date.now());

  useEffect(() => {
    receivedAt.current = Date.now();
    setElapsed(0);
  }, [players]);

  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - receivedAt.current), 1000);
    return () => clearInterval(id);
  }, []);

  return elapsed;
}

function countdown(ms: number): string {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function PlayerList({
  players, hostId, myPlayerId, onRemoveDummy,
}: {
  players: readonly Player[];
  hostId: PlayerId | null;
  myPlayerId?: PlayerId | null;
  /** Present only in developer mode; offered on bots this player added, never on people. */
  onRemoveDummy?: (playerId: PlayerId) => void;
}) {
  const elapsed = useElapsedSince(players);

  return (
    <div className="player-list">
      <h3 className="player-list__title">Players ({players.length})</h3>
      <ul className="player-list__items">
        {players.map(p => (
          <li key={p.id} className="player-list__item">
            <span className="player-list__dot" style={{ background: p.color }} />
            <span className="player-list__name">{p.name}</span>
            {p.id === hostId && <span className="player-list__host">host</span>}
            {p.dummyOf && <span className="player-list__bot">bot</span>}
            {!p.connected && (
              <span className="player-list__offline">
                {p.removeInMs === undefined
                  ? 'offline'
                  : `offline · leaves in ${countdown(p.removeInMs - elapsed)}`}
              </span>
            )}
            {onRemoveDummy && p.dummyOf === myPlayerId && (
              <button
                className="btn btn--small player-list__remove"
                onClick={() => onRemoveDummy(p.id)}
                title={`Remove ${p.name}`}
              >
                Remove
              </button>
            )}
          </li>
        ))}
        {players.length === 0 && <li className="player-list__empty">No one here yet.</li>}
      </ul>
    </div>
  );
}
