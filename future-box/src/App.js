import React from 'react';
import './App.css';
import PianoRoll from './component/PianoRoll';

/**
 * Main App component that renders the PianoRoll
 */
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>FutureBox Audio Editor</h1>
        <div className="editor-wrapper">
          <PianoRoll />
        </div>
      </header>
    </div>
  );
}

export default App;