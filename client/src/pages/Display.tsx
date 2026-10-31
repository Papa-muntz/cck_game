import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState } from '../../../shared/src/types';

const socket: Socket = io();

export default function Display() {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [events, setEvents] = useState<string[]>([]);
    const [r1State, setR1State] = useState<any>(null);

    useEffect(() => {
        socket.on('gameStateUpdate', (state) => setGameState(state));
        socket.on('publicEvent', (msg) => {
            setEvents(prev => [...prev, msg].slice(-8));
        });
        socket.on('round1:fieldReady', (data) => setR1State(data));
        socket.on('round1:teamBest', (data) => {
            setR1State((prev: any) => {
                if (!prev) return prev;
                const newBest = { ...prev.bestTimes };
                newBest[data.team] = { time: data.time, length: data.length };
                return { ...prev, bestTimes: newBest };
            });
        });

        return () => {
            socket.off('gameStateUpdate');
            socket.off('publicEvent');
            socket.off('round1:fieldReady');
            socket.off('round1:teamBest');
        }
    }, []);

    return (
        <div className="bg-[var(--color-bg-base)] text-white min-h-screen p-8 flex flex-col font-sans">
            <div className="flex justify-between items-end border-b border-[var(--color-panel-border)] pb-4 mb-8">
                <div>
                    <h1 className="text-4xl text-[var(--color-accent)] m-0 drop-shadow-[0_0_10px_rgba(69,188,235,0.5)]">ПРОТОКОЛ: ПЕРЕЗАПУСК</h1>
                    <div className="text-sm text-gray-400 mt-2 tracking-widest uppercase">Центральная система контроля</div>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl m-0 text-gray-300">{gameState?.status || 'ОЖИДАНИЕ'}</h2>
                    {gameState?.isPaused && <h2 className="text-red-500 m-0 animate-pulse mt-2">ПАУЗА</h2>}
                </div>
            </div>

            <div className="flex flex-1 gap-8">
                {/* Left column: Context / Map */}
                <div className="flex-[2] flex flex-col gap-8">
                    {gameState?.status === 'ROUND_1' && r1State ? (
                        <div className="bg-[var(--color-panel-bg)] rounded-[var(--radius)] border border-[var(--color-panel-border)] p-6 shadow-[var(--shadow-neon)] flex-1 flex flex-col items-center justify-center relative">
                            {gameState.timeRemaining > 0 && <div className="absolute top-4 right-6 text-5xl font-bold font-mono text-[var(--color-accent)]">{gameState.timeRemaining}</div>}
                            <h2 className="text-2xl text-[var(--color-accent)] mb-8">РАУНД 1: СЕКТОР ДОСТАВКИ</h2>

                            <div className="relative" style={{ width: '400px', height: '400px' }}>
                                 <div
                                    className="absolute inset-0 grid"
                                    style={{
                                        gridTemplateColumns: `repeat(${r1State.grid.width}, 1fr)`,
                                        gridTemplateRows: `repeat(${r1State.grid.height}, 1fr)`
                                    }}
                                 >
                                     {r1State.grid.cells.map((row: string[], y: number) =>
                                       row.map((cell: string, x: number) => {
                                         let bg = 'rgba(69, 188, 235, 0.05)';
                                         if (cell === 'SLOW') bg = 'rgba(248, 113, 113, 0.2)';
                                         if (cell === 'FAST') bg = 'rgba(52, 211, 153, 0.2)';
                                         if (cell === 'START') bg = 'rgba(46, 230, 214, 0.3)';
                                         if (cell === 'FINISH') bg = 'rgba(255, 138, 61, 0.3)';

                                         return (
                                           <div key={`c-${x}-${y}`} className="relative border border-[rgba(69,188,235,0.1)] flex items-center justify-center" style={{ backgroundColor: bg }}>
                                               {cell === 'START' && <span className="text-xl text-[#2EE6D6] font-bold">S</span>}
                                               {cell === 'FINISH' && <span className="text-xl text-[#FF8A3D] font-bold">F</span>}
                                           </div>
                                         );
                                       })
                                     )}
                                 </div>
                                 <div className="absolute inset-0 pointer-events-none">
                                     {r1State.grid.walls.vertical.map((row: boolean[], y: number) =>
                                         row.map((hasWall: boolean, x: number) => hasWall && (
                                             <div key={`vw-${x}-${y}`} className="absolute bg-[#45BCEB] shadow-[0_0_10px_#45BCEB]" style={{
                                                 left: `${(x + 1) * (100 / r1State.grid.width)}%`, top: `${y * (100 / r1State.grid.height)}%`, height: `${100 / r1State.grid.height}%`, width: '4px', transform: 'translateX(-50%)'
                                             }} />
                                         ))
                                     )}
                                     {r1State.grid.walls.horizontal.map((row: boolean[], y: number) =>
                                         row.map((hasWall: boolean, x: number) => hasWall && (
                                             <div key={`hw-${x}-${y}`} className="absolute bg-[#45BCEB] shadow-[0_0_10px_#45BCEB]" style={{
                                                 top: `${(y + 1) * (100 / r1State.grid.height)}%`, left: `${x * (100 / r1State.grid.width)}%`, width: `${100 / r1State.grid.width}%`, height: '4px', transform: 'translateY(-50%)'
                                             }} />
                                         ))
                                     )}
                                 </div>
                            </div>

                            <div className="w-full flex justify-around mt-12">
                                <div className="text-center">
                                    <div className="text-[var(--color-team-a)] text-xl font-bold">КОМАНДА А (Лучшее)</div>
                                    <div className="text-4xl mt-2">{r1State.bestTimes?.['TEAM_A']?.time === null || r1State.bestTimes?.['TEAM_A']?.time > 10000 ? '--' : r1State.bestTimes?.['TEAM_A']?.time}</div>
                                    {r1State.bestTimes?.['TEAM_A']?.time < 10000 && <div className="text-sm mt-1 text-gray-400">Шагов: {r1State.bestTimes?.['TEAM_A']?.length}</div>}
                                </div>
                                <div className="text-center flex flex-col items-center">
                                    <div className="text-[var(--color-accent)] text-lg mb-2">ДОСТАВИЛИ ЯДРО</div>
                                    <div className="flex flex-wrap gap-2 justify-center max-w-[200px]">
                                        {r1State.completedPlayers?.map((pid: string) => (
                                            <span key={pid} className="px-2 py-1 bg-green-900 text-green-300 rounded text-sm whitespace-nowrap">
                                                {gameState.players[pid]?.name || 'Участник'}
                                            </span>
                                        ))}
                                        {(!r1State.completedPlayers || r1State.completedPlayers.length === 0) && <span className="text-gray-500">-</span>}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[var(--color-team-b)] text-xl font-bold">КОМАНДА Б (Лучшее)</div>
                                    <div className="text-4xl mt-2">{r1State.bestTimes?.['TEAM_B']?.time === null || r1State.bestTimes?.['TEAM_B']?.time > 10000 ? '--' : r1State.bestTimes?.['TEAM_B']?.time}</div>
                                    {r1State.bestTimes?.['TEAM_B']?.time < 10000 && <div className="text-sm mt-1 text-gray-400">Шагов: {r1State.bestTimes?.['TEAM_B']?.length}</div>}
                                </div>
                            </div>
                        </div>
                    ) : (
                         <div className="bg-[var(--color-panel-bg)] rounded-[var(--radius)] border border-[var(--color-panel-border)] p-6 shadow-[var(--shadow-neon)] flex-1 flex flex-col relative">
                            {gameState?.timeRemaining && gameState.timeRemaining > 0 ? <div className="absolute top-4 right-6 text-5xl font-bold font-mono text-[var(--color-accent)]">{gameState.timeRemaining}</div> : null}

                            {gameState?.status === 'LOBBY' ? (
                                <>
                                    <h3 className="text-2xl text-[var(--color-accent)] mb-4">АКТИВНЫЕ ПОДКЛЮЧЕНИЯ ({Object.keys(gameState.players).length})</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {Object.values(gameState.players).map(p => (
                                            <div key={p.id} className="px-4 py-2 bg-gray-800 rounded text-lg border border-gray-600">{p.name}</div>
                                        ))}
                                    </div>
                                </>
                            ) : gameState?.status === 'FINAL' ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <h2 className="text-5xl text-[var(--color-error)] mb-12 drop-shadow-[0_0_20px_rgba(248,113,113,0.8)]">ФИНАЛЬНЫЙ СТАТУС</h2>
                                    <div className="flex w-full justify-around">
                                        <div className="text-center">
                                            <h3 className="text-3xl text-[var(--color-team-a)] mb-4">КОМАНДА А</h3>
                                            <div className="text-7xl font-bold">{gameState.teams.TEAM_A.score}</div>
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-3xl text-[var(--color-team-b)] mb-4">КОМАНДА Б</h3>
                                            <div className="text-7xl font-bold">{gameState.teams.TEAM_B.score}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex w-full justify-around h-full items-center">
                                    <div className="text-center">
                                        <h3 className="text-2xl text-[var(--color-team-a)] mb-2">КОМАНДА А</h3>
                                        <div className="text-xl text-gray-400">Сотрудников: {gameState?.teams.TEAM_A.size || 0}</div>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-2xl text-[var(--color-team-b)] mb-2">КОМАНДА Б</h3>
                                        <div className="text-xl text-gray-400">Сотрудников: {gameState?.teams.TEAM_B.size || 0}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right column: Event Log */}
                <div className="flex-1 bg-[var(--color-panel-bg)] rounded-[var(--radius)] border border-[var(--color-panel-border)] p-6 shadow-[var(--shadow-neon)] flex flex-col">
                    <h3 className="text-xl text-[var(--color-accent)] mb-6 border-b border-[var(--color-panel-border)] pb-2">ЛОГ СОБЫТИЙ</h3>
                    <div className="flex flex-col gap-3 font-mono text-sm overflow-hidden flex-1 justify-end">
                        {events.map((e, i) => (
                            <div key={i} className="text-green-400 animate-[pulse_0.5s_ease-out]">
                                <span className="opacity-50 mr-2">{'>'}</span> {e}
                            </div>
                        ))}
                        {events.length === 0 && <div className="text-gray-500 italic">Ожидание системных логов...</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
