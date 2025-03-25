import React, { useState, useRef, useEffect, useCallback } from 'react';
import './WindowsContainer.css';
import './DraggableWindowsContainer.css';
import './SimpleDraggableWindow.css';

/**
 * A simplified container component with only a title bar that mimics a Windows application window appearance
 * with draggable and resizable functionality
 * @param {string} title - The title to display in the window title bar
 * @param {ReactNode} children - The content to display inside the window
 * @param {boolean} isNested - Flag to indicate if this window is nested inside another window
 * @param {boolean} initialMaximized - Whether the window should start maximized
 */
const SimpleDraggableWindow = ({ title, children, isNested, initialMaximized = false }) => {
  const [isMaximized, setIsMaximized] = useState(initialMaximized);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialWindowPos, setInitialWindowPos] = useState({ x: 0, y: 0 });
  const [initialWindowSize, setInitialWindowSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef(null);
  
  // Set initial dimensions on first render
  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
      setInitialWindowSize({ width, height });
    }
  }, []);
  
  // Auto-detect if this is a nested SimpleDraggableWindow by checking the children
  const hasNestedWindow = React.Children.toArray(children).some(
    child => React.isValidElement(child) && 
    (child.type.name === 'SimpleDraggableWindow' || 
     child.type.name === 'DraggableWindowsContainer' ||
     child.type.name === 'WindowsContainer')
  );
  
  // Handle maximize/restore button click
  const toggleMaximize = () => {
    // Store current dimensions before maximizing
    if (!isMaximized) {
      setInitialWindowSize({
        width: dimensions.width, 
        height: dimensions.height
      });
      setInitialWindowPos({ ...position });
    } else {
      // Restore previous dimensions when un-maximizing
      setDimensions(initialWindowSize);
      setPosition(initialWindowPos);
    }
    
    setIsMaximized(!isMaximized);
  };

  // Start dragging when mouse down on title bar
  const handleMouseDown = useCallback((e) => {
    if (isMaximized) return; // Don't allow dragging when maximized
    
    // Store the initial mouse position and the window's current position
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    setInitialWindowPos({ ...position });
    setIsDragging(true);
    
    // Prevent event from bubbling up to parent windows
    e.stopPropagation();
    e.preventDefault();
  }, [isMaximized, position]);

  // Handle mouse move event for dragging
  const handleMouseMove = useCallback((e) => {
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
  }, [isDragging, initialMousePos, initialWindowPos]);

  // End dragging when mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Start resizing when mouse down on a resize handle
  const handleResizeStart = useCallback((e, direction) => {
    if (isMaximized) return; // Don't allow resizing when maximized
    
    // Store initial mouse position, window position and size
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    setInitialWindowPos({ ...position });
    setInitialWindowSize({ ...dimensions });
    setResizeDirection(direction);
    setIsResizing(true);
    
    // Prevent event from bubbling up
    e.stopPropagation();
    e.preventDefault();
  }, [isMaximized, position, dimensions]);

  // Handle mouse move event for resizing
  const handleResizeMove = useCallback((e) => {
    if (!isResizing) return;
    
    // Calculate the delta movement from initial mouse position
    const deltaX = e.clientX - initialMousePos.x;
    const deltaY = e.clientY - initialMousePos.y;
    
    // Default minimum dimensions
    const minWidth = 200;
    const minHeight = 100;
    
    // New dimensions and position to be calculated
    let newWidth = initialWindowSize.width;
    let newHeight = initialWindowSize.height;
    let newX = initialWindowPos.x;
    let newY = initialWindowPos.y;
    
    // Apply changes based on resize direction
    // East (right edge)
    if (resizeDirection.includes('e')) {
      newWidth = Math.max(minWidth, initialWindowSize.width + deltaX);
    }
    // South (bottom edge)
    if (resizeDirection.includes('s')) {
      newHeight = Math.max(minHeight, initialWindowSize.height + deltaY);
    }
    // West (left edge)
    if (resizeDirection.includes('w')) {
      const possibleWidth = initialWindowSize.width - deltaX;
      if (possibleWidth >= minWidth) {
        newWidth = possibleWidth;
        newX = initialWindowPos.x + deltaX;
      }
    }
    // North (top edge)
    if (resizeDirection.includes('n')) {
      const possibleHeight = initialWindowSize.height - deltaY;
      if (possibleHeight >= minHeight) {
        newHeight = possibleHeight;
        newY = initialWindowPos.y + deltaY;
      }
    }
    
    // Update position and dimensions
    setPosition({ x: newX, y: newY });
    setDimensions({ width: newWidth, height: newHeight });
  }, [isResizing, initialMousePos, initialWindowPos, initialWindowSize, resizeDirection]);

  // Add and remove event listeners for dragging and resizing
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDragging) {
        handleMouseMove(e);
      }
      if (isResizing) {
        handleResizeMove(e);
      }
    };

    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }
    
    // Clean up event listeners
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove, handleResizeMove, handleMouseUp]);

  // Apply styles based on maximized state, position and dimensions
  const containerStyles = isMaximized
    ? {}  // No custom position/size when maximized
    : {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        margin: 0,
        cursor: isDragging ? 'grabbing' : 'default',
        // Force inline styles to take precedence over class styles
        minWidth: hasNestedWindow ? `${dimensions.width}px` : '200px',
        minHeight: hasNestedWindow ? `${dimensions.height}px` : '100px'
      };
  
  return (
    <div 
      ref={containerRef}
      className={`windows-container simple-draggable-window 
                 ${isMaximized ? 'maximized' : ''}
                 ${isDragging ? 'dragging' : ''}
                 ${isResizing ? 'resizing' : ''}
                 ${hasNestedWindow ? 'has-nested-window' : ''}
                 ${isNested ? 'nested-window' : ''}`}
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
      
      {/* Resize Handles - only show when not maximized */}
      {!isMaximized && (
        <>
          {/* Edge resize handles */}
          <div 
            className="resize-handle n" 
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          ></div>
          <div 
            className="resize-handle e" 
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          ></div>
          <div 
            className="resize-handle s" 
            onMouseDown={(e) => handleResizeStart(e, 's')}
          ></div>
          <div 
            className="resize-handle w" 
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          ></div>
          
          {/* Corner resize handles */}
          <div 
            className="resize-handle ne" 
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          ></div>
          <div 
            className="resize-handle se" 
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          ></div>
          <div 
            className="resize-handle sw" 
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          ></div>
          <div 
            className="resize-handle nw" 
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          ></div>
        </>
      )}
    </div>
  );
};

export default SimpleDraggableWindow;