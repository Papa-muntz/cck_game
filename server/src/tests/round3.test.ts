import { describe, it, expect } from 'vitest';
import { generateRound3Modules, validateRound3Solution } from '../rounds/round3';

describe('Round 3 Logic', () => {
  it('should generate modules and solution', () => {
    const { modules, solution, hints } = generateRound3Modules('seed');
    expect(modules.length).toBe(6);
    expect(solution.length).toBe(4);
    expect(hints.length).toBe(3);
  });

  it('should validate correctly', () => {
    const { solution } = generateRound3Modules('seed');
    expect(validateRound3Solution(solution, solution)).toBe(true);
    expect(validateRound3Solution(solution, ['invalid'])).toBe(false);
  });
});
