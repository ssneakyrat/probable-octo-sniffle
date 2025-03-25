import React, { createContext, useContext, useState, useEffect } from 'react';
import { EDITOR_MODES, DRAG_STATES } from './constants';
import { 
  createNewNote, 
  updateNoteConnections, 
  updateYOffsets, 
  adjustPitchPoints, 
  createDemoNotes 
} from './noteUtils';
import { addMiddlePoint, deleteControlPoint } from './bezierUtils';

// Create context
export const EditorContext = createContext();

// Custom hook to use the editor context
export const useEditor = () => useContext(EditorContext);

// Provider component
export const EditorProvider = ({ children }) => {
  // Editor mode state
  const [editorMode, setEditorMode] = useState(EDITOR_MODES.SELECT);
  
  // State for multiple notes and their pitch points
  const [notes, setNotes] = useState([]);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);
  
  // State for tracking active interactions
  const [activePoint, setActivePoint] = useState(null);
  const [noteDragState, setNoteDragState] = useState(DRAG_STATES.NONE);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [initialRect, setInitialRect] = useState(null);
  const [initialPoints, setInitialPoints] = useState(null);
  
  // SVG ref will be set by the main component
  const [svgRef, setSvgRef] = useState(null);
  
  // Initialize with demo notes
  useEffect(() => {
    if (notes.length === 0) {
      setNotes(createDemoNotes());
    }
  }, []);
  
  // Handler for creating a new note
  const handleCreateNote = (x, y) => {
    const newNote = createNewNote(x, y);
    
    setNotes(prevNotes => {
      const newNotes = [...prevNotes, newNote];
      return updateNoteConnections(newNotes);
    });
    
    // Select the newly created note
    setSelectedNoteIndex(notes.length);
  };
  
  // Handler for selecting a note
  const handleSelectNote = (index) => {
    setSelectedNoteIndex(index);
  };
  
  // Handler for deleting a note
  const handleDeleteNote = (index) => {
    setNotes(prevNotes => {
      const updatedNotes = prevNotes.filter((_, i) => i !== index);
      return updateNoteConnections(updatedNotes);
    });
    
    if (selectedNoteIndex === index) {
      setSelectedNoteIndex(null);
    } else if (selectedNoteIndex > index) {
      setSelectedNoteIndex(prev => prev - 1);
    }
  };
  
  // Handler for starting drag operations
  const handleDragStart = (noteIndex, clientX, clientY) => {
    if (!svgRef) return;
    
    const svgRect = svgRef.getBoundingClientRect();
    
    setSelectedNoteIndex(noteIndex);
    setDragStartPos({ 
      x: clientX - svgRect.left, 
      y: clientY - svgRect.top 
    });
    setInitialRect({ ...notes[noteIndex].rect });
    setInitialPoints([...notes[noteIndex].pitchPoints]);
    setNoteDragState(DRAG_STATES.DRAGGING);
  };
  
  // Handler for starting resize operations
  const handleResizeStart = (noteIndex, side, clientX, clientY) => {
    if (!svgRef) return;
    
    const svgRect = svgRef.getBoundingClientRect();
    
    setSelectedNoteIndex(noteIndex);
    setDragStartPos({ 
      x: clientX - svgRect.left, 
      y: clientY - svgRect.top 
    });
    setInitialRect({ ...notes[noteIndex].rect });
    setInitialPoints([...notes[noteIndex].pitchPoints]);
    setNoteDragState(side === 'left' ? DRAG_STATES.RESIZING_LEFT : DRAG_STATES.RESIZING_RIGHT);
  };
  
  // Handler for anchor point interaction
  const handleAnchorInteraction = (noteIndex, pointIndex) => {
    setSelectedNoteIndex(noteIndex);
    setActivePoint({ noteIndex, type: 'anchor', index: pointIndex });
  };
  
  // Handler for control point interaction
  const handleControlInteraction = (noteIndex, pointIndex, controlType) => {
    setSelectedNoteIndex(noteIndex);
    setActivePoint({ noteIndex, type: controlType, index: pointIndex });
  };
  
  // Handler for adding a middle point
  const handleAddMiddlePoint = () => {
    if (selectedNoteIndex === null || selectedNoteIndex >= notes.length) return;
    
    setNotes(prevNotes => {
      const newNotes = [...prevNotes];
      const updatedNote = addMiddlePoint(newNotes[selectedNoteIndex]);
      
      if (updatedNote !== newNotes[selectedNoteIndex]) {
        newNotes[selectedNoteIndex] = updatedNote;
        return updateNoteConnections(newNotes);
      }
      
      return prevNotes;
    });
  };
  
  // Handler for deleting a control point
  const handleDeleteControlPoint = (noteIndex, pointIndex) => {
    if (noteIndex === null || noteIndex >= notes.length) return;
    
    setNotes(prevNotes => {
      const newNotes = [...prevNotes];
      const updatedNote = deleteControlPoint(newNotes[noteIndex], pointIndex);
      
      if (updatedNote !== newNotes[noteIndex]) {
        newNotes[noteIndex] = updatedNote;
        return updateNoteConnections(newNotes);
      }
      
      return prevNotes;
    });
    
    if (activePoint && activePoint.noteIndex === noteIndex && activePoint.index === pointIndex) {
      setActivePoint(null);
    }
  };
  
  // Reset drag state
  const resetDragState = () => {
    setActivePoint(null);
    setNoteDragState(DRAG_STATES.NONE);
    setInitialRect(null);
    setInitialPoints(null);
  };
  
  // Update note during drag/resize
  const updateNotePosition = (currentX, currentY) => {
    // Only implemented in the main component with the useEffect for mouse move events
  };
  
  return (
    <EditorContext.Provider value={{
      // State
      editorMode,
      setEditorMode,
      notes,
      setNotes,
      selectedNoteIndex,
      setSelectedNoteIndex,
      activePoint,
      setActivePoint,
      noteDragState,
      setNoteDragState,
      dragStartPos,
      setDragStartPos,
      initialRect,
      setInitialRect,
      initialPoints,
      setInitialPoints,
      svgRef,
      setSvgRef,
      
      // Actions
      handleCreateNote,
      handleSelectNote,
      handleDeleteNote,
      handleDragStart,
      handleResizeStart,
      handleAnchorInteraction,
      handleControlInteraction,
      handleAddMiddlePoint,
      handleDeleteControlPoint,
      resetDragState,
      updateNotePosition,
      
      // Utility functions passed through for components
      updateNoteConnections,
      updateYOffsets,
      adjustPitchPoints
    }}>
      {children}
    </EditorContext.Provider>
  );
};