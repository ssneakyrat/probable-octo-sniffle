import React from 'react';
import './App.css';
import PianoRoll from './component/PianoRoll';
import DraggableWindowsContainer from './component/DraggableWindowsContainer';

/**
 * Main App component that renders the PianoRoll within a draggable Windows-like container
 */
function App() {
  return (
    <div className="App">
      <DraggableWindowsContainer title="FutureBox Audio Editor">
        <PianoRoll />
      </DraggableWindowsContainer>
    </div>
  );
}

export default App;