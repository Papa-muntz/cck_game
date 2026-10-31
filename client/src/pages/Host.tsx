import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState } from '../../../shared/src/types';
import { Button } from '../components/ui/Button';
import { Panel } from '../components/ui/Panel';

const socket: Socket = io();

export default function Host() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [r1State, setR1State] = useState<any>(null);

  useEffect(() => {
      socket.on('gameStateUpdate', (state) => setGameState(state));
      socket.on('hostAuthenticated', () => setAuthenticated(true));
      socket.on('error', (msg) => alert(msg));
      socket.on('round1:fieldReady', (data) => setR1State(data));

      return () => {
          socket.off('gameStateUpdate');
          socket.off('hostAuthenticated');
          socket.off('error');
          socket.off('round1:fieldReady');
      }
  }, []);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Panel className="w-full max-w-sm flex flex-col gap-4">
            <h2 className="text-[var(--color-accent)] mb-2">ВХОД ДЛЯ ВЕДУЩЕГО</h2>
            <input
                type="password"
                className="bg-[var(--color-bg-base)] border border-[var(--color-panel-border)] p-3 rounded text-white outline-none focus:border-[var(--color-accent)]"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Пароль"
            />
            <Button onClick={() => socket.emit('hostLogin', password)}>Войти</Button>
        </Panel>
      </div>
    );
  }

  const renderGridPreview = () => {
      if (!r1State?.grid) return null;
      const { grid } = r1State;
      return (
          <div className="mt-4">
              <h4 className="text-gray-400 mb-2">ПРЕДПРОСМОТР ПОЛЯ</h4>
              <div className="relative mx-auto" style={{ width: '100%', maxWidth: '200px', aspectRatio: '1/1' }}>
                 <div
                    className="absolute inset-0 grid"
                    style={{ gridTemplateColumns: `repeat(${grid.width}, 1fr)`, gridTemplateRows: `repeat(${grid.height}, 1fr)` }}
                 >
                     {grid.cells.map((row: string[], y: number) =>
                       row.map((cell: string, x: number) => {
                         let bg = 'rgba(69, 188, 235, 0.05)';
                         if (cell === 'SLOW') bg = 'rgba(248, 113, 113, 0.2)';
                         if (cell === 'FAST') bg = 'rgba(52, 211, 153, 0.2)';
                         if (cell === 'START') bg = 'rgba(46, 230, 214, 0.3)';
                         if (cell === 'FINISH') bg = 'rgba(255, 138, 61, 0.3)';
                         return <div key={`c-${x}-${y}`} className="border border-[rgba(69,188,235,0.1)]" style={{ backgroundColor: bg }} />;
                       })
                     )}
                 </div>
                 <div className="absolute inset-0 pointer-events-none">
                     {grid.walls.vertical.map((row: boolean[], y: number) =>
                         row.map((hasWall: boolean, x: number) => hasWall && (
                             <div key={`vw-${x}-${y}`} className="absolute bg-[var(--color-accent)]" style={{
                                 left: `${(x + 1) * (100 / grid.width)}%`, top: `${y * (100 / grid.height)}%`, height: `${100 / grid.height}%`, width: '1px', transform: 'translateX(-50%)'
                             }} />
                         ))
                     )}
                     {grid.walls.horizontal.map((row: boolean[], y: number) =>
                         row.map((hasWall: boolean, x: number) => hasWall && (
                             <div key={`hw-${x}-${y}`} className="absolute bg-[var(--color-accent)]" style={{
                                 top: `${(y + 1) * (100 / grid.height)}%`, left: `${x * (100 / grid.width)}%`, width: `${100 / grid.width}%`, height: '1px', transform: 'translateY(-50%)'
                             }} />
                         ))
                     )}
                 </div>
              </div>
          </div>
      );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <Panel>
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-[var(--color-accent)] m-0">ПАНЕЛЬ ВЕДУЩЕГО</h2>
              <div className="text-xl">СТАТУС: <span className="font-bold">{gameState?.status}</span> {gameState?.timeRemaining && gameState.timeRemaining > 0 ? `| ${gameState.timeRemaining}s` : ''}</div>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
              <Button onClick={() => socket.emit('closeRegistration')} disabled={gameState?.status !== 'LOBBY'}>Сгенерировать команды</Button>
              {gameState?.status === 'INSTRUCTION_1' && (
                  <Button onClick={() => socket.emit('nextState')}>Сгенерировать поле</Button>
              )}
              {gameState?.status === 'ROUND_1' && !r1State ? (
                   <Button onClick={() => socket.emit('nextState')}>Старт раунда</Button>
              ) : null}
              {gameState?.status !== 'INSTRUCTION_1' && (
                  <Button onClick={() => socket.emit('nextState')}>
                      {gameState?.status === 'ROUND_1' ? 'Завершить раунд' : 'Следующий этап'}
                  </Button>
              )}
              <Button onClick={() => socket.emit('pauseGame')} variant={gameState?.isPaused ? "error" : "secondary"}>
                  {gameState?.isPaused ? '▶ ВОЗОБНОВИТЬ' : '⏸ ПАУЗА'}
              </Button>
              <a href="/history" className="ml-auto">
                  <Button variant="secondary">ИСТОРИЯ ИГР</Button>
              </a>
          </div>

          {gameState?.status === 'ROUND_1' && renderGridPreview()}
      </Panel>

      <Panel>
          <h3 className="text-[var(--color-accent)] mb-4">УПРАВЛЕНИЕ ИГРОКАМИ</h3>
          <div className="grid grid-cols-2 gap-8">
              <div>
                  <h4 className="text-[var(--color-team-a)]">КОМАНДА А ({gameState?.teams.TEAM_A.size || 0})</h4>
                  <div className="flex flex-col gap-2 mt-2">
                      {gameState && Object.values(gameState.players).filter(p => p.team === 'TEAM_A').map(p => (
                          <div key={p.id} className="flex justify-between items-center bg-[rgba(255,255,255,0.05)] p-2 rounded">
                              <span className={p.isOnline ? "text-white" : "text-gray-500 line-through"}>{p.name}</span>
                          </div>
                      ))}
                  </div>
              </div>
              <div>
                  <h4 className="text-[var(--color-team-b)]">КОМАНДА Б ({gameState?.teams.TEAM_B.size || 0})</h4>
                  <div className="flex flex-col gap-2 mt-2">
                      {gameState && Object.values(gameState.players).filter(p => p.team === 'TEAM_B').map(p => (
                          <div key={p.id} className="flex justify-between items-center bg-[rgba(255,255,255,0.05)] p-2 rounded">
                              <span className={p.isOnline ? "text-white" : "text-gray-500 line-through"}>{p.name}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {gameState?.status === 'LOBBY' && (
              <div className="mt-8">
                  <h4 className="text-gray-400">НЕРАСПРЕДЕЛЕННЫЕ В ЛОББИ</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                      {gameState && Object.values(gameState.players).filter(p => !p.team).map(p => (
                          <span key={p.id} className="bg-gray-800 px-2 py-1 rounded text-sm">{p.name}</span>
                      ))}
                  </div>
              </div>
          )}
      </Panel>
    </div>
  );
}
