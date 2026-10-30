export type CellType = 'NORMAL' | 'SLOW' | 'FAST' | 'START' | 'FINISH' | 'WALL';

export interface Grid {
  width: number;
  height: number;
  cells: CellType[][];
  start: { x: number, y: number };
  finish: { x: number, y: number };
}

export const CELL_COST = {
  'NORMAL': 2,
  'SLOW': 4,
  'FAST': 1,
  'START': 0,
  'FINISH': 2,
  'WALL': Infinity
};

export function generateRound1Grid(seed: string): Grid {
  // Use a pseudo-random generator based on seed (simplified for now)
  const rng = () => Math.random();

  const width = 7;
  const height = 7;
  const cells: CellType[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 'NORMAL')
  );

  // Add some random walls, slow, fast cells
  for (let i = 0; i < 10; i++) {
    cells[Math.floor(rng() * height)][Math.floor(rng() * width)] = 'WALL';
  }
  for (let i = 0; i < 5; i++) {
    cells[Math.floor(rng() * height)][Math.floor(rng() * width)] = 'SLOW';
  }
  for (let i = 0; i < 5; i++) {
    cells[Math.floor(rng() * height)][Math.floor(rng() * width)] = 'FAST';
  }

  const start = { x: 0, y: 0 };
  const finish = { x: 6, y: 6 };
  cells[start.y][start.x] = 'START';
  cells[finish.y][finish.x] = 'FINISH';

  return { width, height, cells, start, finish };
}

// Dijkstra for calculating the optimal time
export function calculateOptimalTime(grid: Grid): number {
  const dist: number[][] = Array.from({ length: grid.height }, () =>
    Array.from({ length: grid.width }, () => Infinity)
  );
  dist[grid.start.y][grid.start.x] = 0;

  const pq: {x: number, y: number, cost: number}[] = [{ ...grid.start, cost: 0 }];

  const dirs = [{dx: 0, dy: 1}, {dx: 0, dy: -1}, {dx: 1, dy: 0}, {dx: -1, dy: 0}];

  while (pq.length > 0) {
    pq.sort((a, b) => a.cost - b.cost);
    const curr = pq.shift()!;

    if (curr.x === grid.finish.x && curr.y === grid.finish.y) return curr.cost;

    for (const dir of dirs) {
      const nx = curr.x + dir.dx;
      const ny = curr.y + dir.dy;

      if (nx >= 0 && nx < grid.width && ny >= 0 && ny < grid.height) {
        const cellType = grid.cells[ny][nx];
        if (cellType === 'WALL') continue;

        const nextCost = curr.cost + CELL_COST[cellType];
        if (nextCost < dist[ny][nx]) {
          dist[ny][nx] = nextCost;
          pq.push({ x: nx, y: ny, cost: nextCost });
        }
      }
    }
  }

  return Infinity; // If no path found
}
