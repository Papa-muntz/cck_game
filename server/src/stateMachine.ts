import { GameState, GameStateStatus } from '../../shared/src/types';

export class StateMachine {
  state: GameState;

  constructor(initialState: GameState) {
    this.state = initialState;
  }

  transition(newStatus: GameStateStatus) {
    this.state.previousStatus = this.state.status;
    this.state.status = newStatus;
  }

  pause() {
    this.state.isPaused = true;
  }

  resume() {
    this.state.isPaused = false;
  }
}
