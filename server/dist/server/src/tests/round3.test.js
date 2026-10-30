"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const round3_1 = require("../rounds/round3");
(0, vitest_1.describe)('Round 3 Logic', () => {
    (0, vitest_1.it)('should generate modules and solution', () => {
        const { modules, solution, hints } = (0, round3_1.generateRound3Modules)('seed');
        (0, vitest_1.expect)(modules.length).toBe(6);
        (0, vitest_1.expect)(solution.length).toBe(4);
        (0, vitest_1.expect)(hints.length).toBe(3);
    });
    (0, vitest_1.it)('should validate correctly', () => {
        const { solution } = (0, round3_1.generateRound3Modules)('seed');
        (0, vitest_1.expect)((0, round3_1.validateRound3Solution)(solution, solution)).toBe(true);
        (0, vitest_1.expect)((0, round3_1.validateRound3Solution)(solution, ['invalid'])).toBe(false);
    });
});
