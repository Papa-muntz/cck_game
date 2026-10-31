import { describe, it, expect } from 'vitest';
import { generateRound1Grid, calculateOptimalTime, evaluatePath, Grid } from '../rounds/round1';
import { RobotCommand } from '../../../shared/src/types';

describe('Round 1 Generator & BFS', () => {
  it('should guarantee a solvable grid path', () => {
    // Generate multiple random grids to ensure the BFS loop avoids blocked maps
    for (let i = 0; i < 50; i++) {
        const grid = generateRound1Grid(`seed-${i}`);
        const optimal = calculateOptimalTime(grid);
        expect(optimal).toBeLessThan(Infinity);
        expect(grid.width).toBe(7);
        expect(grid.height).toBe(7);
    }
  });
});

describe('Round 1 Path Evaluator', () => {
  it('should execute FORWARD and TURNS correctly with bounds', () => {
      const grid: Grid = {
          width: 3, height: 3,
          cells: [['START', 'NORMAL', 'NORMAL'], ['NORMAL', 'NORMAL', 'NORMAL'], ['NORMAL', 'NORMAL', 'FINISH']],
          walls: {
              vertical: [[false, false], [false, false], [false, false]],
              horizontal: [[false, false, false], [false, false, false]]
          },
          start: {x: 0, y: 0},
          finish: {x: 2, y: 2}
      };

      const commands: RobotCommand[] = ['FORWARD', 'FORWARD', 'TURN_RIGHT', 'FORWARD', 'FORWARD'];
      const res = evaluatePath(grid, commands);
      expect(res.success).toBe(true);
      expect(res.errorIndex).toBe(-1);
  });

  it('should fail on hitting a vertical wall', () => {
      const grid: Grid = {
          width: 3, height: 3,
          cells: [['START', 'NORMAL', 'NORMAL'], ['NORMAL', 'NORMAL', 'NORMAL'], ['NORMAL', 'NORMAL', 'FINISH']],
          walls: {
              vertical: [[true, false], [false, false], [false, false]], // Wall between (0,0) and (1,0)
              horizontal: [[false, false, false], [false, false, false]]
          },
          start: {x: 0, y: 0},
          finish: {x: 2, y: 2}
      };

      const commands: RobotCommand[] = ['FORWARD'];
      const res = evaluatePath(grid, commands);
      expect(res.success).toBe(false);
      expect(res.errorIndex).toBe(0);
  });
});
