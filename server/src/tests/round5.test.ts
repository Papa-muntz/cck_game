import { describe, it, expect } from 'vitest';
import { generateRound5Actions } from '../rounds/round5';

describe('Round 5 Logic', () => {
  it('should generate actions without cycles', () => {
    const actions = generateRound5Actions(5);
    expect(actions.length).toBe(5);

    // Check no self dependencies
    actions.forEach(a => expect(a.dependsOn).not.toContain(a.id));
  });
});
