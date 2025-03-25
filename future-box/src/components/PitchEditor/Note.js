import React from 'react';
import { useEditor } from './EditorContext';
import { EDITOR_MODES, GRID_HEIGHT, HANDLE_SIZE } from './constants';
import ControlPoints from './ControlPoints';
import BezierCurve from './BezierCurve';
import { findConnectedNotes } from './noteUtils';

const Note = ({ note, noteIndex }) => {
  const { 
    editorMode, 
    selectedNoteIndex, 
    notes,
    handleSelectNote, 
    handleDeleteNote,
    handleDragStart,
    handleResizeStart
  } = useEditor();
  
  const isSelected = noteIndex === selectedNoteIndex;
  const noteRect = note.rect;
  const pitchPoints = note.pitchPoints;
  
  // Find connected notes (for highlighting connection points)
  const connectedNotes = findConnectedNotes(notes);
  const isConnectedLeft = connectedNotes.some(conn => conn.to === noteIndex);
  const isConnectedRight = connectedNotes.some(conn => conn.from === noteIndex);
  
  // Handle note click
  const handleNoteClick = (e) => {
    e.stopPropagation();
    
    if (editorMode === EDITOR_MODES.DELETE) {
      // Delete note
      handleDeleteNote(noteIndex);
    } else if (editorMode === EDITOR_MODES.SELECT) {
      // Select note
      handleSelectNote(noteIndex);
    }
  };
  
  // Determine cursor style based on editor mode
  const getCursorStyle = () => {
    switch (editorMode) {
      case EDITOR_MODES.SELECT:
        return 'move';
      case EDITOR_MODES.DELETE:
        return 'not-allowed';
      default:
        return 'pointer';
    }
  };
  
  return (
    <>
      {/* Note pitch boundaries (visual indicator) - only for selected note */}
      {isSelected && (
        <>
          <line
            x1={noteRect.x}
            y1="0" 
            x2={noteRect.x} 
            y2={GRID_HEIGHT}
            stroke="#5070c0"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <line
            x1={noteRect.x + noteRect.width}
            y1="0" 
            x2={noteRect.x + noteRect.width} 
            y2={GRID_HEIGHT}
            stroke="#5070c0"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        </>
      )}
      
      {/* Highlight connected note edges */}
      {isConnectedLeft && (
        <rect
          x={noteRect.x - 2}
          y={noteRect.y}
          width={4}
          height={noteRect.height}
          fill="#00aa00"
          rx="2"
          ry="2"
        />
      )}
      
      {isConnectedRight && (
        <rect
          x={noteRect.x + noteRect.width - 2}
          y={noteRect.y}
          width={4}
          height={noteRect.height}
          fill="#00aa00"
          rx="2"
          ry="2"
        />
      )}
      
      {/* Note Rectangle */}
      <rect
        x={noteRect.x}
        y={noteRect.y}
        width={noteRect.width}
        height={noteRect.height}
        fill={isSelected ? "#7c93c0" : "#a0a0a0"}
        stroke={isSelected ? "#5070c0" : "#808080"}
        strokeWidth="1"
        rx="3"
        ry="3"
        style={{ cursor: getCursorStyle() }}
        onClick={handleNoteClick}
        onMouseDown={(e) => {
          if (editorMode === EDITOR_MODES.SELECT) {
            e.preventDefault();
            e.stopPropagation();
            handleDragStart(noteIndex, e.clientX, e.clientY);
          }
        }}
      />
      
      {/* Only show resize handles for selected note in select mode */}
      {isSelected && editorMode === EDITOR_MODES.SELECT && (
        <>
          {/* Left resize handle */}
          <rect
            x={noteRect.x - HANDLE_SIZE/2}
            y={noteRect.y + noteRect.height/2 - HANDLE_SIZE/2}
            width={HANDLE_SIZE}
            height={HANDLE_SIZE}
            fill="#5070c0"
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: 'ew-resize' }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleResizeStart(noteIndex, 'left', e.clientX, e.clientY);
            }}
          />
          
          {/* Right resize handle */}
          <rect
            x={noteRect.x + noteRect.width - HANDLE_SIZE/2}
            y={noteRect.y + noteRect.height/2 - HANDLE_SIZE/2}
            width={HANDLE_SIZE}
            height={HANDLE_SIZE}
            fill="#5070c0"
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: 'ew-resize' }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleResizeStart(noteIndex, 'right', e.clientX, e.clientY);
            }}
          />
        </>
      )}
      
      {/* Control Points */}
      {isSelected && (
        <ControlPoints noteIndex={noteIndex} pitchPoints={pitchPoints} />
      )}
      
      {/* Bezier curve */}
      <BezierCurve pitchPoints={pitchPoints} />
    </>
  );
};

export default Note;