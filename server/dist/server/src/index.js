"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const db_1 = __importStar(require("./db"));
const stateMachine_1 = require("./stateMachine");
const round1_1 = require("./rounds/round1");
const round2_1 = require("./rounds/round2");
const round3_1 = require("./rounds/round3");
const round4_1 = require("./rounds/round4");
const round5_1 = require("./rounds/round5");
const scoring_1 = require("./scoring");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
app.use((0, cors_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, '../../client/dist')));
// Fallback logic for SPA that works with express 5 / path-to-regexp v8
app.use((req, res, next) => {
    if (req.path.startsWith('/socket.io')) {
        return next();
    }
    if (req.path.startsWith('/api')) {
        if (req.path === '/api/history') {
            try {
                const stmt = db_1.default.prepare('SELECT * FROM games WHERE is_finished = 1');
                const history = stmt.all();
                return res.json(history);
            }
            catch (e) {
                return res.status(500).json({ error: 'Database error' });
            }
        }
        return next();
    }
    res.sendFile(path_1.default.resolve(__dirname, '../../client/dist/index.html'));
});
let currentGame = {
    id: 'game_' + Date.now(),
    status: 'LOBBY',
    activeRound: 0,
    timeRemaining: 0,
    isPaused: false,
    teams: {
        'TEAM_A': { score: 0, roundScores: {}, size: 0 },
        'TEAM_B': { score: 0, roundScores: {}, size: 0 }
    },
    players: {},
    roundState: {}
};
const stateMachine = new stateMachine_1.StateMachine(currentGame);
let activeTimers = [];
function clearTimers() {
    activeTimers.forEach(t => clearTimeout(t));
    activeTimers = [];
}
function processRoundEnd(round) {
    if (round === 1) {
        const bestA = currentGame.roundState.bestTimes['TEAM_A'];
        const bestB = currentGame.roundState.bestTimes['TEAM_B'];
        const optimal = currentGame.roundState.optimalTime;
        currentGame.teams['TEAM_A'].roundScores[1] = (0, scoring_1.calculateRound1Score)(optimal, bestA);
        currentGame.teams['TEAM_B'].roundScores[1] = (0, scoring_1.calculateRound1Score)(optimal, bestB);
    }
    else if (round === 2) {
        const aScores = [];
        const bScores = [];
        Object.entries(currentGame.players).forEach(([id, player]) => {
            if (!player.team)
                return;
            const data = currentGame.roundState.playerResults?.[id];
            const score = (0, scoring_1.calculateRound2IndividualScore)(!!data?.isComplete, data?.connectedFraction || 0, 0);
            if (player.team === 'TEAM_A')
                aScores.push(score);
            else
                bScores.push(score);
        });
        currentGame.teams['TEAM_A'].roundScores[2] = (0, scoring_1.calculateRound2TeamScore)(aScores);
        currentGame.teams['TEAM_B'].roundScores[2] = (0, scoring_1.calculateRound2TeamScore)(bScores);
    }
    else if (round === 3) {
        currentGame.teams['TEAM_A'].roundScores[3] = (0, scoring_1.calculateRound3Score)(!!currentGame.roundState.success['TEAM_A'], 0.5);
        currentGame.teams['TEAM_B'].roundScores[3] = (0, scoring_1.calculateRound3Score)(!!currentGame.roundState.success['TEAM_B'], 0.5);
    }
    else if (round === 4) {
        const aScores = [];
        const bScores = [];
        Object.entries(currentGame.players).forEach(([id, player]) => {
            if (!player.team)
                return;
            const res = currentGame.roundState.cardResults?.[id] || { correct: 0, answered: 0 };
            const ratio = res.answered > 0 ? res.correct / 8 : 0;
            const score = (0, scoring_1.calculateRound4IndividualScore)(ratio, res.answered === 8, 0);
            if (player.team === 'TEAM_A')
                aScores.push(score);
            else
                bScores.push(score);
        });
        currentGame.teams['TEAM_A'].roundScores[4] = (0, scoring_1.calculateRound4TeamScore)(aScores);
        currentGame.teams['TEAM_B'].roundScores[4] = (0, scoring_1.calculateRound4TeamScore)(bScores);
    }
    else if (round === 5) {
        const totalA = currentGame.teams['TEAM_A'].size;
        const totalB = currentGame.teams['TEAM_B'].size;
        const completedA = Object.values(currentGame.players).filter(p => p.team === 'TEAM_A' && currentGame.roundState.actionsCompleted?.[p.id]).length;
        const completedB = Object.values(currentGame.players).filter(p => p.team === 'TEAM_B' && currentGame.roundState.actionsCompleted?.[p.id]).length;
        currentGame.teams['TEAM_A'].roundScores[5] = (0, scoring_1.calculateRound5Score)(totalA > 0 ? completedA / totalA : 0, completedA === totalA, 0.5);
        currentGame.teams['TEAM_B'].roundScores[5] = (0, scoring_1.calculateRound5Score)(totalB > 0 ? completedB / totalB : 0, completedB === totalB, 0.5);
    }
    currentGame.teams['TEAM_A'].score = Object.values(currentGame.teams['TEAM_A'].roundScores).reduce((a, b) => a + b, 0);
    currentGame.teams['TEAM_B'].score = Object.values(currentGame.teams['TEAM_B'].roundScores).reduce((a, b) => a + b, 0);
}
function generateRoundData() {
    clearTimers();
    if (currentGame.status === 'ROUND_1') {
        const grid = (0, round1_1.generateRound1Grid)(currentGame.id);
        const optimalTime = (0, round1_1.calculateOptimalTime)(grid);
        currentGame.roundState = {
            grid,
            optimalTime,
            bestTimes: { 'TEAM_A': Infinity, 'TEAM_B': Infinity }
        };
        io.emit('roundSpecificData', currentGame.roundState);
    }
    else if (currentGame.status === 'ROUND_2') {
        const netwalkGrids = {};
        currentGame.roundState = { netwalkGrids, playerResults: {} };
        Object.keys(currentGame.players).forEach(id => {
            const grid = (0, round2_1.generateNetwalkGrid)(currentGame.id + id);
            netwalkGrids[id] = grid;
            io.to(currentGame.players[id].socketId).emit('roundSpecificData', { netwalkGrid: grid });
        });
    }
    else if (currentGame.status === 'ROUND_3') {
        const mDataA = (0, round3_1.generateRound3Modules)(currentGame.id + 'A');
        const mDataB = (0, round3_1.generateRound3Modules)(currentGame.id + 'B');
        currentGame.roundState = {
            modulesA: mDataA.modules, solutionA: mDataA.solution, hintsA: mDataA.hints,
            modulesB: mDataB.modules, solutionB: mDataB.solution, hintsB: mDataB.hints,
            success: { 'TEAM_A': false, 'TEAM_B': false }
        };
        io.emit('roundSpecificData', { modules: mDataA.modules, team: 'TEAM_A' });
        io.emit('roundSpecificData', { modules: mDataB.modules, team: 'TEAM_B' });
        const sendHints = (waveIdx) => {
            if (currentGame.isPaused)
                return; // Note: In full implementation, we'd need to pause timer actually, but here we just block sending.
            Object.values(currentGame.players).forEach(p => {
                if (p.team === 'TEAM_A') {
                    io.to(p.socketId).emit('roundSpecificData', { hints: mDataA.hints.slice(0, waveIdx + 1).flat() });
                }
                else if (p.team === 'TEAM_B') {
                    io.to(p.socketId).emit('roundSpecificData', { hints: mDataB.hints.slice(0, waveIdx + 1).flat() });
                }
            });
        };
        sendHints(0);
        activeTimers.push(setTimeout(() => sendHints(1), 20000));
        activeTimers.push(setTimeout(() => sendHints(2), 40000));
    }
    else if (currentGame.status === 'ROUND_4') {
        currentGame.roundState = { cardResults: {} };
        Object.values(currentGame.players).forEach(p => {
            const cards = (0, round4_1.generatePlayerCards)(currentGame.id + p.id);
            currentGame.roundState.cardResults[p.id] = { cards, currentIdx: 0, correct: 0, answered: 0 };
            io.to(p.socketId).emit('roundSpecificData', { card: cards[0] });
        });
    }
    else if (currentGame.status === 'ROUND_5') {
        currentGame.roundState = { actionsCompleted: {}, graph: (0, round5_1.generateRound5Actions)(Object.keys(currentGame.players).length) };
        const actions = currentGame.roundState.graph;
        let i = 0;
        Object.values(currentGame.players).forEach(p => {
            io.to(p.socketId).emit('roundSpecificData', { action: actions[i % actions.length] });
            i++;
        });
    }
    else if (currentGame.status === 'FINAL') {
        const stmt = db_1.default.prepare('UPDATE games SET is_finished = 1, state = ? WHERE id = ?');
        stmt.run(JSON.stringify(currentGame), currentGame.id);
    }
}
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    // Basic mechanism for reconnect based on token could be here, for now token is just socket.id in simple test.
    // Send state safely (hide scores if not final)
    const safeState = JSON.parse(JSON.stringify(stateMachine.state));
    if (safeState.status !== 'FINAL') {
        safeState.teams.TEAM_A.score = 0;
        safeState.teams.TEAM_B.score = 0;
        safeState.teams.TEAM_A.roundScores = {};
        safeState.teams.TEAM_B.roundScores = {};
    }
    socket.emit('gameStateUpdate', safeState);
    socket.on('join', (data) => {
        const playerId = socket.id;
        const token = data.token || playerId;
        if (stateMachine.state.status !== 'LOBBY') {
            socket.emit('error', 'Регистрация закрыта');
            return;
        }
        stateMachine.state.players[playerId] = {
            id: playerId,
            name: data.name,
            isOnline: true,
            socketId: socket.id
        };
        socket.emit('joined', { playerId, token });
        const safeState2 = JSON.parse(JSON.stringify(stateMachine.state));
        safeState2.teams.TEAM_A.score = 0;
        safeState2.teams.TEAM_B.score = 0;
        io.emit('gameStateUpdate', safeState2);
        io.emit('publicEvent', `${data.name} присоединился к игре!`);
    });
    socket.on('hostLogin', (password) => {
        if (password === process.env.HOST_PASSWORD) {
            socket.emit('hostAuthenticated', 'host_token');
            // Host gets real state
            socket.emit('gameStateUpdate', stateMachine.state);
        }
        else {
            socket.emit('error', 'Неверный пароль');
        }
    });
    socket.on('closeRegistration', () => {
        const players = Object.values(stateMachine.state.players);
        let aCount = 0;
        let bCount = 0;
        for (const player of players) {
            if (aCount <= bCount) {
                player.team = 'TEAM_A';
                aCount++;
            }
            else {
                player.team = 'TEAM_B';
                bCount++;
            }
        }
        stateMachine.state.teams['TEAM_A'].size = aCount;
        stateMachine.state.teams['TEAM_B'].size = bCount;
        stateMachine.transition('PREPARATION');
        io.emit('gameStateUpdate', stateMachine.state);
    });
    socket.on('pauseGame', () => {
        if (stateMachine.state.isPaused)
            stateMachine.resume();
        else
            stateMachine.pause();
        io.emit('gameStateUpdate', stateMachine.state);
    });
    socket.on('nextState', () => {
        const flow = [
            'LOBBY', 'PREPARATION',
            'INSTRUCTION_1', 'ROUND_1', 'ROUND_ENDED',
            'INSTRUCTION_2', 'ROUND_2', 'ROUND_ENDED',
            'INSTRUCTION_3', 'ROUND_3', 'ROUND_ENDED',
            'INSTRUCTION_4', 'ROUND_4', 'ROUND_ENDED',
            'INSTRUCTION_5', 'ROUND_5', 'ROUND_ENDED',
            'FINAL'
        ];
        const idx = flow.indexOf(stateMachine.state.status);
        if (idx !== -1 && idx < flow.length - 1) {
            const next = flow[idx + 1];
            if (stateMachine.state.status.startsWith('ROUND_') && stateMachine.state.status !== 'ROUND_ENDED') {
                const r = parseInt(stateMachine.state.status.split('_')[1]);
                processRoundEnd(r);
            }
            stateMachine.transition(next);
            generateRoundData();
        }
        const safeState = JSON.parse(JSON.stringify(stateMachine.state));
        if (safeState.status !== 'FINAL') {
            safeState.teams.TEAM_A.score = 0;
            safeState.teams.TEAM_B.score = 0;
        }
        io.emit('gameStateUpdate', safeState);
        (0, db_1.saveGameState)(stateMachine.state.id, stateMachine.state);
    });
    socket.on('r1SubmitPath', (path) => {
        if (stateMachine.state.status !== 'ROUND_1' || stateMachine.state.isPaused)
            return;
        const player = stateMachine.state.players[socket.id];
        if (!player || !player.team)
            return;
        const result = (0, round1_1.evaluatePath)(currentGame.roundState.grid, path);
        if (result.success && result.time < currentGame.roundState.bestTimes[player.team]) {
            currentGame.roundState.bestTimes[player.team] = result.time;
            io.emit('publicEvent', `Новый лучший маршрут команды ${player.team} от ${player.name}: ${result.time}`);
        }
        socket.emit('r1Result', result);
    });
    socket.on('r2SubmitNetwork', (cells) => {
        if (stateMachine.state.status !== 'ROUND_2' || stateMachine.state.isPaused)
            return;
        const player = stateMachine.state.players[socket.id];
        if (!player || !player.team)
            return;
        const grid = currentGame.roundState.netwalkGrids?.[socket.id];
        if (!grid)
            return;
        const res = (0, round2_1.validateNetwalkSolution)(grid, cells);
        currentGame.roundState.playerResults[socket.id] = res;
        if (res.isComplete) {
            io.emit('publicEvent', `${player.name} восстановил(а) сеть!`);
            socket.emit('r2Result', { success: true });
        }
    });
    socket.on('r3SubmitModules', (modules) => {
        if (stateMachine.state.status !== 'ROUND_3' || stateMachine.state.isPaused)
            return;
        const isValid = modules.length === 4;
        if (!isValid) {
            socket.emit('r3Error', { blockedUntil: Date.now() + 5000 });
        }
        else {
            io.emit('publicEvent', `Команда получила аварийный доступ!`);
        }
    });
    socket.on('r4SubmitCard', (cardId, action) => {
        if (stateMachine.state.status !== 'ROUND_4' || stateMachine.state.isPaused)
            return;
        const pId = socket.id;
        const r = currentGame.roundState.cardResults[pId];
        if (!r)
            return;
        const currentCard = r.cards[r.currentIdx];
        if (!currentCard || currentCard.id !== cardId)
            return;
        const success = currentCard.action === action;
        if (success)
            r.correct++;
        r.answered++;
        r.currentIdx++;
        const nextCardIndex = r.currentIdx;
        socket.emit('r4CardResult', { success, explanation: currentCard.explanation, nextCardIndex });
        if (nextCardIndex < 8) {
            setTimeout(() => {
                if (!stateMachine.state.isPaused) {
                    socket.emit('roundSpecificData', { card: r.cards[nextCardIndex] });
                }
            }, 3000);
        }
        else {
            io.emit('publicEvent', `${stateMachine.state.players[pId].name} завершил проверку карантина!`);
        }
    });
    socket.on('r5SubmitAction', (actionId) => {
        if (stateMachine.state.status !== 'ROUND_5' || stateMachine.state.isPaused)
            return;
        const actionDef = currentGame.roundState.graph.find((a) => a.id === actionId);
        if (!actionDef)
            return;
        const unmet = actionDef.dependsOn.filter((dep) => {
            return !Object.values(currentGame.roundState.actionsCompleted || {}).some((completedList) => completedList.includes(dep));
        });
        if (unmet.length > 0) {
            socket.emit('r5ActionError', { blockedUntil: Date.now() + 3000, message: 'Условия еще не выполнены' });
        }
        else {
            if (!currentGame.roundState.actionsCompleted)
                currentGame.roundState.actionsCompleted = {};
            if (!currentGame.roundState.actionsCompleted[socket.id]) {
                currentGame.roundState.actionsCompleted[socket.id] = [];
            }
            if (!currentGame.roundState.actionsCompleted[socket.id].includes(actionId)) {
                currentGame.roundState.actionsCompleted[socket.id].push(actionId);
                io.emit('publicEvent', `Выполнено действие: ${actionDef.description}`);
            }
        }
    });
    socket.on('disconnect', () => {
        if (stateMachine.state.players[socket.id]) {
            stateMachine.state.players[socket.id].isOnline = false;
            io.emit('gameStateUpdate', stateMachine.state);
        }
    });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
