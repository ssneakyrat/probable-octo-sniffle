import React from 'react';
import { useEditor } from './EditorContext';
import { 
  PIANO_KEY_WIDTH, 
  GRID_HEIGHT, 
  GRID_WIDTH,
  TOTAL_GRID_WIDTH,
  GRID_LINES, 
  HORIZONTAL_SNAP,
  DRAG_STATES
} from './constants';

const EditorGrid = () => {
  const { 
    noteDragState, 
    timeSignature, 
    calculateTimeDivisions, 
    getCurrentVerticalSnap 
  } = useEditor();
  
  const divisions = calculateTimeDivisions();
  const beatsPerMeasure = timeSignature.numerator;
  const verticalSnap = getCurrentVerticalSnap();
  
  return (
    <>
      {/* Grid background */}
      <rect 
        x={PIANO_KEY_WIDTH} 
        y="0" 
        width={TOTAL_GRID_WIDTH - PIANO_KEY_WIDTH} 
        height={GRID_HEIGHT} 
        fill="#f8f8f8" 
      />
      
      {/* Horizontal grid lines */}
      {Array.from({ length: GRID_LINES + 1 }).map((_, i) => (
        <line 
          key={`h-${i}`}
          x1={PIANO_KEY_WIDTH} 
          y1={i * (GRID_HEIGHT / GRID_LINES)} 
          x2={TOTAL_GRID_WIDTH} 
          y2={i * (GRID_HEIGHT / GRID_LINES)}
          stroke="#ddd"
          strokeWidth="1"
        />
      ))}
      
      {/* Vertical grid lines */}
      {Array.from({ length: divisions + 1 }).map((_, i) => {
        // Determine if this is a measure start (every beatsPerMeasure divisions)
        const isMeasureStart = i % beatsPerMeasure === 0;
        // Determine if this is a beat (depends on time signature)
        const isBeat = timeSignature.denominator === 4 ? 
          (i % 1 === 0) : // For 4/4, 3/4, etc. - every quarter note
          (i % (timeSignature.numerator / 4) === 0); // For 6/8, 9/8, etc. - every dotted quarter (3 eighth notes)
        
        // Calculate position based on TOTAL_GRID_WIDTH instead of GRID_WIDTH
        return (
          <line 
            key={`v-${i}`}
            x1={PIANO_KEY_WIDTH + i * ((TOTAL_GRID_WIDTH - PIANO_KEY_WIDTH) / divisions)} 
            y1="0" 
            x2={PIANO_KEY_WIDTH + i * ((TOTAL_GRID_WIDTH - PIANO_KEY_WIDTH) / divisions)} 
            y2={GRID_HEIGHT}
            stroke={isMeasureStart ? "#aaa" : (isBeat ? "#ccc" : "#ddd")}
            strokeWidth={isMeasureStart ? "1.5" : "1"}
          />
        );
      })}
      
      {/* Show snap grid indicators for selection mode when dragging */}
      {noteDragState && (
        <>
          {/* Visual indicator for grid snap positions - horizontal */}
          {Array.from({ length: GRID_LINES + 1 }).map((_, i) => (
            <line 
              key={`snap-h-${i}`}
              x1={PIANO_KEY_WIDTH} 
              y1={i * HORIZONTAL_SNAP} 
              x2={TOTAL_GRID_WIDTH} 
              y2={i * HORIZONTAL_SNAP}
              stroke="#5070c0"
              strokeWidth="0.5"
              strokeDasharray="2,2"
              opacity="0.3"
            />
          ))}
          
          {/* Visual indicator for grid snap positions - vertical */}
          {Array.from({ length: divisions + 1 }).map((_, i) => (
            <line 
              key={`snap-v-${i}`}
              x1={PIANO_KEY_WIDTH + i * verticalSnap} 
              y1="0" 
              x2={PIANO_KEY_WIDTH + i * verticalSnap} 
              y2={GRID_HEIGHT}
              stroke="#5070c0"
              strokeWidth="0.5"
              strokeDasharray="2,2"
              opacity="0.3"
            />
          ))}
        </>
      )}
    </>
  );
};

export default EditorGrid;