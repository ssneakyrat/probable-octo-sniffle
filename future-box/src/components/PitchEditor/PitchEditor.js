import React, { useRef, useEffect } from 'react';
import { EditorProvider, useEditor } from './EditorContext';
import { 
  PIANO_KEY_WIDTH, 
  GRID_HEIGHT, 
  GRID_WIDTH,
  EDITOR_MODES,
  HORIZONTAL_SNAP,
  TOTAL_GRID_WIDTH,
  DEFAULT_MEASURE_COUNT,
  MEASURE_WIDTH
} from './constants';
import { snapToGrid, updateNoteConnections, adjustPitchPoints, updateYOffsets } from './noteUtils';

import EditorToolbar from './EditorToolbar';
import TimeSignatureSelector from './TimeSignatureSelector';
import PianoKeys from './PianoKeys';
import EditorGrid from './EditorGrid';
import Note from './Note';
import ConnectionIndicator from './ConnectionIndicator';
import BarMeasures from './BarMeasures';
import PianoPitchCountSelector from './PianoPitchCountSelector';

const PitchEditorContent = () => {
  const { 
    editorMode,
    notes,
    setNotes,
    selectedNoteIndex,
    activePoint,
    setActivePoint,
    noteDragState,
    setNoteDragState,
    dragStartPos,
    initialRect,
    initialPoints,
    svgRef,
    setSvgRef,
    handleCreateNote,
    resetDragState,
    getCurrentVerticalSnap,
    pianoPitchCount,
  } = useEditor();
  
  const svgRefElement = useRef(null);
  const containerRef = useRef(null);
  const debugRef = useRef(null);
  
  // Set the SVG ref in the context
  useEffect(() => {
    setSvgRef(svgRefElement.current);
  }, [svgRefElement, setSvgRef]);

  // Add debug scroll position display
  useEffect(() => {
    const updateDebugInfo = () => {
      if (debugRef.current && containerRef.current) {
        debugRef.current.textContent = `Scroll: ${containerRef.current.scrollLeft}px`;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', updateDebugInfo);
      // Force an initial scroll reset
      container.scrollLeft = 0;
      updateDebugInfo();
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', updateDebugInfo);
      }
    };
  }, [containerRef.current]);

  // Handle click on grid to create a new note in draw mode
  const handleGridClick = (e) => {
    if (editorMode !== EDITOR_MODES.DRAW) return;
    
    const svgRect = svgRefElement.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    
    // Only create notes within the grid area
    if (x > PIANO_KEY_WIDTH && x < TOTAL_GRID_WIDTH && y > 0 && y < GRID_HEIGHT) {
      handleCreateNote(x, y);
    }
  };
  
  // Get cursor style based on mode
  const getCursorStyle = () => {
    switch (editorMode) {
      case EDITOR_MODES.DRAW: return 'crosshair';
      case EDITOR_MODES.DELETE: return 'not-allowed';
      default: return 'default';
    }
  };
  
  // Handle keyboard events for deleting points
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Implementation remains the same...
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePoint, editorMode, notes, setActivePoint, setNotes]);
  
  // Handle mouse move for dragging notes and control points
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Implementation remains the same...
    };
    
    const handleMouseUp = () => {
      resetDragState();
    };
    
    if (activePoint || noteDragState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    activePoint, 
    noteDragState, 
    dragStartPos, 
    initialRect, 
    initialPoints, 
    selectedNoteIndex, 
    editorMode, 
    svgRef,
    setNotes,
    resetDragState,
    getCurrentVerticalSnap
  ]);

  // Calculate the real grid width for content
  const gridContentWidth = DEFAULT_MEASURE_COUNT * MEASURE_WIDTH;
  
  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-md w-full max-w-4xl mx-auto select-none">
      <h2 className="text-xl font-bold mb-2">UTAU-like Pitch Editor with Connected Notes</h2>
      
      <div className="flex justify-between items-center w-full mb-4">
        <div className="flex space-x-4">
          <TimeSignatureSelector />
          <PianoPitchCountSelector />
        </div>
        <EditorToolbar />
      </div>
      
      {/* COMPLETELY NEW EDITOR STRUCTURE */}
      <div 
        className="border-4 border-black rounded-lg p-2 w-full bg-white shadow-lg overflow-hidden"
      >
        {/* Debug info */}
        <div 
          ref={debugRef} 
          className="absolute right-4 bottom-4 bg-white p-1 text-xs border border-gray-300 z-50"
        >
          Scroll: 0px
        </div>

        {/* Split structure with fixed piano keys and scrollable grid */}
        <div className="relative" style={{ height: GRID_HEIGHT, width: '100%' }}>
          {/* Fixed piano keys container - always visible */}
          <div
            className="absolute left-0 top-0 bg-white"
            style={{ 
              width: PIANO_KEY_WIDTH, 
              height: GRID_HEIGHT,
              zIndex: 10,
              borderRight: '1px solid #aaa'
            }}
          >
            <svg 
              width={PIANO_KEY_WIDTH} 
              height={GRID_HEIGHT}
              viewBox={`0 0 ${PIANO_KEY_WIDTH} ${GRID_HEIGHT}`}
            >
              <PianoKeys />
              {/* Time signature display */}
              <text
                x={PIANO_KEY_WIDTH / 2}
                y="-7"
                textAnchor="middle"
                fill="#333"
                fontSize="12"
                fontWeight="bold"
              >
                {/*{timeSignature.display}*/}
              </text>
            </svg>
          </div>
          
          {/* Scrollable grid container - this is what scrolls */}
          <div 
            ref={containerRef}
            className="absolute left-0 top-0 w-full h-full overflow-x-auto overflow-y-auto"
            style={{ paddingLeft: PIANO_KEY_WIDTH }}
          >
            <div style={{ width: gridContentWidth, height: GRID_HEIGHT, position: 'relative' }}>
              <svg 
                ref={svgRefElement}
                width={gridContentWidth} 
                height={GRID_HEIGHT}
                viewBox={`0 -30 ${gridContentWidth} ${GRID_HEIGHT + 30}`}
                style={{ cursor: getCursorStyle() }}
                onClick={handleGridClick}
              >
                {/* Bar measures above the grid */}
                <rect 
                  x={0} 
                  y="-20" 
                  width={gridContentWidth} 
                  height="20" 
                  fill="#e8e8e8" 
                />
                
                {/* Grid background */}
                <rect 
                  x={0} 
                  y="0" 
                  width={gridContentWidth} 
                  height={GRID_HEIGHT} 
                  fill="#f8f8f8" 
                />
                
                {/* Bar measure numbers */}
                {Array.from({ length: DEFAULT_MEASURE_COUNT + 1 }).map((_, i) => (
                  <text
                    key={`measure-${i}`}
                    x={i * MEASURE_WIDTH}
                    y="-7"
                    textAnchor="middle"
                    fill="#555"
                    fontSize="10"
                  >
                    {i}
                  </text>
                ))}
                
                {/* Grid lines and other elements */}
                <EditorGrid />
                
                {/* Render all notes with adjusted positions */}
                {notes.map((note, noteIndex) => (
                  <Note 
                    key={`note-${noteIndex}`} 
                    note={{
                      ...note,
                      rect: {
                        ...note.rect,
                        // Adjust x position to account for piano keys not being in the SVG
                        x: note.rect.x - PIANO_KEY_WIDTH
                      }
                    }} 
                    noteIndex={noteIndex} 
                  />
                ))}
                
                <ConnectionIndicator />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PitchEditor = () => {
  return (
    <EditorProvider>
      <PitchEditorContent />
    </EditorProvider>
  );
};

export default PitchEditor;