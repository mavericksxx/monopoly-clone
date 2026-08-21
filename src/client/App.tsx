import type { MapId } from '../shared/types';
import { useLocation } from './router';
import { Home } from './pages/Home';
import { RoomContainer } from './pages/RoomContainer';
import { Board } from './components/Board';
import { Lobby } from './pages/Lobby';
import { Game } from './pages/Game';
import { getMap } from './mapSource';
import { fixtureGameState, fixtureRoomMeta, fixturePlayers } from './fixtures';

const MAP_IDS: readonly MapId[] = ['classic', 'mr-worldwide', 'death-valley', 'lucky-wheel'];

/**
 * Renders a fixture instead of connecting to a room, so the board and
 * lobby can be eyeballed without a running server. See:
 *   /?dev=board&map=mr-worldwide   (48-tile board; try each MapId)
 *   /?dev=lobby
 *   /?dev=game
 */
function DevPreview({ mode, mapId }: { mode: string; mapId: MapId }) {
  if (mode === 'board') {
    const map = getMap(mapId);
    const state = fixtureGameState(mapId);
    return (
      <div className="dev-preview">
        <p className="dev-preview__label">{map.name} — {map.tiles.length} tiles</p>
        <Board map={map} state={state} />
      </div>
    );
  }
  if (mode === 'lobby') {
    return (
      <Lobby
        code="DEMO" status="open" room={fixtureRoomMeta()} players={fixturePlayers()}
        myPlayerId="p1" error={null} onJoin={() => {}} onUpdateSettings={() => {}} onStart={() => {}}
      />
    );
  }
  if (mode === 'game') {
    const map = getMap(mapId);
    const state = fixtureGameState(mapId);
    return <Game map={map} state={state} myPlayerId="p1" events={[]} onAction={() => {}} code="DEMO" />;
  }
  return null;
}

export function App() {
  const path = useLocation();
  const params = new URLSearchParams(window.location.search);
  const devMode = params.get('dev');
  if (devMode) {
    const mapParam = params.get('map');
    const mapId = MAP_IDS.includes(mapParam as MapId) ? (mapParam as MapId) : 'classic';
    return <DevPreview mode={devMode} mapId={mapId} />;
  }

  const code = path.slice(1).split('/')[0];
  if (!code) return <Home />;
  return <RoomContainer code={code} />;
}
