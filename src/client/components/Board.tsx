import { useEffect, useRef, useState } from 'react';
import type { GameEvent, GameMap, GameState, Player, Tile } from '../../shared/types';
import { ringLayout, type Edge, type GridPos } from '../ringLayout';
import { countryTint } from '../colors';
import { countryFlag, tileIcon, tileSubLabel } from '../tileArt';
import { EventLog, getCardSafe } from './EventLog';

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

/**
 * Rotation that brings each face to the front of the cube. The inverse of where
 * the face itself is pinned in `styles.css` — face 2 sits at rotateX(90deg), so
 * showing it means turning the cube back by -90.
 */
const FACE_REST: Readonly<Record<number, readonly [number, number]>> = {
  1: [0, 0],
  2: [-90, 0],
  3: [0, -90],
  4: [0, 90],
  5: [90, 0],
  6: [0, 180],
};

/**
 * A real cube: six pipped faces in 3D, tumbled by transitioning to a rotation
 * several whole turns past where it needs to land. `turns` counts rolls, so each
 * roll adds another full spin and the CSS transition does the settling.
 *
 * The tumble is still decoration and never decides anything: the resting rotation
 * is derived from the authoritative `value`, so a client that joins mid-game
 * renders the current face at `turns === 0` with no animation to replay, and the
 * a11y label always names the real value even mid-spin.
 */
