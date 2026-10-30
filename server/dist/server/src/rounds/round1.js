"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CELL_COST = void 0;
exports.generateRound1Grid = generateRound1Grid;
exports.calculateOptimalTime = calculateOptimalTime;
exports.evaluatePath = evaluatePath;
exports.CELL_COST = {
    'NORMAL': 2,
    'SLOW': 4,
    'FAST': 1,
    'START': 0,
    'FINISH': 2,
    'WALL': Infinity
};
function generateRound1Grid(seed) {
    // Use a pseudo-random generator based on seed (simplified for now)
    const rng = () => Math.random();
    const width = 7;
    const height = 7;
    const cells = Array.from({ length: height }, () => Array.from({ length: width }, () => 'NORMAL'));
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
function calculateOptimalTime(grid) {
    const dist = Array.from({ length: grid.height }, () => Array.from({ length: grid.width }, () => Infinity));
    dist[grid.start.y][grid.start.x] = 0;
    const pq = [{ ...grid.start, cost: 0 }];
    const dirs = [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 }];
    while (pq.length > 0) {
        pq.sort((a, b) => a.cost - b.cost);
        const curr = pq.shift();
        if (curr.x === grid.finish.x && curr.y === grid.finish.y)
            return curr.cost;
        for (const dir of dirs) {
            const nx = curr.x + dir.dx;
            const ny = curr.y + dir.dy;
            if (nx >= 0 && nx < grid.width && ny >= 0 && ny < grid.height) {
                const cellType = grid.cells[ny][nx];
                if (cellType === 'WALL')
                    continue;
                const nextCost = curr.cost + exports.CELL_COST[cellType];
                if (nextCost < dist[ny][nx]) {
                    dist[ny][nx] = nextCost;
                    pq.push({ x: nx, y: ny, cost: nextCost });
                }
            }
        }
    }
    return Infinity; // If no path found
}
function evaluatePath(grid, path) {
    let curr = { ...grid.start };
    let time = 0;
    for (let i = 0; i < path.length; i++) {
        const p = path[i];
        let nx = curr.x;
        let ny = curr.y;
        if (p === 'UP')
            ny -= 1;
        else if (p === 'DOWN')
            ny += 1;
        else if (p === 'LEFT')
            nx -= 1;
        else if (p === 'RIGHT')
            nx += 1;
        if (nx < 0 || nx >= grid.width || ny < 0 || ny >= grid.height) {
            return { success: false, time, errorIndex: i };
        }
        const cellType = grid.cells[ny][nx];
        if (cellType === 'WALL') {
            return { success: false, time, errorIndex: i };
        }
        time += exports.CELL_COST[cellType];
        curr = { x: nx, y: ny };
        if (curr.x === grid.finish.x && curr.y === grid.finish.y) {
            return { success: true, time, errorIndex: -1 };
        }
    }
    return { success: false, time, errorIndex: path.length };
}
