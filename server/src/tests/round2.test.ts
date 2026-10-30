import { describe, it, expect } from 'vitest';
import { generateNetwalkGrid, validateNetwalkSolution, rotateCell } from '../rounds/round2';

describe('Round 2 Logic', () => {
  it('should generate a grid', () => {
    const grid = generateNetwalkGrid('seed');
    expect(grid.width).toBe(5);
    expect(grid.height).toBe(5);
  });

  it('should rotate cell correctly', () => {
    expect(rotateCell(1)).toBe(2);
    expect(rotateCell(2)).toBe(4);
    expect(rotateCell(4)).toBe(8);
    expect(rotateCell(8)).toBe(1);
  });
});
