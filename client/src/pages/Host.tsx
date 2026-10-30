import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState } from '../../../shared/src/types';

const socket: Socket = io();

export default function Host() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
      socket.on('gameStateUpdate', (state) => setGameState(state));
      socket.on('hostAuthenticated', () => setAuthenticated(true));
      socket.on('error', (msg) => alert(msg));

      return () => {
          socket.off('gameStateUpdate');
          socket.off('hostAuthenticated');
          socket.off('error');
      }
  }, []);

  if (!authenticated) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Вход для ведущего</h2>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={() => socket.emit('hostLogin', password)}>Войти</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Панель ведущего</h2>
      <p>Статус: {gameState?.status}</p>
      <button onClick={() => socket.emit('closeRegistration')}>Распределить команды</button>
      <button onClick={() => socket.emit('nextState')}>Следующий этап</button>
      <button>Пауза</button>
      <button>Показать финал</button>

      <h3>Игроки</h3>
      <ul>
        {gameState && Object.values(gameState.players).map(p => (
            <li key={p.id}>{p.name} - {p.team || 'Без команды'} {p.isOnline ? '(online)' : '(offline)'}</li>
        ))}
      </ul>
    </div>
  );
}
