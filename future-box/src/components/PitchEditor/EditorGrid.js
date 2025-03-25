import React from 'react';
import { useEditor } from './EditorContext';
import { 
  GRID_HEIGHT, 
  GRID_LINES, 
  HORIZONTAL_SNAP,
  DRAG_STATES,
  DEFAULT_MEASURE_COUNT,
  MEASURE_WIDTH
} from './constants';

const EditorGrid = () => {
  const { 
    noteDragState, 
    timeSignature, 
    calculateTimeDivisions
  } = useEditor();
  
  // Calculate divisions using the same method as before for consistency
  const beatsPerMeasure = timeSignature.numerator;
  const totalMeasuresCount = DEFAULT_MEASURE_COUNT;
  const totalDivisions = totalMeasuresCount * beatsPerMeasure;
  
  // Calculate the actual grid width
  const gridWidth = totalMeasuresCount * MEASURE_WIDTH;
  
  return (
    <>
      {/* Horizontal grid lines */}
      {Array.from({ length: GRID_LINES + 1 }).map((_, i) => (
        <line 
          key={`h-${i}`}
          x1={0} 
          y1={i * (GRID_HEIGHT / GRID_LINES)} 
          x2={gridWidth} 
          y2={i * (GRID_HEIGHT / GRID_LINES)}
          stroke="#ddd"
          strokeWidth="1"
        />
      ))}
      
      {/* Vertical grid lines */}
      {Array.from({ length: totalDivisions + 1 }).map((_, i) => {
        // Determine if this is a measure start (every beatsPerMeasure divisions)
        const isMeasureStart = i % beatsPerMeasure === 0;
        // Determine if this is a beat (depends on time signature)
        const isBeat = timeSignature.denominator === 4 ? 
          (i % 1 === 0) : // For 4/4, 3/4, etc. - every quarter note
          (i % (timeSignature.numerator / 4) === 0); // For 6/8, 9/8, etc. - every dotted quarter (3 eighth notes)
        
        return (
          <line 
            key={`v-${i}`}
            x1={i * (gridWidth / totalDivisions)} 
            y1="0" 
            x2={i * (gridWidth / totalDivisions)} 
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
              x1={0} 
              y1={i * HORIZONTAL_SNAP} 
              x2={gridWidth} 
              y2={i * HORIZONTAL_SNAP}
              stroke="#5070c0"
              strokeWidth="0.5"
              strokeDasharray="2,2"
              opacity="0.3"
            />
          ))}
          
          {/* Visual indicator for grid snap positions - vertical */}
          {Array.from({ length: totalDivisions + 1 }).map((_, i) => (
            <line 
              key={`snap-v-${i}`}
              x1={i * (gridWidth / totalDivisions)} 
              y1="0" 
              x2={i * (gridWidth / totalDivisions)} 
              y2={GRID_HEIGHT}
              stroke="#5070c0"
              strokeWidth="0.5"
              strokeDasharray="2,2"
              opacity="0.3"
            />
          ))}
        </>
      )}
      
      {/* Bar measure ticks */}
      {Array.from({ length: totalDivisions + 1 }).map((_, i) => {
        // Determine if this is a measure start (every beatsPerMeasure divisions)
        const isMeasureStart = i % beatsPerMeasure === 0;
        // Determine if this is a beat (depends on time signature)
        const isBeat = timeSignature.denominator === 4 ? 
          (i % 1 === 0) : // For 4/4, 3/4, etc. - every quarter note
          (i % (timeSignature.numerator / 4) === 0); // For 6/8, 9/8, etc. - every dotted quarter (3 eighth notes)
        
        return (
          <line 
            key={`tick-${i}`}
            x1={i * (gridWidth / totalDivisions)} 
            y1={isMeasureStart ? "-5" : (isBeat ? "-4" : "-2")} 
            x2={i * (gridWidth / totalDivisions)} 
            y2="0"
            stroke={isMeasureStart ? "#333" : "#555"}
            strokeWidth={isMeasureStart ? "1.5" : "1"}
          />
        );
      })}
    </>
  );
};

export default EditorGrid;