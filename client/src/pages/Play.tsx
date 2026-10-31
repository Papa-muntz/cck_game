import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState } from '../../../shared/src/types';
import Round1 from '../components/rounds/Round1';
import Round2 from '../components/rounds/Round2';
import Round3 from '../components/rounds/Round3';
import Round4 from '../components/rounds/Round4';
import Round5 from '../components/rounds/Round5';
import { useNavigate } from 'react-router-dom';

let socket: Socket;

export default function Play() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
      const token = localStorage.getItem('playerToken');
      if (!token) {
          navigate('/join');
          return;
      }

      socket = io();

      // Attempt reconnect on mount with stored token to restore player object mapping
      socket.emit('reconnect', { token });

      socket.on('gameStateUpdate', (state) => {
          setGameState(state);
      });

      socket.emit('requestState');

      return () => {
          socket.off('gameStateUpdate');
          socket.disconnect();
      }
  }, [navigate]);

  const renderContent = () => {
      if (!gameState) return <p className="text-gray-400 animate-pulse mt-10 text-center">ПОДКЛЮЧЕНИЕ К СЕРВЕРУ...</p>;

      switch(gameState.status) {
          case 'LOBBY': return <div className="text-center mt-10"><h3 className="text-[var(--color-accent)]">ОЖИДАНИЕ</h3><p className="text-gray-400">Ожидание распределения команд сервером.</p></div>;
          case 'PREPARATION': return <div className="text-center mt-10 text-green-400"><h3>СИСТЕМА ГОТОВА</h3><p>Вы успешно закреплены за командой. Приготовьтесь к получению инструкций.</p></div>;
          case 'INSTRUCTION_1': return <div className="mt-10"><h3 className="text-[var(--color-accent)] text-2xl">ДОСТАВИТЬ ЯДРО</h3><p className="text-lg">Внимательно изучите поле на главном экране и составьте оптимальный маршрут робота от точки <strong>S</strong> до точки <strong>F</strong>, избегая красных зон и используя зелёные для ускорения.</p></div>;
          case 'ROUND_1': return <Round1 socket={socket} gameState={gameState} />;
          case 'INSTRUCTION_2': return <div className="mt-10"><h3>Восстановить связь</h3><p>Соедините все элементы сети (Netwalk).</p></div>;
          case 'ROUND_2': return <Round2 socket={socket} gameState={gameState} />;
          case 'INSTRUCTION_3': return <div className="mt-10"><h3>Аварийный доступ</h3><p>Передайте подсказки оператору.</p></div>;
          case 'ROUND_3': return <Round3 socket={socket} gameState={gameState} />;
          case 'INSTRUCTION_4': return <div className="mt-10"><h3>Карантин</h3><p>Разрешите или заблокируйте действия.</p></div>;
          case 'ROUND_4': return <Round4 socket={socket} gameState={gameState} />;
          case 'INSTRUCTION_5': return <div className="mt-10"><h3>Согласованный запуск</h3><p>Выполняйте действия в строгой последовательности.</p></div>;
          case 'ROUND_5': return <Round5 socket={socket} gameState={gameState} />;
          case 'ROUND_ENDED': return <div className="text-center mt-10"><h3>РАУНД ЗАВЕРШЕН</h3><p className="text-gray-400">Ожидайте синхронизации данных.</p></div>;
          case 'FINAL': return <div className="text-center mt-10"><h3>ПРОТОКОЛ ВЫПОЛНЕН</h3><p className="text-[var(--color-success)] text-xl">Смотрите результаты на главном экране.</p></div>;
          default: return <p>Ожидание...</p>;
      }
  }

  return (
    <div className="min-h-screen p-4 flex flex-col max-w-lg mx-auto">
      <h2 className="text-[var(--color-accent)] border-b border-[var(--color-panel-border)] pb-2 mb-4 text-center m-0 uppercase tracking-widest text-sm">ТЕРМИНАЛ ИГРОКА</h2>
      {gameState?.isPaused && <div className="p-3 bg-red-900/50 border border-red-500 text-red-100 rounded text-center mb-4 font-bold animate-pulse">ВНИМАНИЕ: ПРОЦЕСС НА ПАУЗЕ</div>}
      <div className="flex-1">
          {renderContent()}
      </div>
    </div>
  );
}
