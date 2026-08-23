import type { GameAction, GameEvent, GameMap, GameState, PlayerId } from '../../shared/types';
import { actingPlayerId } from '../acting';
import { Board } from '../components/Board';
import { Sidebar } from '../components/Sidebar';
import { SettingsPanel } from '../components/SettingsPanel';
import { ShareLink } from '../components/ShareLink';

export function Game({
  map, state, myPlayerId, events, onAction, code,
}: {
  map: GameMap;
  state: GameState;
  myPlayerId: PlayerId;
  events: readonly GameEvent[];
  onAction: (action: GameAction, asPlayerId?: PlayerId) => void;
  code: string;
}) {
  // One tab can be driving several seats (see `actingPlayerId`); the server is told which
  // one an action is for, and refuses any id that is not one of this player's dummies.
  const acting = actingPlayerId(state, myPlayerId);
  const act = (action: GameAction) => onAction(action, acting === myPlayerId ? undefined : acting);

  return (
    <div className="game">
      <div className="rail rail--left">
        <div className="brand">Board Night</div>
        <ShareLink code={code} />
        {/* Read-only once the game is running: everyone can check which rules are in
            force, nobody can change them. The host sets them in the lobby, before the
            engine has snapshotted them into the game state. */}
        <div className="panel">
          <div className="panel__title">Game settings</div>
          <SettingsPanel settings={state.settings} editable={false} onChange={() => {}} />
        </div>
      </div>
      <div className="game__board-wrap">
        <Board map={map} state={state} events={events} />
      </div>
      <Sidebar map={map} state={state} myPlayerId={myPlayerId} actingPlayerId={acting} onAction={act} />
    </div>
  );
}
