import React, { useState, useRef, useEffect } from 'react';
import './PianoRoll.css';

/**
 * PianoRoll component that displays an SVG grid with horizontal and vertical scrolling
 */
const PianoRoll = () => {
  const containerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  
  // State for grid dimensions
  const [gridDimensions] = useState({
    width: 2000, // Total width of the grid
    height: 1200, // Total height of the grid
    cellWidth: 20, // Width of each grid cell
    rowHeight: 20, // Height of each row
    viewWidth: 800, // Visible width of the grid container
    viewHeight: 500, // Visible height of the grid container
    keyboardWidth: 100, // Width of the piano keyboard on the left
  });

  // Handle scroll events
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollPosition({
        x: containerRef.current.scrollLeft,
        y: containerRef.current.scrollTop
      });
    }
  };

  // Set up scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // Create grid lines
  const createGridLines = () => {
    const lines = [];
    
    // Create horizontal grid lines
    const rowCount = Math.ceil(gridDimensions.height / gridDimensions.rowHeight);
    for (let i = 0; i <= rowCount; i++) {
      // Make certain lines darker for better readability
      const isDarkerLine = i % 4 === 0;
      lines.push(
        <line 
          key={`h-line-${i}`} 
          x1={0} 
          y1={i * gridDimensions.rowHeight} 
          x2={gridDimensions.width} 
          y2={i * gridDimensions.rowHeight} 
          stroke={isDarkerLine ? "#777" : "#555"} 
          strokeWidth={isDarkerLine ? "2" : "1"} 
        />
      );
    }
    
    // Create vertical grid lines
    const columnCount = Math.ceil(gridDimensions.width / gridDimensions.cellWidth);
    for (let i = 0; i <= columnCount; i++) {
      // Make every 4th line darker for readability
      const isDarkerLine = i % 4 === 0;
      const isMajorLine = i % 16 === 0;
      
      lines.push(
        <line 
          key={`v-line-${i}`} 
          x1={i * gridDimensions.cellWidth} 
          y1={0} 
          x2={i * gridDimensions.cellWidth} 
          y2={gridDimensions.height} 
          stroke={isMajorLine ? "#999" : (isDarkerLine ? "#777" : "#555")} 
          strokeWidth={isMajorLine ? "2" : "1"} 
        />
      );
    }
    
    return lines;
  };

  // Create piano keyboard
  const createPianoKeys = () => {
    const keys = [];
    const rowCount = Math.ceil(gridDimensions.height / gridDimensions.rowHeight);
    // Piano note layout: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
    const isBlackKey = [false, true, false, true, false, false, true, false, true, false, true, false];
    
    // Create white keys first
    for (let i = 0; i < rowCount; i++) {
      const noteIndex = (rowCount - 1 - i) % 12; // Low notes at the bottom
      if (!isBlackKey[noteIndex]) {
        keys.push(
          <rect 
            key={`white-key-${i}`}
            x={0}
            y={i * gridDimensions.rowHeight}
            width={gridDimensions.keyboardWidth}
            height={gridDimensions.rowHeight}
            fill="#f0f0f0"
            stroke="#555"
            strokeWidth="1"
          />
        );
      }
    }
    
    // Create black keys on top
    for (let i = 0; i < rowCount; i++) {
      const noteIndex = (rowCount - 1 - i) % 12;
      if (isBlackKey[noteIndex]) {
        keys.push(
          <rect 
            key={`black-key-${i}`}
            x={0}
            y={i * gridDimensions.rowHeight}
            width={gridDimensions.keyboardWidth * 0.65}
            height={gridDimensions.rowHeight}
            fill="#333"
            stroke="#555"
            strokeWidth="1"
          />
        );
      }
    }
    
    return keys;
  };

  return (
    <div className="piano-roll-wrapper" style={{ 
      position: 'relative', 
      width: gridDimensions.viewWidth, 
      height: gridDimensions.viewHeight,
      border: '1px solid #333',
      borderRadius: '4px',
      overflow: 'hidden'
    }}>
      {/* Fixed position piano keyboard */}
      <div className="piano-keyboard" style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: gridDimensions.keyboardWidth, 
        height: '100%',
        overflow: 'hidden',
        zIndex: 2,
        boxShadow: '2px 0 5px rgba(0,0,0,0.3)'
      }}>
        <div style={{ 
          position: 'absolute', 
          top: -scrollPosition.y, 
          width: '100%', 
          height: gridDimensions.height
        }}>
          <svg 
            width={gridDimensions.keyboardWidth} 
            height={gridDimensions.height}
          >
            <rect 
              width={gridDimensions.keyboardWidth} 
              height={gridDimensions.height} 
              fill="#222"
            />
            {createPianoKeys()}
          </svg>
        </div>
      </div>
      
      {/* Scrollable grid */}
      <div 
        ref={containerRef}
        className="piano-roll-container" 
        style={{ 
          position: 'absolute',
          top: 0,
          right: 0,
          width: gridDimensions.viewWidth - gridDimensions.keyboardWidth, 
          height: gridDimensions.viewHeight,
          overflow: 'auto',
          marginLeft: gridDimensions.keyboardWidth
        }}
      >
        <svg 
          width={gridDimensions.width} 
          height={gridDimensions.height}
        >
          <rect 
            width={gridDimensions.width} 
            height={gridDimensions.height} 
            fill="#282c34" 
          />
          {createGridLines()}
        </svg>
      </div>
    </div>
  );
};

export default PianoRoll;