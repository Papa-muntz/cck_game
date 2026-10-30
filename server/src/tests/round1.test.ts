import { describe, it, expect } from 'vitest';
import { generateRound1Grid, calculateOptimalTime, CellType } from '../rounds/round1';

describe('Round 1 Logic', () => {
  it('should generate a grid with correct dimensions and start/finish', () => {
    const grid = generateRound1Grid('seed');
    expect(grid.width).toBe(7);
    expect(grid.height).toBe(7);
    expect(grid.cells[grid.start.y][grid.start.x]).toBe('START');
    expect(grid.cells[grid.finish.y][grid.finish.x]).toBe('FINISH');
  });

  it('should calculate the optimal path', () => {
    const grid = generateRound1Grid('seed');
    // Force a clear path for test
    for (let x = 0; x < 7; x++) grid.cells[0][x] = 'NORMAL';
    for (let y = 0; y < 7; y++) grid.cells[y][6] = 'NORMAL';
    grid.cells[0][0] = 'START';
    grid.cells[6][6] = 'FINISH';

    const time = calculateOptimalTime(grid);
    expect(time).toBeLessThan(Infinity);
  });
});
