import type { GameAction, GameEvent, GameMap, GameState, PlayerId } from '../../shared/types';
import { Board } from '../components/Board';
import { Sidebar } from '../components/Sidebar';
import { ShareLink } from '../components/ShareLink';

export function Game({
  map, state, myPlayerId, events, onAction, code,
}: {
  map: GameMap;
  state: GameState;
  myPlayerId: PlayerId;
  events: readonly GameEvent[];
  onAction: (action: GameAction) => void;
  code: string;
}) {
  return (
    <div className="game">
      <div className="rail rail--left">
        <div className="brand">Board Night</div>
        <ShareLink code={code} />
      </div>
      <div className="game__board-wrap">
        <Board map={map} state={state} events={events} />
      </div>
      <Sidebar map={map} state={state} myPlayerId={myPlayerId} onAction={onAction} />
    </div>
  );
}
