"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNetwalkGrid = generateNetwalkGrid;
exports.rotateCell = rotateCell;
exports.validateNetwalkSolution = validateNetwalkSolution;
function generateNetwalkGrid(seed) {
    // Simplified generation: creates a solved tree, then rotates pieces randomly
    const width = 5;
    const height = 5;
    const cells = Array.from({ length: height }, () => Array(width).fill(0));
    // Generating a basic connected graph (line for simplicity, ideally a spanning tree)
    for (let i = 0; i < width - 1; i++) {
        cells[0][i] |= 2; // Right
        cells[0][i + 1] |= 8; // Left
    }
    for (let i = 0; i < height - 1; i++) {
        cells[i][0] |= 4; // Down
        cells[i + 1][0] |= 1; // Up
    }
    const serverPos = { x: 0, y: 0 };
    // Shuffle rotations
    const rng = () => Math.random();
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const rotations = Math.floor(rng() * 4);
            for (let r = 0; r < rotations; r++) {
                cells[y][x] = rotateCell(cells[y][x]);
            }
        }
    }
    return { width, height, cells, serverPos };
}
function rotateCell(val) {
    return ((val << 1) & 15) | (val >> 3);
}
function validateNetwalkSolution(grid, currentCells) {
    // BFS from server
    const visited = new Set();
    const q = [{ ...grid.serverPos }];
    visited.add(`${grid.serverPos.x},${grid.serverPos.y}`);
    let freeEnds = 0;
    while (q.length > 0) {
        const { x, y } = q.shift();
        const val = currentCells[y][x];
        // Check UP (1)
        if (val & 1) {
            if (y > 0 && (currentCells[y - 1][x] & 4)) {
                if (!visited.has(`${x},${y - 1}`)) {
                    visited.add(`${x},${y - 1}`);
                    q.push({ x, y: y - 1 });
                }
            }
            else {
                freeEnds++;
            }
        }
        // Check RIGHT (2)
        if (val & 2) {
            if (x < grid.width - 1 && (currentCells[y][x + 1] & 8)) {
                if (!visited.has(`${x + 1},${y}`)) {
                    visited.add(`${x + 1},${y}`);
                    q.push({ x: x + 1, y });
                }
            }
            else {
                freeEnds++;
            }
        }
        // Check DOWN (4)
        if (val & 4) {
            if (y < grid.height - 1 && (currentCells[y + 1][x] & 1)) {
                if (!visited.has(`${x},${y + 1}`)) {
                    visited.add(`${x},${y + 1}`);
                    q.push({ x, y: y + 1 });
                }
            }
            else {
                freeEnds++;
            }
        }
        // Check LEFT (8)
        if (val & 8) {
            if (x > 0 && (currentCells[y][x - 1] & 2)) {
                if (!visited.has(`${x - 1},${y}`)) {
                    visited.add(`${x - 1},${y}`);
                    q.push({ x: x - 1, y });
                }
            }
            else {
                freeEnds++;
            }
        }
    }
    const connectedCount = visited.size;
    const totalCells = grid.width * grid.height;
    const isComplete = connectedCount === totalCells && freeEnds === 0;
    return {
        isComplete,
        connectedFraction: connectedCount / totalCells
    };
}
