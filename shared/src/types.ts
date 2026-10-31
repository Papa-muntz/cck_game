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
  roundState: any;
}

export type RobotCommand = 'FORWARD' | 'TURN_LEFT' | 'TURN_RIGHT';

export interface ClientToServerEvents {
  join: (data: { name: string; token: string }) => void;
  reconnect: (data: { token: string }) => void;

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

  'round1:submitProgram': (path: RobotCommand[]) => void;
  r2SubmitNetwork: (cells: number[][]) => void;
  r3SubmitModules: (modules: string[]) => void;
  r4SubmitCard: (cardId: string, action: 'ALLOW' | 'BLOCK') => void;
  r5SubmitAction: (actionId: string) => void;

  registerTerminal: (code: string) => void;
  requestState: () => void;
}

export interface ServerToClientEvents {
  gameStateUpdate: (state: GameState) => void;
  joined: (data: { playerId: string; token: string }) => void;
  error: (message: string) => void;
  publicEvent: (message: string) => void;

  playerData: (player: Player) => void;
  roundSpecificData: (data: any) => void;

  'round1:fieldReady': (data: any) => void;
  'round1:start': () => void;
  'round1:result': (data: { success: boolean, time: number, errorIndex: number, length: number }) => void;
  'round1:teamBest': (data: { team: Team, time: number, player: string, length: number }) => void;
  'round1:end': () => void;

  r2Result: (data: { success: boolean }) => void;
  r3Error: (data: { blockedUntil: number }) => void;
  r4CardResult: (data: { success: boolean, explanation: string, nextCardIndex: number }) => void;
  r5ActionError: (data: { blockedUntil: number, message: string }) => void;

  hostAuthenticated: (token: string) => void;
  terminalRegistered: (team: Team) => void;
}
