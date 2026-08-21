import type { GameAction, GameEvent, GameMap, GameState, PlayerId } from '../../shared/types';
import { PlayerCard } from './PlayerCard';
import { EventLog } from './EventLog';
import { ActionBar } from './ActionBar';

export function Sidebar({
  map, state, myPlayerId, events, onAction,
}: {
  map: GameMap;
  state: GameState;
  myPlayerId: PlayerId;
  events: readonly GameEvent[];
  onAction: (action: GameAction) => void;
}) {
  const currentPlayerId = state.turnOrder[state.currentPlayerIndex];

  return (
    <div className="sidebar">
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
      <EventLog events={events} players={state.players} />
    </div>
  );
}
