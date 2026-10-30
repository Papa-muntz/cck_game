export type Team = 'TEAM_A' | 'TEAM_B';

export interface Player {
  id: string;
  name: string;
  team?: Team;
  isOnline: boolean;
  role?: string;
  socketId: string;
}

export type GameStateStatus =
  | 'LOBBY'
  | 'PREPARATION'
  | 'INSTRUCTION_1'
  | 'ROUND_1'
  | 'INSTRUCTION_2'
  | 'ROUND_2'
  | 'INSTRUCTION_3'
  | 'ROUND_3'
  | 'INSTRUCTION_4'
  | 'ROUND_4'
  | 'INSTRUCTION_5'
  | 'ROUND_5'
  | 'PAUSED'
  | 'ROUND_ENDED'
  | 'FINAL';

export interface GameState {
  id: string;
  status: GameStateStatus;
  previousStatus?: GameStateStatus;
  activeRound: number;
  timeRemaining: number;
  startTime?: number;
  isPaused: boolean;
  teams: {
    [key in Team]: {
      score: number;
      roundScores: Record<number, number>;
      size: number;
    }
  };
  players: Record<string, Player>;
  // Round specific state placeholders
  roundState: any;
}

export interface ClientToServerEvents {
  join: (data: { name: string; token: string }) => void;
  reconnect: (data: { token: string }) => void;
  // Host events
  hostLogin: (password: string) => void;
  createGame: () => void;
  closeRegistration: () => void;
  shuffleTeams: () => void;
  swapPlayer: (playerId: string, targetTeam: Team) => void;
  removePlayer: (playerId: string) => void;
  startGame: () => void;
  nextState: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endRoundEarly: () => void;
  showFinal: () => void;

  // Game events
  r1SubmitPath: (path: string[]) => void;
  r2SubmitNetwork: (networkState: any) => void;
  r3SubmitModules: (modules: any[]) => void;
  r4SubmitCard: (cardId: string, action: 'ALLOW' | 'BLOCK') => void;
  r5SubmitAction: (actionId: string) => void;

  // Terminal events
  registerTerminal: (code: string) => void;
}

export interface ServerToClientEvents {
  gameStateUpdate: (state: GameState) => void;
  joined: (data: { playerId: string; token: string }) => void;
  error: (message: string) => void;
  publicEvent: (message: string) => void;
  // Role specific updates
  playerData: (player: Player) => void;
  roundSpecificData: (data: any) => void;
  hostAuthenticated: (token: string) => void;
  terminalRegistered: (team: Team) => void;
}
