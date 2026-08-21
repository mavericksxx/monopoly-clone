import type { GameMap, GameState, Player, Tile } from '../../shared/types';
import { ringLayout } from '../ringLayout';
import { countryColor } from '../colors';

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
      style={{ gridTemplateColumns: `repeat(${side}, 1fr)`, gridTemplateRows: `repeat(${side}, 1fr)` }}
    >
      {map.tiles.map((tile, i) => {
        const pos = positions[i];
        if (!pos) return null;
        const ownership = state.tiles[i];
        const tokens = playersByTile.get(tile.index) ?? [];
        return (
          <BoardTile
            key={tile.index}
            tile={tile}
            row={pos.row}
            col={pos.col}
            owner={ownership ? ownerOf(state.players, ownership.owner) : null}
            houses={ownership?.houses ?? 0}
            hotel={ownership?.hotel ?? false}
            tokens={tokens}
          />
        );
      })}
      <div className="board__center" style={{ gridRow: `2 / ${side}`, gridColumn: `2 / ${side}` }}>
        <div className="board__center-inner">
          {state.lastRoll && (
            <div className="board__dice">{state.lastRoll[0]} + {state.lastRoll[1]}</div>
          )}
          <div className="board__phase">{formatPhase(state.phase)}</div>
        </div>
      </div>
    </div>
  );
}

function BoardTile({
  tile, row, col, owner, houses, hotel, tokens,
}: {
  tile: Tile;
  row: number;
  col: number;
  owner: Player | null;
  houses: number;
  hotel: boolean;
  tokens: Player[];
}) {
  return (
    <div className={`tile tile--${tile.type}`} style={{ gridRow: row, gridColumn: col }}>
      {tile.type === 'city' && (
        <div className="tile__stripe" style={{ background: countryColor(tile.countryId) }} />
      )}
      <div className="tile__name">{tile.name}</div>
      {'price' in tile && <div className="tile__price">${tile.price}</div>}
      {owner && <div className="tile__owner" style={{ background: owner.color }} title={owner.name} />}
      {(houses > 0 || hotel) && (
        <div className="tile__buildings">{hotel ? 'H' : '■'.repeat(houses)}</div>
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
