import React from 'react';
import './App.css';
import PianoRoll from './component/PianoRoll';
import WindowsContainer from './component/WindowsContainer';

/**
 * Main App component that renders the PianoRoll within a Windows-like container
 */
function App() {
  return (
    <div className="App">
      <WindowsContainer title="FutureBox Audio Editor">
        <PianoRoll />
      </WindowsContainer>
    </div>
  );
}

export default App;