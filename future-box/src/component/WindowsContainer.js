import React, { useState } from 'react';
import './WindowsContainer.css';

/**
 * A container component that mimics a Windows application window appearance
 * @param {string} title - The title to display in the window title bar
 * @param {ReactNode} children - The content to display inside the window
 */
const WindowsContainer = ({ title, children }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Handle maximize/restore button click
  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };
  
  return (
    <div className={`windows-container ${isMaximized ? 'maximized' : ''}`}>
      {/* Title Bar with window controls */}
      <div className="windows-title-bar">
        <div className="windows-title">
          <span className="windows-icon">🎹</span>
          {title}
        </div>
        <div className="windows-controls">
          <button className="windows-control minimize">─</button>
          <button 
            className="windows-control maximize"
            onClick={toggleMaximize}
          >
            {isMaximized ? '❐' : '☐'}
          </button>
          <button className="windows-control close">✕</button>
        </div>
      </div>
      
      {/* Menu Bar */}
      <div className="windows-menu-bar">
        <div className="windows-menu-item">File</div>
        <div className="windows-menu-item">Edit</div>
        <div className="windows-menu-item">View</div>
        <div className="windows-menu-item">Track</div>
        <div className="windows-menu-item">MIDI</div>
        <div className="windows-menu-item">Tools</div>
        <div className="windows-menu-item">Help</div>
      </div>
      
      {/* Toolbar */}
      <div className="windows-toolbar">
        <button className="toolbar-button">▶️ Play</button>
        <button className="toolbar-button">⏹️ Stop</button>
        <button className="toolbar-button">⏺️ Record</button>
        <div className="toolbar-separator"></div>
        <button className="toolbar-button">➕ Add Track</button>
        <button className="toolbar-button">🔍 Zoom</button>
        <div className="toolbar-spacer"></div>
        <div className="toolbar-info">BPM: 120</div>
        <div className="toolbar-info">4/4</div>
      </div>
      
      {/* Main Content */}
      <div className="windows-content">
        {children}
      </div>
      
      {/* Status Bar */}
      <div className="windows-status-bar">
        <div className="windows-status-item">Ready</div>
        <div className="windows-status-item">Project: Untitled</div>
        <div className="windows-status-item">Sample Rate: 44.1kHz</div>
        <div className="windows-status-item">Buffer: 256</div>
      </div>
    </div>
  );
};

export default WindowsContainer;