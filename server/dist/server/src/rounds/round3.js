"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRound3Modules = generateRound3Modules;
exports.validateRound3Solution = validateRound3Solution;
function generateRound3Modules(seed) {
    // Simplified logic
    const modules = [
        { id: '1', symbol: 'alpha', color: 'red', label: 'A1' },
        { id: '2', symbol: 'beta', color: 'blue', label: 'B2' },
        { id: '3', symbol: 'gamma', color: 'green', label: 'C3' },
        { id: '4', symbol: 'delta', color: 'yellow', label: 'D4' },
        { id: '5', symbol: 'epsilon', color: 'purple', label: 'E5' },
        { id: '6', symbol: 'zeta', color: 'orange', label: 'F6' }
    ];
    const solution = ['1', '3', '2', '6']; // Example specific correct order
    const hints = [
        ['The first module is red.', 'Module C3 is used.'], // Wave 1
        ['The blue module is after the green one.', 'The last module is orange.'], // Wave 2
        ['The third module is B2.', 'A1 is not the second module.'] // Wave 3
    ];
    return { modules, solution, hints };
}
function validateRound3Solution(solution, attempt) {
    if (solution.length !== attempt.length)
        return false;
    for (let i = 0; i < solution.length; i++) {
        if (solution[i] !== attempt[i])
            return false;
    }
    return true;
}
