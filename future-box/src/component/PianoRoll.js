import React, { useState, useRef, useEffect } from 'react';
import './PianoRoll.css';

/**
 * PianoRoll component that displays an SVG grid with horizontal and vertical scrolling
 * and a bar measure ruler at the top
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
    barMeasureHeight: 30, // Height of the bar measure at the top
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

  // Create bar measure
  const createBarMeasure = () => {
    const measures = [];
    const beatsPerMeasure = 4; // Standard 4/4 time signature
    const cellsPerBeat = 4; // Each beat takes 4 cells (16th notes)
    const measureWidth = beatsPerMeasure * cellsPerBeat * gridDimensions.cellWidth;
    
    // Calculate how many measures we need based on the grid width
    const measureCount = Math.ceil(gridDimensions.width / measureWidth);
    
    // Create measure numbers and bar lines
    for (let i = 0; i <= measureCount; i++) {
      // Add measure number
      measures.push(
        <text
          key={`measure-${i}`}
          x={i * measureWidth + 5}
          y={20}
          fill="#fff"
          fontSize="12"
        >
          {i + 1}
        </text>
      );
      
      // Add major bar line at the start of each measure
      measures.push(
        <line
          key={`measure-line-${i}`}
          x1={i * measureWidth}
          y1={0}
          x2={i * measureWidth}
          y2={gridDimensions.barMeasureHeight}
          stroke="#fff"
          strokeWidth="2"
        />
      );
      
      // Add beat lines within each measure
      for (let j = 1; j < beatsPerMeasure; j++) {
        measures.push(
          <line
            key={`beat-line-${i}-${j}`}
            x1={i * measureWidth + j * cellsPerBeat * gridDimensions.cellWidth}
            y1={0}
            x2={i * measureWidth + j * cellsPerBeat * gridDimensions.cellWidth}
            y2={gridDimensions.barMeasureHeight}
            stroke="#999"
            strokeWidth="1"
          />
        );
      }
    }
    
    return measures;
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
      {/* Bar measure at the top */}
      <div className="bar-measure" style={{ 
        position: 'absolute', 
        top: 0, 
        left: gridDimensions.keyboardWidth, 
        width: gridDimensions.viewWidth - gridDimensions.keyboardWidth, 
        height: gridDimensions.barMeasureHeight,
        overflow: 'hidden',
        zIndex: 2,
        backgroundColor: '#1a1a1a',
        boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
      }}>
        <div style={{ 
          position: 'absolute', 
          left: -scrollPosition.x, 
          width: gridDimensions.width, 
          height: '100%'
        }}>
          <svg 
            width={gridDimensions.width} 
            height={gridDimensions.barMeasureHeight}
          >
            {createBarMeasure()}
          </svg>
        </div>
      </div>
      
      {/* Fixed position piano keyboard */}
      <div className="piano-keyboard" style={{ 
        position: 'absolute', 
        top: gridDimensions.barMeasureHeight, 
        left: 0, 
        width: gridDimensions.keyboardWidth, 
        height: gridDimensions.viewHeight - gridDimensions.barMeasureHeight,
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
          top: gridDimensions.barMeasureHeight,
          right: 0,
          width: gridDimensions.viewWidth - gridDimensions.keyboardWidth, 
          height: gridDimensions.viewHeight - gridDimensions.barMeasureHeight,
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