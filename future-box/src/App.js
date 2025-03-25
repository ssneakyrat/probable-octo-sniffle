import React from 'react';
import './App.css';
import PianoRoll from './component/PianoRoll';
import SimpleDraggableWindow from './component/SimpleDraggableWindow';

/**
 * Main App component that renders the PianoRoll within a draggable Windows-like container
 */
function App() {
  return (
    <div className="App">
      <SimpleDraggableWindow title="Main Window" initialMaximized={true}>
        <SimpleDraggableWindow title="Piano Roll">
          <PianoRoll />
        </SimpleDraggableWindow>
      </SimpleDraggableWindow>
    </div>
  );
}

export default App;