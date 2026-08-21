import type { GameMap, GameState, Player } from '../../shared/types';
import { countryColor } from '../colors';

export function PlayerCard({
  player, map, state, isCurrentTurn, isMe,
}: {
  player: Player;
  map: GameMap;
  state: GameState;
  isCurrentTurn: boolean;
  isMe: boolean;
}) {
  const owned = state.tiles
    .map((ownership, i) => ({ ownership, tile: map.tiles[i] }))
    .filter(({ ownership, tile }) => ownership.owner === player.id && tile);

  return (
    <div className={`player-card${isCurrentTurn ? ' player-card--active' : ''}${player.bankrupt ? ' player-card--bankrupt' : ''}`}>
      <div className="player-card__avatar" style={{ background: player.color }}>
        {player.name.slice(0, 1).toUpperCase()}
      </div>
      <div className="player-card__body">
        <div className="player-card__name">
          {player.name}{isMe ? ' (you)' : ''}
          {!player.connected && <span className="player-card__offline"> offline</span>}
        </div>
        <div className="player-card__cash">${player.cash}</div>
        {player.inJail && <div className="player-card__jail">In prison (turn {player.jailTurns}/3)</div>}
        {owned.length > 0 && (
          <div className="player-card__properties">
            {owned.map(({ tile }) => {
              if (!tile) return null;
              const color = tile.type === 'city' ? countryColor(tile.countryId) : 'var(--muted)';
              return <span key={tile.index} className="property-dot" style={{ background: color }} title={tile.name} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
