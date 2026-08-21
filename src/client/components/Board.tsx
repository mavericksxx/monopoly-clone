import type { GameMap, GameState, Player, Tile } from '../../shared/types';
import { ringLayout, type Edge } from '../ringLayout';
import { countryColor } from '../colors';
import { tileIcon, tileSubLabel } from '../tileArt';

function formatPhase(phase: GameState['phase']): string {
  switch (phase) {
    case 'LOBBY': return 'Waiting to start';
    case 'AWAITING_ROLL': return 'Rolling';
    case 'AWAITING_BUY': return 'Buying';
    case 'RESOLVING_DEBT': return 'Settling debt';
    case 'AWAITING_END_TURN': return 'Turn wrapping up';
    case 'GAME_OVER': return 'Game over';
  }
}

function ownerOf(players: readonly Player[], id: string | null): Player | null {
  if (!id) return null;
  return players.find(p => p.id === id) ?? null;
}

/** Which of a 3x3 grid's nine cells carry a pip, per die face. */
const PIP_CELLS: Readonly<Record<number, readonly number[]>> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function Die({ value }: { value: number }) {
  const cells = PIP_CELLS[value] ?? [];
  return (
    <div className="die" aria-label={`die showing ${value}`}>
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={cells.includes(i) ? 'die__pip' : ''} />
      ))}
    </div>
  );
}

export function Board({ map, state }: { map: GameMap; state: GameState }) {
  const { side, positions } = ringLayout(map.tiles.length);

  const playersByTile = new Map<number, Player[]>();
  for (const p of state.players) {
    if (p.bankrupt) continue;
    const arr = playersByTile.get(p.tileIndex) ?? [];
    arr.push(p);
    playersByTile.set(p.tileIndex, arr);
  }

  return (
    <div
      className="board"
      style={{
        gridTemplateColumns: `repeat(${side}, 1fr)`,
        gridTemplateRows: `repeat(${side}, 1fr)`,
        // Bigger boards mean narrower tiles, so text scales with the ring rather
        // than being tuned for one tile count. 11 is the 40-tile board's `side`.
        ['--tile-scale' as string]: String(11 / side),
      }}
    >
      {map.tiles.map((tile, i) => {
        const pos = positions[i];
        if (!pos) return null;
        const ownership = state.tiles[i];
        return (
          <BoardTile
            key={tile.index}
            tile={tile}
            pos={pos}
            owner={ownership ? ownerOf(state.players, ownership.owner) : null}
            houses={ownership?.houses ?? 0}
            hotel={ownership?.hotel ?? false}
            tokens={playersByTile.get(tile.index) ?? []}
          />
        );
      })}
      <div className="board__center" style={{ gridRow: `2 / ${side}`, gridColumn: `2 / ${side}` }}>
        <div className="board__center-inner">
          {state.lastRoll && (
            <div className="board__dice">
              <Die value={state.lastRoll[0]} />
              <Die value={state.lastRoll[1]} />
            </div>
          )}
          <div className="board__phase">{formatPhase(state.phase)}</div>
        </div>
      </div>
    </div>
  );
}

function BoardTile({
  tile, pos, owner, houses, hotel, tokens,
}: {
  tile: Tile;
  pos: { row: number; col: number; edge: Edge; isCorner: boolean };
  owner: Player | null;
  houses: number;
  hotel: boolean;
  tokens: Player[];
}) {
  const { row, col, edge, isCorner } = pos;
  const icon = tileIcon(tile);
  const sub = tileSubLabel(tile);
  // Corners read upright; the four runs read along their own edge, which is what
  // buys side tiles enough room for a full city name instead of an ellipsis.
  const orient = isCorner ? 'corner' : edge;

  return (
    <div
      className={`tile tile--${tile.type} tile--o-${orient}${isCorner ? ' tile--corner' : ''}`}
      style={{ gridRow: row, gridColumn: col }}
      title={tile.name}
    >
      {tile.type === 'city' && (
        <div className="tile__stripe" style={{ background: countryColor(tile.countryId) }} />
      )}
      <div className="tile__inner">
        <div className="tile__name">{tile.name}</div>
        {icon && <div className="tile__icon">{icon}</div>}
        {sub && <div className="tile__sub">{sub}</div>}
        {'price' in tile && <div className="tile__price">${tile.price}</div>}
      </div>
      {owner && <div className="tile__owner" style={{ background: owner.color }} title={owner.name} />}
      {(houses > 0 || hotel) && (
        <div className="tile__buildings">{hotel ? '🏨' : '🏠'.repeat(houses)}</div>
      )}
      {tokens.length > 0 && (
        <div className="tile__tokens">
          {tokens.map(p => (
            <span key={p.id} className="token" style={{ background: p.color }} title={p.name} />
          ))}
        </div>
      )}
    </div>
  );
}
