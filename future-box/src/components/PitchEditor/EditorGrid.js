import React from 'react';
import { useEditor } from './EditorContext';
import { 
  PIANO_KEY_WIDTH, 
  GRID_HEIGHT, 
  GRID_WIDTH, 
  GRID_LINES, 
  TIME_DIVISIONS, 
  HORIZONTAL_SNAP,
  VERTICAL_SNAP,
  DRAG_STATES
} from './constants';

const EditorGrid = () => {
  const { noteDragState } = useEditor();
  
  return (
    <>
      {/* Grid background */}
      <rect 
        x={PIANO_KEY_WIDTH} 
        y="0" 
        width={GRID_WIDTH - PIANO_KEY_WIDTH} 
        height={GRID_HEIGHT} 
        fill="#f8f8f8" 
      />
      
      {/* Horizontal grid lines */}
      {Array.from({ length: GRID_LINES + 1 }).map((_, i) => (
        <line 
          key={`h-${i}`}
          x1={PIANO_KEY_WIDTH} 
          y1={i * (GRID_HEIGHT / GRID_LINES)} 
          x2={GRID_WIDTH} 
          y2={i * (GRID_HEIGHT / GRID_LINES)}
          stroke="#ddd"
          strokeWidth="1"
        />
      ))}
      
      {/* Vertical grid lines */}
      {Array.from({ length: TIME_DIVISIONS + 1 }).map((_, i) => (
        <line 
          key={`v-${i}`}
          x1={PIANO_KEY_WIDTH + i * ((GRID_WIDTH - PIANO_KEY_WIDTH) / TIME_DIVISIONS)} 
          y1="0" 
          x2={PIANO_KEY_WIDTH + i * ((GRID_WIDTH - PIANO_KEY_WIDTH) / TIME_DIVISIONS)} 
          y2={GRID_HEIGHT}
          stroke="#ddd"
          strokeWidth="1"
        />
      ))}
      
      {/* Show snap grid indicators for selection mode when dragging */}
      {noteDragState && (
        <>
          {/* Visual indicator for grid snap positions - horizontal */}
          {Array.from({ length: GRID_LINES + 1 }).map((_, i) => (
            <line 
              key={`snap-h-${i}`}
              x1={PIANO_KEY_WIDTH} 
              y1={i * HORIZONTAL_SNAP} 
              x2={GRID_WIDTH} 
              y2={i * HORIZONTAL_SNAP}
              stroke="#5070c0"
              strokeWidth="0.5"
              strokeDasharray="2,2"
              opacity="0.3"
            />
          ))}
          
          {/* Visual indicator for grid snap positions - vertical */}
          {Array.from({ length: TIME_DIVISIONS + 1 }).map((_, i) => (
            <line 
              key={`snap-v-${i}`}
              x1={PIANO_KEY_WIDTH + i * VERTICAL_SNAP} 
              y1="0" 
              x2={PIANO_KEY_WIDTH + i * VERTICAL_SNAP} 
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