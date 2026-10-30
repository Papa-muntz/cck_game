import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState } from '../../../shared/src/types';

const socket: Socket = io();

export default function Play() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
      socket.on('gameStateUpdate', (state) => setGameState(state));
      return () => { socket.off('gameStateUpdate'); }
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Игровой экран</h2>
      {gameState?.status === 'LOBBY' && <p>Ожидание распределения...</p>}
      {gameState?.status === 'PREPARATION' && <p>Вы в команде. Приготовьтесь!</p>}
      {gameState?.status === 'INSTRUCTION_1' && <p>Инструкция: Доставить ядро. Робот должен...</p>}
      {gameState?.status === 'ROUND_1' && <p>Раунд 1 начался!</p>}
      {gameState?.status === 'ROUND_ENDED' && <p>Раунд завершён. Ожидайте.</p>}
      {gameState?.status === 'FINAL' && <p>Игра завершена! Смотрите на главный экран.</p>}
    </div>
  );
}
