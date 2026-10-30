"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const round2_1 = require("../rounds/round2");
(0, vitest_1.describe)('Round 2 Logic', () => {
    (0, vitest_1.it)('should generate a grid', () => {
        const grid = (0, round2_1.generateNetwalkGrid)('seed');
        (0, vitest_1.expect)(grid.width).toBe(5);
        (0, vitest_1.expect)(grid.height).toBe(5);
    });
    (0, vitest_1.it)('should rotate cell correctly', () => {
        (0, vitest_1.expect)((0, round2_1.rotateCell)(1)).toBe(2);
        (0, vitest_1.expect)((0, round2_1.rotateCell)(2)).toBe(4);
        (0, vitest_1.expect)((0, round2_1.rotateCell)(4)).toBe(8);
        (0, vitest_1.expect)((0, round2_1.rotateCell)(8)).toBe(1);
    });
});
