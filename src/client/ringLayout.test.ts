import { describe, it, expect } from 'vitest';
import { ringLayout } from './ringLayout';
describe('ring', () => {
  it('starts top-left and runs clockwise', () => {
    for (const n of [40, 48, 12, 24]) {
      const { side, positions, perSide } = ringLayout(n);
      expect(positions[0]).toMatchObject({ row: 1, col: 1, isCorner: true, edge: 'top' });
      expect(positions[perSide + 1]).toMatchObject({ row: 1, col: side, isCorner: true, edge: 'right' });
      expect(positions[2 * (perSide + 1)]).toMatchObject({ row: side, col: side, isCorner: true, edge: 'bottom' });
      expect(positions[3 * (perSide + 1)]).toMatchObject({ row: side, col: 1, isCorner: true, edge: 'left' });
      // every consecutive pair is adjacent on exactly one axis
      for (let i = 0; i < n; i++) {
        const a = positions[i]!, b = positions[(i + 1) % n]!;
        const d = Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
        expect(d).toBe(1);
      }
      expect(positions.filter(p => p.isCorner).length).toBe(4);
      expect(new Set(positions.map(p => `${p.row},${p.col}`)).size).toBe(n);
    }
  });
});
