import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io();

export default function Join() {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    if (name.trim()) {
        socket.emit('join', { name: name.trim(), token: '' });
        // In a real app we'd wait for 'joined' event and store token in localStorage
        setTimeout(() => navigate('/play'), 500);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Регистрация в игру</h2>
      <input placeholder="Ваше имя" value={name} onChange={e => setName(e.target.value)} />
      <button onClick={handleJoin}>Войти</button>
    </div>
  );
}
