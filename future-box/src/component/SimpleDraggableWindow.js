import React, { useState, useRef, useEffect } from 'react';
import './WindowsContainer.css';
import './DraggableWindowsContainer.css';
import './SimpleDraggableWindow.css';

/**
 * A simplified container component with only a title bar that mimics a Windows application window appearance
 * with draggable functionality
 * @param {string} title - The title to display in the window title bar
 * @param {ReactNode} children - The content to display inside the window
 * @param {boolean} isNested - Flag to indicate if this window is nested inside another window
 */
const SimpleDraggableWindow = ({ title, children, isNested }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialWindowPos, setInitialWindowPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  
  // Auto-detect if this is a nested SimpleDraggableWindow by checking the children
  const hasNestedWindow = React.Children.toArray(children).some(
    child => React.isValidElement(child) && 
    (child.type.name === 'SimpleDraggableWindow' || 
     child.type.name === 'DraggableWindowsContainer' ||
     child.type.name === 'WindowsContainer')
  );
  
  // Handle maximize/restore button click
  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    // Reset position when restoring from maximized
    if (isMaximized) {
      setPosition({ x: 0, y: 0 });
    }
  };

  // Start dragging when mouse down on title bar - MODIFIED
  const handleMouseDown = (e) => {
    if (isMaximized) return; // Don't allow dragging when maximized
    
    // Store the initial mouse position and the window's current position
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    setInitialWindowPos({ ...position });
    setIsDragging(true);
    
    // Prevent event from bubbling up to parent windows
    e.stopPropagation();
  };

  // Handle mouse move event for dragging - MODIFIED
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    // Calculate the delta movement from the initial mouse position
    const deltaX = e.clientX - initialMousePos.x;
    const deltaY = e.clientY - initialMousePos.y;
    
    // Apply this delta to the initial window position
    const newPosition = {
      x: initialWindowPos.x + deltaX,
      y: initialWindowPos.y + deltaY
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
  }, [isDragging, initialMousePos, initialWindowPos]);

  // Apply styles based on maximized state and position
  const containerStyles = isMaximized
    ? {}  // No custom position when maximized
    : {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        margin: 0,
        cursor: isDragging ? 'grabbing' : 'default',
        // Adjust size if this is a parent container with nested windows
        ...(hasNestedWindow && {
          width: 'auto',
          height: 'auto',
          minWidth: '800px',  // Set a reasonable min-width
          minHeight: '600px', // Set a reasonable min-height
        }),
        // Adjust size if this is a nested window
        ...(isNested && {
          width: '90%',      // Take up most of the parent container
          height: '90%',     // Take up most of the parent container
          maxWidth: '1100px',
          maxHeight: '800px',
        })
      };
  
  return (
    <div 
      ref={containerRef}
      className={`windows-container simple-draggable-window ${isMaximized ? 'maximized' : ''} ${isDragging ? 'dragging' : ''} ${hasNestedWindow ? 'has-nested-window' : ''} ${isNested ? 'nested-window' : ''}`}
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
      
      {/* Main Content (directly under the title bar) */}
      <div className="windows-content">
        {/* Pass isNested prop to any child SimpleDraggableWindow components */}
        {React.Children.map(children, child => {
          if (React.isValidElement(child) && 
              (child.type.name === 'SimpleDraggableWindow' || 
               child.type.name === 'DraggableWindowsContainer')) {
            return React.cloneElement(child, { isNested: true });
          }
          return child;
        })}
      </div>
    </div>
  );
};

export default SimpleDraggableWindow;