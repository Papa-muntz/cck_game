import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';

let socket: Socket;

export default function Join() {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
      socket = io();

      const token = localStorage.getItem('playerToken');
      if (token) {
          // Attempt reconnect
          socket.emit('reconnect', { token });
          navigate('/play');
      }

      socket.on('joined', (data) => {
          localStorage.setItem('playerToken', data.token);
          navigate('/play');
      });

      socket.on('error', (msg) => alert(msg));

      return () => {
          socket.off('joined');
          socket.off('error');
          socket.disconnect();
      }
  }, [navigate]);

  const handleJoin = () => {
    if (name.trim()) {
        // Will trigger joined event which navigates
        socket.emit('join', { name: name.trim(), token: '' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Panel className="w-full max-w-sm flex flex-col gap-4 text-center">
          <h2 className="text-[var(--color-accent)] m-0">ВХОД В СИСТЕМУ</h2>
          <p className="text-gray-400 text-sm mb-4">Авторизуйтесь для начала восстановления города.</p>
          <input
              placeholder="Введите ваше имя"
              className="bg-[var(--color-bg-base)] border border-[var(--color-panel-border)] p-3 rounded text-white outline-none focus:border-[var(--color-accent)]"
              value={name}
              onChange={e => setName(e.target.value)}
          />
          <Button onClick={handleJoin} disabled={!name.trim()} fullWidth>Войти</Button>
      </Panel>
    </div>
  );
}
