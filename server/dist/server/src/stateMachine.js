"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateMachine = void 0;
class StateMachine {
    state;
    constructor(initialState) {
        this.state = initialState;
    }
    transition(newStatus) {
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
exports.StateMachine = StateMachine;
