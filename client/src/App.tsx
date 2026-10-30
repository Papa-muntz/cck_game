import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Join from './pages/Join';
import Play from './pages/Play';
import Display from './pages/Display';
import Host from './pages/Host';
import Terminal from './pages/Terminal';

const History = () => <div>История игр (для ведущего)</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Join />} />
        <Route path="/join" element={<Join />} />
        <Route path="/play" element={<Play />} />
        <Route path="/display" element={<Display />} />
        <Route path="/host" element={<Host />} />
        <Route path="/terminal" element={<Terminal />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
