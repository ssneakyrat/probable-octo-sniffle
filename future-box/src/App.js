import React from 'react';
import './App.css';
import PitchEditor from './component/PitchEditorOld';

/**
 * Main App component that renders the PitchEditor
 */
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>FutureBox Audio Editor</h1>
        <div className="editor-wrapper">
          {/*<PitchEditor />*/}
        </div>
      </header>
    </div>
  );
}

export default App;