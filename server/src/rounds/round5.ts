export interface ActionDependency {
  id: string;
  description: string;
  dependsOn: string[];
}

export function generateRound5Actions(playerCount: number): ActionDependency[] {
  // Simplified fixed graph for 5 stages
  return [
    { id: 'stage1', description: 'Enable Backup Power', dependsOn: [] },
    { id: 'stage2', description: 'Start Server', dependsOn: ['stage1'] },
    { id: 'stage3', description: 'Activate Network Services', dependsOn: ['stage2'] },
    { id: 'stage4', description: 'Connect Robot Control', dependsOn: ['stage3'] },
    { id: 'stage5', description: 'Final Launch Confirmation', dependsOn: ['stage4'] },
  ];
}
