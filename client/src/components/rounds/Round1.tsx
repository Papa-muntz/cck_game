import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { RobotCommand } from '../../../../shared/src/types';
import { Button } from '../ui/Button';
import { Panel } from '../ui/Panel';
import classNames from 'classnames';
import { ArrowUp, CornerUpLeft, CornerUpRight, Trash2, XCircle } from 'lucide-react';

interface Round1Props {
  socket: Socket;
  gameState: any;
}

export default function Round1({ socket, gameState }: Round1Props) {
  const [path, setPath] = useState<RobotCommand[]>([]);
  const [gridData, setGridData] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [animating, setAnimating] = useState(false);
  const [simState, setSimState] = useState<{x: number, y: number, dir: number} | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    socket.on('round1:fieldReady', (data) => {
      setGridData(data.grid);
      setSimState({ ...data.grid.start, dir: 1 });
      setPath([]);
      setResult(null);
    });

    socket.on('round1:result', (data) => {
      setResult(data);
      animateResult(data);
    });

    return () => {
      socket.off('round1:fieldReady');
      socket.off('round1:result');
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [socket, gridData]);

  const addCommand = (cmd: RobotCommand) => {
      if (animating || result?.success) return;
      setPath([...path, cmd]);
  };

  const removeLastCommand = () => {
      if (animating || result?.success) return;
      setPath(path.slice(0, -1));
  };

  const clearPath = () => {
      if (animating || result?.success) return;
      setPath([]);
      setResult(null);
      if (gridData) setSimState({ ...gridData.start, dir: 1 });
  };

  const submitPath = () => {
    if (path.length > 0) socket.emit('round1:submitProgram', path);
  };

  const animateResult = (res: any) => {
      if (!gridData) return;
      setAnimating(true);

      let curr = { ...gridData.start };
      let dir = 1;
      setSimState({ x: curr.x, y: curr.y, dir });

      let i = 0;

      const animateStep = () => {
          if (i >= path.length) {
              setAnimating(false);
              return;
          }

          const cmd = path[i];
          let nx = curr.x;
          let ny = curr.y;
          let nextDir = dir;

          if (cmd === 'TURN_LEFT') nextDir = (dir + 3) % 4;
          else if (cmd === 'TURN_RIGHT') nextDir = (dir + 1) % 4;
          else if (cmd === 'FORWARD') {
              if (dir === 0) ny -= 1;
              else if (dir === 1) nx += 1;
              else if (dir === 2) ny += 1;
              else if (dir === 3) nx -= 1;
          }

          // Stop animating forward if this step causes an error
          if (res.errorIndex !== -1 && i === res.errorIndex) {
              setAnimating(false);
              return;
          }

          curr = { x: nx, y: ny };
          dir = nextDir;
          setSimState({ x: curr.x, y: curr.y, dir });

          i++;
          timeoutRef.current = setTimeout(animateStep, 300);
      };

      timeoutRef.current = setTimeout(animateStep, 300);
  };

  if (!gridData) return <p>Ожидание поля...</p>;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-lg mx-auto">
      <Panel className="flex-1 flex flex-col mb-4 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-[var(--color-accent)] m-0 flex-1">МАРШРУТ ЯДРА</h3>
              <h3 className="text-xl font-bold m-0 w-[60px] text-right">{gameState.timeRemaining}s</h3>
          </div>

          {result && !animating && (
             <div className={classNames("mb-2 text-center font-bold", result.success ? "text-[var(--color-success)]" : "text-[var(--color-error)]")}>
                 {result.success ? `УСПЕХ! ВРЕМЯ: ${result.time}` : 'ОШИБКА: РОБОТ СТОЛКНУЛСЯ СО СТЕНОЙ'}
             </div>
          )}

          <div className="relative mx-auto" style={{ width: '100%', maxWidth: '350px', aspectRatio: '1/1' }}>
             <div
                className="absolute inset-0 grid"
                style={{
                    gridTemplateColumns: `repeat(${gridData.width}, 1fr)`,
                    gridTemplateRows: `repeat(${gridData.height}, 1fr)`
                }}
             >
                 {gridData.cells.map((row: string[], y: number) =>
                   row.map((cell: string, x: number) => {
                     let bg = 'rgba(69, 188, 235, 0.05)';
                     if (cell === 'SLOW') bg = 'rgba(248, 113, 113, 0.2)';
                     if (cell === 'FAST') bg = 'rgba(52, 211, 153, 0.2)';
                     if (cell === 'START') bg = 'rgba(46, 230, 214, 0.3)';
                     if (cell === 'FINISH') bg = 'rgba(255, 138, 61, 0.3)';

                     return (
                       <div key={`c-${x}-${y}`} className="relative border border-[rgba(69,188,235,0.1)] flex items-center justify-center" style={{ backgroundColor: bg }}>
                           {cell === 'START' && <span className="text-[10px] text-[#2EE6D6] font-bold">S</span>}
                           {cell === 'FINISH' && <span className="text-[10px] text-[#FF8A3D] font-bold">F</span>}
                       </div>
                     );
                   })
                 )}
             </div>

             <div className="absolute inset-0 pointer-events-none">
                 {gridData.walls.vertical.map((row: boolean[], y: number) =>
                     row.map((hasWall: boolean, x: number) => hasWall && (
                         <div key={`vw-${x}-${y}`} className="absolute bg-[#45BCEB] shadow-[0_0_8px_#45BCEB]" style={{
                             left: `${(x + 1) * (100 / gridData.width)}%`, top: `${y * (100 / gridData.height)}%`, height: `${100 / gridData.height}%`, width: '2px', transform: 'translateX(-50%)'
                         }} />
                     ))
                 )}
                 {gridData.walls.horizontal.map((row: boolean[], y: number) =>
                     row.map((hasWall: boolean, x: number) => hasWall && (
                         <div key={`hw-${x}-${y}`} className="absolute bg-[#45BCEB] shadow-[0_0_8px_#45BCEB]" style={{
                             top: `${(y + 1) * (100 / gridData.height)}%`, left: `${x * (100 / gridData.width)}%`, width: `${100 / gridData.width}%`, height: '2px', transform: 'translateY(-50%)'
                         }} />
                     ))
                 )}
             </div>

             {simState && (
                 <div className="absolute transition-all duration-300 flex items-center justify-center z-10" style={{
                     left: `${simState.x * (100 / gridData.width)}%`, top: `${simState.y * (100 / gridData.height)}%`, width: `${100 / gridData.width}%`, height: `${100 / gridData.height}%`
                 }}>
                     <div className="w-3/4 h-3/4 bg-white rounded-full shadow-[0_0_10px_#fff] flex items-center justify-center transition-transform duration-300" style={{ transform: `rotate(${simState.dir * 90}deg)` }}>
                         <div className="w-1/2 h-1/2 bg-[var(--color-bg-base)] rounded-full translate-x-[2px]"></div>
                     </div>
                 </div>
             )}
          </div>
      </Panel>

      <div className="h-16 bg-[#0B1020] border border-[var(--color-panel-border)] rounded-[var(--radius)] mb-4 flex items-center overflow-x-auto px-2 gap-1 snap-x">
          {path.length === 0 && <span className="text-gray-500 text-sm ml-2">Программа пуста</span>}
          {path.map((cmd, idx) => {
              const isError = result && !result.success && idx === result.errorIndex;
              return (
                  <div key={idx} className={classNames(
                      "shrink-0 w-10 h-10 flex items-center justify-center rounded bg-[var(--color-panel-bg)] border snap-center",
                      isError ? "border-[var(--color-error)] text-[var(--color-error)] shadow-[0_0_8px_var(--color-error)]" : "border-[var(--color-accent)] text-[var(--color-accent)]"
                  )}>
                      {cmd === 'FORWARD' && <ArrowUp size={20} />}
                      {cmd === 'TURN_LEFT' && <CornerUpLeft size={20} />}
                      {cmd === 'TURN_RIGHT' && <CornerUpRight size={20} />}
                  </div>
              )
          })}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
          <Button variant="secondary" onClick={() => addCommand('TURN_LEFT')} disabled={animating || result?.success}>
             <CornerUpLeft size={24} />
          </Button>
          <Button variant="secondary" onClick={() => addCommand('FORWARD')} disabled={animating || result?.success}>
             <ArrowUp size={24} />
          </Button>
          <Button variant="secondary" onClick={() => addCommand('TURN_RIGHT')} disabled={animating || result?.success}>
             <CornerUpRight size={24} />
          </Button>
      </div>

      <div className="flex gap-2">
          <Button variant="error" onClick={clearPath} className="flex-1 px-0" disabled={animating}>
              <XCircle size={18} />
          </Button>
          <Button variant="error" onClick={removeLastCommand} className="flex-1 px-0" disabled={animating || result?.success || path.length===0}>
              <Trash2 size={18} />
          </Button>
          <Button variant="primary" onClick={submitPath} className="flex-[2]" disabled={animating || result?.success || path.length===0}>
              ЗАПУСК
          </Button>
      </div>
    </div>
  );
}
