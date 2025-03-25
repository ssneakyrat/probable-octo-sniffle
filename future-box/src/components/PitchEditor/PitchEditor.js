import React, { useRef, useEffect } from 'react';
import { EditorProvider, useEditor } from './EditorContext';
import { 
  PIANO_KEY_WIDTH, 
  GRID_HEIGHT, 
  GRID_WIDTH,
  EDITOR_MODES,
  HORIZONTAL_SNAP,
  EXTENDED_GRID_WIDTH,
  EXTENDED_GRID_HEIGHT,
  TOTAL_GRID_WIDTH,
} from './constants';
import { snapToGrid, updateNoteConnections, adjustPitchPoints, updateYOffsets } from './noteUtils';

import EditorToolbar from './EditorToolbar';
import TimeSignatureSelector from './TimeSignatureSelector';
import PianoPitchCountSelector from './PianoPitchCountSelector';
import PianoKeys from './PianoKeys';
import EditorGrid from './EditorGrid';
import Note from './Note';
import ConnectionIndicator from './ConnectionIndicator';
import BarMeasures from './BarMeasures';

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
    getCurrentVerticalSnap
  } = useEditor();
  
  const svgRefElement = useRef(null);
  
  // Set the SVG ref in the context
  useEffect(() => {
    setSvgRef(svgRefElement.current);
  }, [svgRefElement, setSvgRef]);
  
  // Handle click on grid to create a new note in draw mode
  const handleGridClick = (e) => {
    if (editorMode !== EDITOR_MODES.DRAW) return;
    
    const svgRect = svgRefElement.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    
    // Only create notes within the grid area
    if (x > PIANO_KEY_WIDTH && x < GRID_WIDTH && y > 0 && y < GRID_HEIGHT) {
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
      // Delete key pressed while a control point is active
      if ((e.key === 'Delete' || e.key === 'Backspace') && 
          activePoint && 
          editorMode === EDITOR_MODES.SELECT) {
        const { noteIndex, type, index } = activePoint;
        
        // Only delete anchor points (not control handles)
        if (type === 'anchor' && 
            noteIndex !== null && 
            index > 0 && 
            notes[noteIndex] && 
            index < notes[noteIndex].pitchPoints.length - 1) {
          
          setNotes(prevNotes => {
            const newNotes = [...prevNotes];
            const note = newNotes[noteIndex];
            
            if (!note || !note.pitchPoints) return prevNotes;
            
            const points = [...note.pitchPoints];
            
            // Can't delete first or last point (these are anchored to note boundaries)
            if (index === 0 || index === points.length - 1) {
              return prevNotes;
            }
            
            // Need to keep at least 2 points (start and end)
            if (points.length <= 2) {
              return prevNotes;
            }
            
            // Remove the point
            points.splice(index, 1);
            newNotes[noteIndex].pitchPoints = points;
            
            // Update connections after deleting a point
            return updateNoteConnections(newNotes);
          });
          
          setActivePoint(null);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePoint, editorMode, notes, setActivePoint, setNotes]);
  
  // Handle mouse move for dragging notes and control points
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!svgRef) return;
      
      const svgRect = svgRef.getBoundingClientRect();
      const currentX = e.clientX - svgRect.left;
      const currentY = e.clientY - svgRect.top;
      
      // Only proceed if in select mode and a note is selected
      if (editorMode !== EDITOR_MODES.SELECT || selectedNoteIndex === null) return;
      
      // Case 1: Dragging pitch points
      if (activePoint) {
        const { noteIndex, type, index } = activePoint;
        const x = currentX;
        const y = currentY;
        
        // Keep y within grid
        const newY = Math.max(0, Math.min(GRID_HEIGHT, y));
        
        setNotes(prevNotes => {
          const newNotes = [...prevNotes];
          
          // Safety check
          if (noteIndex >= newNotes.length) return prevNotes;
          
          const noteRect = newNotes[noteIndex].rect;
          const points = [...newNotes[noteIndex].pitchPoints];
          
          if (type === 'anchor') {
            // Check if this is the first or last point - these are fixed to note boundaries
            if (index === 0 || index === points.length - 1) {
              // Only update the Y position for first and last points
              points[index] = {
                ...points[index],
                y: newY
              };
              
              // Update control points Y position accordingly
              if (index === 0 && points[index].cp1y !== undefined) {
                points[index].cp1y = newY;
              }
              
              if (index === points.length - 1 && points[index].cp2y !== undefined) {
                points[index].cp2y = newY;
              }
            } else {
              // For middle points, keep x within note boundaries
              let newX = x;
              
              // Constrain to note boundaries
              newX = Math.max(newX, noteRect.x);
              newX = Math.min(newX, noteRect.x + noteRect.width);
              
              // Left to right enforcement - can't go left of previous point
              if (index > 0) {
                newX = Math.max(newX, points[index - 1].x + 10);
              }
              
              // Can't go right of next point
              if (index < points.length - 1) {
                newX = Math.min(newX, points[index + 1].x - 10);
              }
              
              // Move the anchor point
              const xDiff = newX - points[index].x;
              
              // Update anchor point
              points[index] = {
                ...points[index],
                x: newX,
                y: newY
              };
              
              // Move control points with anchor
              if (points[index].cp2x !== undefined) {
                points[index].cp2x += xDiff;
              }
              
              if (points[index].cp1x !== undefined) {
                points[index].cp1x += xDiff;
              }
            }
          } else if (type === 'cp1') {
            // Dragging outgoing control point
            let newX = x;
            
            // Constrain to note boundaries
            newX = Math.max(newX, noteRect.x);
            newX = Math.min(newX, noteRect.x + noteRect.width);
            
            // Control point can't go left of its anchor
            newX = Math.max(newX, points[index].x);
            
            // Control point can't go right of next anchor point if it exists
            if (index < points.length - 1) {
              newX = Math.min(newX, points[index + 1].x);
            }
            
            points[index] = {
              ...points[index],
              cp1x: newX,
              cp1y: newY
            };
          } else if (type === 'cp2') {
            // Dragging incoming control point
            let newX = x;
            
            // Constrain to note boundaries
            newX = Math.max(newX, noteRect.x);
            newX = Math.min(newX, noteRect.x + noteRect.width);
            
            // Control point can't go right of its anchor
            newX = Math.min(newX, points[index].x);
            
            // Control point can't go left of previous anchor point if it exists
            if (index > 0) {
              newX = Math.max(newX, points[index - 1].x);
            }
            
            points[index] = {
              ...points[index],
              cp2x: newX,
              cp2y: newY
            };
          }
          
          // Update Y offsets for all points
          newNotes[noteIndex].pitchPoints = updateYOffsets(points, noteRect);
          
          // Update connections
          return updateNoteConnections(newNotes);
        });
      } 
      // Case 2: Dragging note
      else if (noteDragState === 'dragging' && initialRect && initialPoints && selectedNoteIndex !== null) {
        const deltaX = currentX - dragStartPos.x;
        const deltaY = currentY - dragStartPos.y;
        
        // Calculate new note position
        let newX = initialRect.x + deltaX;
        let newY = initialRect.y + deltaY;
        
        // Get current vertical snap value based on time signature
        const verticalSnap = getCurrentVerticalSnap();
        
        // Snap to grid
        newX = snapToGrid(newX - PIANO_KEY_WIDTH, verticalSnap) + PIANO_KEY_WIDTH;
        newY = snapToGrid(newY, HORIZONTAL_SNAP);
        
        // Constrain to grid boundaries
        newX = Math.max(PIANO_KEY_WIDTH, newX);
        newX = Math.min(TOTAL_GRID_WIDTH - initialRect.width, newX);
        newY = Math.max(0, Math.min(GRID_HEIGHT - initialRect.height, newY));
        
        // Update note rectangle
        const newRect = {
          ...initialRect,
          x: newX,
          y: newY
        };
        
        setNotes(prevNotes => {
          const newNotes = [...prevNotes];
          newNotes[selectedNoteIndex].rect = newRect;
          
          // Update pitch points
          const newPoints = adjustPitchPoints(newRect, initialRect, initialPoints);
          newNotes[selectedNoteIndex].pitchPoints = newPoints;
          
          // Update connections
          return updateNoteConnections(newNotes);
        });
      } 
      // Case 3: Resizing note from left
      else if (noteDragState === 'resizing-left' && initialRect && initialPoints && selectedNoteIndex !== null) {
        const deltaX = currentX - dragStartPos.x;
        
        // Calculate new left edge and width
        let newX = initialRect.x + deltaX;
        
        // Get current vertical snap value based on time signature
        const verticalSnap = getCurrentVerticalSnap();
        
        // Snap to grid
        newX = snapToGrid(newX - PIANO_KEY_WIDTH, verticalSnap) + PIANO_KEY_WIDTH;
        
        let newWidth = initialRect.x + initialRect.width - newX;
        
        // Enforce minimum width and grid boundaries
        newX = Math.min(newX, initialRect.x + initialRect.width - 80);
        newX = Math.max(PIANO_KEY_WIDTH, newX);
        newWidth = initialRect.x + initialRect.width - newX;
        
        // Update note rectangle
        const newRect = {
          ...initialRect,
          x: newX,
          width: newWidth
        };
        
        setNotes(prevNotes => {
          const newNotes = [...prevNotes];
          newNotes[selectedNoteIndex].rect = newRect;
          
          // Update pitch points
          const newPoints = adjustPitchPoints(newRect, initialRect, initialPoints);
          newNotes[selectedNoteIndex].pitchPoints = newPoints;
          
          // Update connections
          return updateNoteConnections(newNotes);
        });
      } 
      // Case 4: Resizing note from right
      else if (noteDragState === 'resizing-right' && initialRect && initialPoints && selectedNoteIndex !== null) {
        const deltaX = currentX - dragStartPos.x;
        
        // Calculate new width
        let newWidth = initialRect.width + deltaX;
        
        // Get current vertical snap value based on time signature
        const verticalSnap = getCurrentVerticalSnap();
        
        // Snap to grid
        const rightEdge = initialRect.x + newWidth;
        const snappedRightEdge = snapToGrid(rightEdge - PIANO_KEY_WIDTH, verticalSnap) + PIANO_KEY_WIDTH;
        newWidth = snappedRightEdge - initialRect.x;
        
        // Enforce minimum width and grid boundaries
        newWidth = Math.max(80, newWidth);
        newWidth = Math.min(TOTAL_GRID_WIDTH - initialRect.x, newWidth);
        
        // Update note rectangle
        const newRect = {
          ...initialRect,
          width: newWidth
        };
        
        setNotes(prevNotes => {
          const newNotes = [...prevNotes];
          newNotes[selectedNoteIndex].rect = newRect;
          
          // Update pitch points
          const newPoints = adjustPitchPoints(newRect, initialRect, initialPoints);
          newNotes[selectedNoteIndex].pitchPoints = newPoints;
          
          // Update connections
          return updateNoteConnections(newNotes);
        });
      }
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
      
      {/* Editor container with very prominent border */}
      <div 
        className="border-8 border-red-600 rounded-lg p-2 w-full bg-white shadow-lg"
        style={{ borderWidth: '4px', borderColor: '#000000', borderStyle: 'solid' }}
      >
        <div className="relative border border-gray-300 bg-white">
          <div className="overflow-auto" 
            style={{ 
            width: '100%',
            maxWidth: GRID_WIDTH,
            maxHeight: GRID_HEIGHT/2,
            overflowX: 'auto',
            overflowY: 'auto' 
          }}
          >
            <svg 
              ref={svgRefElement}
              width={TOTAL_GRID_WIDTH} 
              height={GRID_HEIGHT}
              viewBox={`0 -30 ${TOTAL_GRID_WIDTH+PIANO_KEY_WIDTH} ${GRID_HEIGHT + 30}`}
              className="cursor-default"
              style={{ cursor: getCursorStyle() }}
              onClick={handleGridClick}
            >
              <BarMeasures />
              <EditorGrid />
              <PianoKeys />
              
              {/* Render all notes */}
              {notes.map((note, noteIndex) => (
                <Note 
                  key={`note-${noteIndex}`} 
                  note={note} 
                  noteIndex={noteIndex} 
                />
              ))}
              
              <ConnectionIndicator />
            </svg>
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