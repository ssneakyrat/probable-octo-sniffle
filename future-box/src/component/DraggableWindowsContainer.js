import React, { useState, useRef, useEffect } from 'react';
import './WindowsContainer.css';

/**
 * A container component that mimics a Windows application window appearance
 * with draggable functionality
 * @param {string} title - The title to display in the window title bar
 * @param {ReactNode} children - The content to display inside the window
 */
const DraggableWindowsContainer = ({ title, children }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  
  // Handle maximize/restore button click
  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    // Reset position when restoring from maximized
    if (isMaximized) {
      setPosition({ x: 0, y: 0 });
    }
  };

  // Start dragging when mouse down on title bar
  const handleMouseDown = (e) => {
    if (isMaximized) return; // Don't allow dragging when maximized
    
    // Get the current position of the container
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate the offset from the mouse position to the container position
    setDragOffset({
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top
    });
    
    setIsDragging(true);
  };

  // Handle mouse move event for dragging
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    // Calculate new position based on mouse position and original offset
    const newPosition = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    };
    
    setPosition(newPosition);
  };

  // End dragging when mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add and remove event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    
    // Clean up event listeners
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Apply styles based on maximized state and position
  const containerStyles = isMaximized
    ? {}  // No custom position when maximized
    : {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        margin: 0,
        cursor: isDragging ? 'grabbing' : 'default'
      };
  
  return (
    <div 
      ref={containerRef}
      className={`windows-container ${isMaximized ? 'maximized' : ''}`}
      style={containerStyles}
    >
      {/* Title Bar with window controls */}
      <div 
        className="windows-title-bar"
        onMouseDown={handleMouseDown}
        style={{ cursor: isMaximized ? 'default' : 'grab' }}
      >
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

export default DraggableWindowsContainer;