"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const round1_1 = require("../rounds/round1");
(0, vitest_1.describe)('Round 1 Logic', () => {
    (0, vitest_1.it)('should generate a grid with correct dimensions and start/finish', () => {
        const grid = (0, round1_1.generateRound1Grid)('seed');
        (0, vitest_1.expect)(grid.width).toBe(7);
        (0, vitest_1.expect)(grid.height).toBe(7);
        (0, vitest_1.expect)(grid.cells[grid.start.y][grid.start.x]).toBe('START');
        (0, vitest_1.expect)(grid.cells[grid.finish.y][grid.finish.x]).toBe('FINISH');
    });
    (0, vitest_1.it)('should calculate the optimal path', () => {
        const grid = (0, round1_1.generateRound1Grid)('seed');
        // Force a clear path for test
        for (let x = 0; x < 7; x++)
            grid.cells[0][x] = 'NORMAL';
        for (let y = 0; y < 7; y++)
            grid.cells[y][6] = 'NORMAL';
        grid.cells[0][0] = 'START';
        grid.cells[6][6] = 'FINISH';
        const time = (0, round1_1.calculateOptimalTime)(grid);
        (0, vitest_1.expect)(time).toBeLessThan(Infinity);
    });
});
