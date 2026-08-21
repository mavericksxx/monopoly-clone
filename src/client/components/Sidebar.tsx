import type { GameAction, GameMap, GameState, PlayerId } from '../../shared/types';
import { PlayerCard } from './PlayerCard';
import { ActionBar } from './ActionBar';

export function Sidebar({
  map, state, myPlayerId, onAction,
}: {
  map: GameMap;
  state: GameState;
  myPlayerId: PlayerId;
  onAction: (action: GameAction) => void;
}) {
  const currentPlayerId = state.turnOrder[state.currentPlayerIndex];

  return (
    <div className="rail rail--right">
      <div className="sidebar__players">
        {state.players.map(player => (
          <PlayerCard
            key={player.id}
            player={player}
            map={map}
            state={state}
            isCurrentTurn={player.id === currentPlayerId}
            isMe={player.id === myPlayerId}
          />
        ))}
      </div>
      <ActionBar map={map} state={state} myPlayerId={myPlayerId} onAction={onAction} />
    </div>
  );
}
