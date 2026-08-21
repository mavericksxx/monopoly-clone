import type { GameAction, GameEvent, GameMap, GameState, PlayerId } from '../../shared/types';
import { Board } from '../components/Board';
import { Sidebar } from '../components/Sidebar';

export function Game({
  map, state, myPlayerId, events, onAction,
}: {
  map: GameMap;
  state: GameState;
  myPlayerId: PlayerId;
  events: readonly GameEvent[];
  onAction: (action: GameAction) => void;
}) {
  return (
    <div className="game">
      <div className="game__board-wrap">
        <Board map={map} state={state} />
      </div>
      <Sidebar map={map} state={state} myPlayerId={myPlayerId} events={events} onAction={onAction} />
    </div>
  );
}
