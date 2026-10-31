import { RobotCommand } from '../../../shared/src/types';

export type CellType = 'NORMAL' | 'SLOW' | 'FAST' | 'START' | 'FINISH';

export interface Grid {
  width: number;
  height: number;
  cells: CellType[][];
  walls: {
      vertical: boolean[][]; // [y][x] means wall between (x,y) and (x+1,y)
      horizontal: boolean[][]; // [y][x] means wall between (x,y) and (x,y+1)
  };
  start: { x: number, y: number };
  finish: { x: number, y: number };
}

export const CELL_COST = {
  'NORMAL': 2,
  'SLOW': 4,
  'FAST': 1,
  'START': 0,
  'FINISH': 2
};

// Seedable PRNG
function mulberry32(a: number) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export function generateRound1Grid(seedStr: string): Grid {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) seed += seedStr.charCodeAt(i);
  let rng = mulberry32(seed);

  const width = 7;
  const height = 7;

  let grid: Grid;
  let attempts = 0;
  let optimal = Infinity;

  // Guarantee a valid grid using BFS/Dijkstra
  do {
      attempts++;
      grid = {
          width, height,
          cells: Array.from({ length: height }, () => Array(width).fill('NORMAL')),
          walls: {
              vertical: Array.from({ length: height }, () => Array(width - 1).fill(false)),
              horizontal: Array.from({ length: height - 1 }, () => Array(width).fill(false))
          },
          start: { x: 0, y: Math.floor(rng() * height) },
          finish: { x: 6, y: Math.floor(rng() * height) }
      };

      grid.cells[grid.start.y][grid.start.x] = 'START';
      grid.cells[grid.finish.y][grid.finish.x] = 'FINISH';

      // Add random cell modifiers
      for (let i = 0; i < 6; i++) {
        let rx = Math.floor(rng() * width);
        let ry = Math.floor(rng() * height);
        if (grid.cells[ry][rx] === 'NORMAL') grid.cells[ry][rx] = 'SLOW';
      }
      for (let i = 0; i < 6; i++) {
        let rx = Math.floor(rng() * width);
        let ry = Math.floor(rng() * height);
        if (grid.cells[ry][rx] === 'NORMAL') grid.cells[ry][rx] = 'FAST';
      }

      // Add random walls (between cells)
      for (let i = 0; i < 12; i++) {
          if (rng() > 0.5) {
              let vx = Math.floor(rng() * (width - 1));
              let vy = Math.floor(rng() * height);
              grid.walls.vertical[vy][vx] = true;
          } else {
              let hx = Math.floor(rng() * width);
              let hy = Math.floor(rng() * (height - 1));
              grid.walls.horizontal[hy][hx] = true;
          }
      }

      optimal = calculateOptimalTime(grid);
  } while (optimal === Infinity && attempts < 100);

  // Fallback to empty walls if generation completely fails
  if (optimal === Infinity) {
      grid.walls.vertical = Array.from({ length: height }, () => Array(width - 1).fill(false));
      grid.walls.horizontal = Array.from({ length: height - 1 }, () => Array(width).fill(false));
  }

  return grid;
}

export function calculateOptimalTime(grid: Grid): number {
  const dist: number[][] = Array.from({ length: grid.height }, () =>
    Array.from({ length: grid.width }, () => Infinity)
  );
  dist[grid.start.y][grid.start.x] = 0;

  const pq: {x: number, y: number, cost: number}[] = [{ ...grid.start, cost: 0 }];

  const dirs = [{dx: 0, dy: 1, type: 'h'}, {dx: 0, dy: -1, type: 'h'}, {dx: 1, dy: 0, type: 'v'}, {dx: -1, dy: 0, type: 'v'}];

  while (pq.length > 0) {
    pq.sort((a, b) => a.cost - b.cost);
    const curr = pq.shift()!;

    if (curr.x === grid.finish.x && curr.y === grid.finish.y) return curr.cost;
    if (curr.cost > dist[curr.y][curr.x]) continue;

    for (const dir of dirs) {
      const nx = curr.x + dir.dx;
      const ny = curr.y + dir.dy;

      if (nx >= 0 && nx < grid.width && ny >= 0 && ny < grid.height) {
        // Wall check
        if (dir.type === 'h' && dir.dy === 1 && grid.walls.horizontal[curr.y][curr.x]) continue;
        if (dir.type === 'h' && dir.dy === -1 && grid.walls.horizontal[ny][nx]) continue;
        if (dir.type === 'v' && dir.dx === 1 && grid.walls.vertical[curr.y][curr.x]) continue;
        if (dir.type === 'v' && dir.dx === -1 && grid.walls.vertical[ny][nx]) continue;

        const cellType = grid.cells[ny][nx];
        const nextCost = curr.cost + CELL_COST[cellType];
        if (nextCost < dist[ny][nx]) {
          dist[ny][nx] = nextCost;
          pq.push({ x: nx, y: ny, cost: nextCost });
        }
      }
    }
  }

  return Infinity;
}

export function evaluatePath(grid: Grid, path: RobotCommand[]): { success: boolean, time: number, errorIndex: number } {
  let curr = { ...grid.start };
  let dir = 1; // 0: Up, 1: Right, 2: Down, 3: Left
  let time = 0;

  for (let i = 0; i < path.length; i++) {
    const cmd = path[i];

    if (cmd === 'TURN_LEFT') {
        dir = (dir + 3) % 4;
        continue;
    }
    if (cmd === 'TURN_RIGHT') {
        dir = (dir + 1) % 4;
        continue;
    }

    if (cmd === 'FORWARD') {
        let nx = curr.x;
        let ny = curr.y;

        if (dir === 0) ny -= 1;
        else if (dir === 1) nx += 1;
        else if (dir === 2) ny += 1;
        else if (dir === 3) nx -= 1;

        // Bounds check
        if (nx < 0 || nx >= grid.width || ny < 0 || ny >= grid.height) {
            return { success: false, time, errorIndex: i };
        }

        // Wall check
        if (dir === 0 && grid.walls.horizontal[ny][nx]) return { success: false, time, errorIndex: i }; // moving up, wall is above ny
        if (dir === 1 && grid.walls.vertical[curr.y][curr.x]) return { success: false, time, errorIndex: i }; // moving right, wall is right of curr
        if (dir === 2 && grid.walls.horizontal[curr.y][curr.x]) return { success: false, time, errorIndex: i }; // moving down, wall is below curr
        if (dir === 3 && grid.walls.vertical[ny][nx]) return { success: false, time, errorIndex: i }; // moving left, wall is left of curr

        const cellType = grid.cells[ny][nx];
        time += CELL_COST[cellType];
        curr = { x: nx, y: ny };

        if (curr.x === grid.finish.x && curr.y === grid.finish.y) {
            return { success: true, time, errorIndex: -1 };
        }
    }
  }

  // Did not reach finish
  return { success: false, time, errorIndex: path.length - 1 };
}