function Die({ value, turns }: { value: number; turns: number }) {
  const [restX, restY] = FACE_REST[value] ?? [0, 0];
  return (
    <div className="die" aria-label={`die showing ${value}`}>
      <div
        className="die__cube"
        style={{ transform: `rotateX(${restX - turns * 360}deg) rotateY(${restY + turns * 720}deg)` }}
      >
        {[1, 2, 3, 4, 5, 6].map(face => (
          <div key={face} className={`die__face die__face--${face}`}>
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} className={PIP_CELLS[face]!.includes(i) ? 'die__pip' : ''} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

type CardDrawnEvent = Extract<GameEvent, { type: 'card_drawn' }>;

/** Drives both the dice tumble and the drawn-card popup off the same scan of
 * what's newly arrived in `events` — an object-identity walk back from the
 * end to the last event already seen, not a length check, since the log
 * array gets truncated once it hits its cap. Only events appended since the
 * last render count as "new", so a client joining mid-game replays neither:
 * `state.lastRoll` renders correctly with no `rolled` event to animate it,
 * and no stale `card_drawn` pops up.
 *
 * The dice deliberately don't key off `state.lastRoll` changing — every
 * `state` message carries a freshly-parsed `lastRoll` array (same values or
 * not), so reference equality would tumble the dice on a buy, a build, or
 * any other player's turn. A `rolled` event is the one authoritative signal
 * that a roll actually happened. */
function useBoardEventEffects(
  events: readonly GameEvent[],
): { drawnCard: CardDrawnEvent | null; rolling: boolean } {
  const [drawnCard, setDrawnCard] = useState<CardDrawnEvent | null>(null);
  const [rolling, setRolling] = useState(false);
  const lastSeen = useRef<GameEvent | null>(events.length > 0 ? events[events.length - 1]! : null);
  // Held in refs, not cleared by this effect's cleanup: `events` changes on every
  // broadcast, and a card's own effect emits `paid`/`moved` in the very next one — a
  // cleanup that killed pending timers would cancel the dismissal that batch triggered
  // and leave the popup (or the tumbling dice) on screen until the next card or roll.
  const cardTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (cardTimer.current) clearTimeout(cardTimer.current);
    if (rollTimer.current) clearTimeout(rollTimer.current);
  }, []);

  useEffect(() => {
    const boundary = lastSeen.current;
    const fresh: GameEvent[] = [];
    for (let i = events.length - 1; i >= 0; i--) {
      const event = events[i]!;
      if (event === boundary) break;
      fresh.push(event);
    }
    lastSeen.current = events.length > 0 ? events[events.length - 1]! : lastSeen.current;

    const card = fresh.find(
      (e): e is CardDrawnEvent => e.type === 'card_drawn' && getCardSafe(e.cardId) !== null,
    );
    if (card) {
      if (cardTimer.current) clearTimeout(cardTimer.current);
      setDrawnCard(card);
      cardTimer.current = setTimeout(() => setDrawnCard(null), 4500);
    }

    if (fresh.some((e) => e.type === 'rolled')) {
      if (rollTimer.current) clearTimeout(rollTimer.current);
      setRolling(true);
      rollTimer.current = setTimeout(() => setRolling(false), 900);
    }
  }, [events]);

  return { drawnCard, rolling };
}

function DrawnCardPanel({ event, players }: { event: CardDrawnEvent; players: readonly Player[] }) {
  const card = getCardSafe(event.cardId);
  if (!card) return null;
  const drawer = players.find(p => p.id === event.playerId);
  return (
    <div className="board__card-popup" role="status">
      <div className="board__card-popup-deck">{event.deck} card</div>
      <div className="board__card-popup-text">{card.text}</div>
      {drawer && <div className="board__card-popup-player">{drawer.name}</div>}
    </div>
  );
}

/** Fractional (dx, dy) nudge, as a share of one cell, for the i-th of `count`
 * tokens sharing a tile — spread evenly around a small circle so any group
 * size (rooms allow up to 8 players) stays distinguishable instead of a
 * fixed-length table silently stacking token 6 on top of token 1. */
function tokenOffset(index: number, count: number): readonly [number, number] {
  if (count <= 1) return [0, 0];
  const angle = (2 * Math.PI * index) / count - Math.PI / 2;
  const radius = 0.2;
  return [radius * Math.cos(angle), radius * Math.sin(angle)];
}

/**
 * The tile a token is *drawn* on, which walks the ring one tile at a time toward
 * the tile the server says it occupies. Transitioning straight from the old
 * position to the new one interpolates both axes at once and cuts diagonally
 * across the board; every adjacent pair of ring positions differs on exactly one
 * axis, so stepping tile by tile keeps the token on the track.
 *
 * Long hops are teleports, not walks — going to prison, or a card sending you
 * across the board — and are snapped. The cut-off is a fraction of the ring, never
 * a dice-sized constant: boards are 40 or 48 tiles and nothing here may assume which.
 *
 * The effect keys on `target` alone, so an unrelated re-render (another player's
 * move, a rent payment) can't restart or abort a walk in progress; a genuinely new
 * target mid-walk just re-aims from wherever the token had got to.
 */
function useWalkedTile(target: number, tileCount: number): number {
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);

  useEffect(() => {
    const from = shownRef.current;
    if (from === target) return;
    const forward = (((target - from) % tileCount) + tileCount) % tileCount;
    const step = forward <= tileCount - forward ? 1 : -1;
    if (Math.min(forward, tileCount - forward) > tileCount / 4) {
      shownRef.current = target;
      setShown(target);
      return;
    }
    const id = setInterval(() => {
      const next = (((shownRef.current + step) % tileCount) + tileCount) % tileCount;
      shownRef.current = next;
      setShown(next);
      if (next === target) clearInterval(id);
    }, 130);
    return () => clearInterval(id);
  }, [target, tileCount]);

  return shown;
}

/**
 * Shifts a token toward the middle of the board so it sits above the tile's own
 * label instead of covering it — the tile has to stay readable while occupied.
 * Corners are square and roomy enough not to need it.
 */
function centreNudge(pos: GridPos): readonly [number, number] {
  if (pos.isCorner) return [0, 0];
  switch (pos.edge) {
    case 'bottom': return [0, -0.22];
    case 'top': return [0, 0.22];
    case 'left': return [0.22, 0];
    default: return [-0.22, 0];
  }
}

function Token({
  player, positions, side, offset, isCurrent,
}: {
  player: Player;
  positions: readonly GridPos[];
  side: number;
  offset: readonly [number, number];
  isCurrent: boolean;
}) {
  const shownTile = useWalkedTile(player.tileIndex, positions.length);
  const pos = positions[shownTile];
  if (!pos) return null;
  const cell = 100 / side;
  const [nx, ny] = centreNudge(pos);
  const [dx, dy] = offset;
  return (
    <span
      className={`token${isCurrent ? ' token--turn' : ''}`}
      style={{
        left: `${(pos.col - 0.5 + nx + dx) * cell}%`,
        top: `${(pos.row - 0.5 + ny + dy) * cell}%`,
        background: player.color,
      }}
      title={player.name}
    >
      <span className="token__eye" />
      <span className="token__eye" />
    </span>
  );
}

function TokenLayer({
  side, positions, players, currentPlayerId,
}: {
  side: number;
  positions: readonly GridPos[];
  players: readonly Player[];
  currentPlayerId: string | undefined;
}) {
  const live = players.filter(p => !p.bankrupt);
  const byTile = new Map<number, Player[]>();
  for (const p of live) {
    const arr = byTile.get(p.tileIndex) ?? [];
    arr.push(p);
    byTile.set(p.tileIndex, arr);
  }

  return (
    <div className="board__tokens-layer" style={{ gridRow: `1 / -1`, gridColumn: `1 / -1` }}>
      {live.map(p => {
        const group = byTile.get(p.tileIndex) ?? [p];
        return (
          <Token
            key={p.id}
            player={p}
            positions={positions}
            side={side}
            offset={tokenOffset(group.indexOf(p), group.length)}
            isCurrent={p.id === currentPlayerId}
          />
        );
      })}
    </div>
  );
}

export function Board({
  map, state, events = [],
}: {
  map: GameMap;
  state: GameState;
  events?: readonly GameEvent[];
}) {
  const { side, positions } = ringLayout(map.tiles.length);
  const { drawnCard, rolling } = useBoardEventEffects(events);
  // One more whole spin per roll; the dice transition to the new rotation and settle.
  const [turns, setTurns] = useState(0);
  useEffect(() => { if (rolling) setTurns(t => t + 1); }, [rolling]);

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
          />
        );
      })}
      <TokenLayer
        side={side}
        positions={positions}
        players={state.players}
        currentPlayerId={state.turnOrder[state.currentPlayerIndex]}
      />
      <div className="board__center" style={{ gridRow: `2 / ${side}`, gridColumn: `2 / ${side}` }}>
        <div className="board__center-inner">
          {state.lastRoll && (
            <div className="board__dice">
              <Die value={state.lastRoll[0]} turns={turns} />
              <Die value={state.lastRoll[1]} turns={turns} />
            </div>
          )}
          <div className="board__phase">{formatPhase(state.phase)}</div>
          {state.vacationPot > 0 && (
            <div className="board__vacation-pot">Vacation pot: ${state.vacationPot}</div>
          )}
          <EventLog events={events} players={state.players} />
          {drawnCard && <DrawnCardPanel event={drawnCard} players={state.players} />}
        </div>
      </div>
    </div>
  );
}

