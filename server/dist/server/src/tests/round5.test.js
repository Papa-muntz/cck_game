"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const round5_1 = require("../rounds/round5");
(0, vitest_1.describe)('Round 5 Logic', () => {
    (0, vitest_1.it)('should generate actions without cycles', () => {
        const actions = (0, round5_1.generateRound5Actions)(5);
        (0, vitest_1.expect)(actions.length).toBe(5);
        // Check no self dependencies
        actions.forEach(a => (0, vitest_1.expect)(a.dependsOn).not.toContain(a.id));
    });
});
