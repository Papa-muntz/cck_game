import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { ClientToServerEvents, ServerToClientEvents, GameState, Player, Team } from '../../shared/src/types';
import dotenv from 'dotenv';
import path from 'path';
import { saveGameState, loadGameState } from './db';
import { StateMachine } from './stateMachine';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// Serve static client files for production
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Fallback to index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

// Simple in-memory game state for now
let currentGame: GameState = {
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

const stateMachine = new StateMachine(currentGame);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send current state on connection
  socket.emit('gameStateUpdate', stateMachine.state);

  socket.on('join', (data) => {
    const playerId = socket.id; // Or use data.token if provided
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
    io.emit('gameStateUpdate', stateMachine.state);
    io.emit('publicEvent', `${data.name} присоединился к игре!`);
  });

  socket.on('hostLogin', (password) => {
      if (password === process.env.HOST_PASSWORD) {
          socket.emit('hostAuthenticated', 'host_token');
      } else {
          socket.emit('error', 'Неверный пароль');
      }
  });

  socket.on('closeRegistration', () => {
    // Basic shuffle logic
    const players = Object.values(stateMachine.state.players);
    let aCount = 0;
    let bCount = 0;
    for (const player of players) {
      if (aCount <= bCount) {
        player.team = 'TEAM_A';
        aCount++;
      } else {
        player.team = 'TEAM_B';
        bCount++;
      }
    }
    stateMachine.state.teams['TEAM_A'].size = aCount;
    stateMachine.state.teams['TEAM_B'].size = bCount;
    stateMachine.transition('PREPARATION');
    io.emit('gameStateUpdate', stateMachine.state);
  });

  socket.on('nextState', () => {
      // Very basic transition logic for demonstration
      if (stateMachine.state.status === 'PREPARATION') stateMachine.transition('INSTRUCTION_1');
      else if (stateMachine.state.status === 'INSTRUCTION_1') stateMachine.transition('ROUND_1');
      else if (stateMachine.state.status === 'ROUND_1') stateMachine.transition('ROUND_ENDED');
      else if (stateMachine.state.status === 'ROUND_ENDED') stateMachine.transition('FINAL');

      io.emit('gameStateUpdate', stateMachine.state);
      saveGameState(stateMachine.state.id, stateMachine.state);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
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