function BoardTile({
  tile, pos, owner, houses, hotel,
}: {
  tile: Tile;
  pos: { row: number; col: number; edge: Edge; isCorner: boolean };
  owner: Player | null;
  houses: number;
  hotel: boolean;
}) {
  const { row, col, edge, isCorner } = pos;
  // A city is identified by its tint and its flag badge, so it skips the generic icon.
  const icon = tile.type === 'city' ? '' : tileIcon(tile);
  const sub = tileSubLabel(tile);
  // Corners read upright; the four runs read along their own edge, which is what
  // buys side tiles enough room for a full city name instead of an ellipsis.
  const orient = isCorner ? 'corner' : edge;

  return (
    <div
      className={`tile tile--${tile.type} tile--o-${orient}${isCorner ? ' tile--corner' : ''}`}
      style={{ gridRow: row, gridColumn: col, backgroundImage: tile.type === 'city' ? countryTint(tile.countryId) : undefined }}
      title={tile.name}
    >
      <div className="tile__inner">
        <div className="tile__name">{tile.name}</div>
        {icon && <div className="tile__icon">{icon}</div>}
        {sub && <div className="tile__sub">{sub}</div>}
        {'price' in tile && <div className="tile__price">${tile.price}</div>}
        {tile.type === 'city' && <div className="tile__flag">{countryFlag(tile.countryId)}</div>}
      </div>
      {owner && <div className="tile__owner" style={{ background: owner.color }} title={owner.name} />}
      {(houses > 0 || hotel) && (
        <div className="tile__buildings">{hotel ? '🏨' : '🏠'.repeat(houses)}</div>
      )}
    </div>
  );
}
