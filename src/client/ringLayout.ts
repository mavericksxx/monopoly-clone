/**
 * Pure geometry: maps a board's tile count onto a square CSS Grid ring.
 *
 * A square ring of N tiles has 4 corners and (N - 4) / 4 tiles per side.
 * Tile 0 sits in one corner; indices increase around the ring one side at a
 * time. This is entirely derived from `tileCount` — it must work for 40,
 * 48, or any other multiple-of-4-plus-4 board, so nothing here may hardcode
 * a tile count or a fixed coordinate.
 */

/** Which run of the ring a tile sits on. Corners belong to the run they start. */
export type Edge = 'bottom' | 'left' | 'top' | 'right';

export interface GridPos {
  row: number;
  col: number;
  edge: Edge;
  /** True for the four corner tiles, which get a square cell and upright text. */
  isCorner: boolean;
}

export interface RingLayout {
  /** Grid is `side` x `side` cells. */
  side: number;
  /** Non-corner tiles per side. */
  perSide: number;
  /** positions[i] is tile i's 1-indexed CSS Grid row/column. */
  positions: readonly GridPos[];
  /** Track sizes in grid units, outermost first: `[corner, 1 … 1, corner]`. */
  tracks: readonly number[];
}

/**
 * How much bigger a corner track is than a side track.
 *
 * On a real board the corners are square and the side tiles are narrow rectangles
 * standing on end — that shape is where a tile gets its depth into the board, and
 * with it the room to stack a name, a price and a flag. A uniform grid gives every
 * tile a square instead, which is why ours read as small: same area, no depth.
 *
 * A corner track carries both a corner's width and the depth of every tile on the
 * two runs it touches, so this one number sets both. 1.5 matches the proportion
 * richup uses (130px corners against 88px side tiles).
 */
export const CORNER_TRACK_RATIO = 1.5;

/**
 * Where a 1-indexed grid track sits along the board's edge, as percentages of that
 * edge. The token overlay needs this because the tracks are no longer equal, so
 * `100 / side` per cell is no longer the answer.
 */
export function trackSpan(
  tracks: readonly number[],
  index: number,
): { centre: number; size: number } {
  const total = tracks.reduce((a, b) => a + b, 0);
  let before = 0;
  for (let i = 0; i < index - 1; i++) before += tracks[i] ?? 0;
  const size = tracks[index - 1] ?? 1;
  return { centre: ((before + size / 2) / total) * 100, size: (size / total) * 100 };
}

const EDGES: readonly Edge[] = ['bottom', 'left', 'top', 'right'];

export function ringLayout(tileCount: number): RingLayout {
  if (!Number.isInteger(tileCount) || tileCount < 4 || (tileCount - 4) % 4 !== 0) {
    throw new Error(`ringLayout: ${tileCount} tiles cannot form a square ring`);
  }

  const perSide = (tileCount - 4) / 4;
  const side = perSide + 2;
  // Each side "owns" its leading corner plus `perSide` tiles.
  const segmentLength = perSide + 1;
  const positions: GridPos[] = [];

  for (let i = 0; i < tileCount; i++) {
    const segment = Math.floor(i / segmentLength);
    const posInSegment = i % segmentLength;
    let row: number;
    let col: number;
    const edge: Edge = EDGES[segment] ?? 'right';
    switch (segment) {
      case 0: // bottom row, right corner -> left corner
        row = side;
        col = side - posInSegment;
        break;
      case 1: // left column, bottom corner -> top corner
        row = side - posInSegment;
        col = 1;
        break;
      case 2: // top row, left corner -> right corner
        row = 1;
        col = 1 + posInSegment;
        break;
      default: // right column, top corner -> bottom corner (back to start)
        row = 1 + posInSegment;
        col = side;
        break;
    }
    positions.push({ row, col, edge, isCorner: posInSegment === 0 });
  }

  const tracks = [
    CORNER_TRACK_RATIO,
    ...Array.from({ length: perSide }, () => 1),
    CORNER_TRACK_RATIO,
  ];

  return { side, perSide, positions, tracks };
}
