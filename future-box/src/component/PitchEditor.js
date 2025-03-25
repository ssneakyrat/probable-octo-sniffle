import React, { useState, useRef, useEffect } from 'react';
import './PitchEditor.css';

/**
 * PitchEditor - A component for editing pitch curves similar to UTAU software
 * Features:
 * - Piano keyboard visualization
 * - Grid-based note placement
 * - Multiple operation modes (select, draw, delete)
 * - Bezier curve-based pitch editing
 * - Support for connected notes with smooth transitions
 */
const PitchEditor = () => {
  // Constants for grid dimensions
  const PIANO_KEY_WIDTH = 50;
  const GRID_HEIGHT = 400;
  const GRID_WIDTH = 600;
  const MIN_NOTE_WIDTH = 80;
  const NOTE_HEIGHT = 20;
  const GRID_LINES = 24; // Number of horizontal grid lines (2 octaves)
  const TIME_DIVISIONS = 16; // Number of vertical grid lines
  
  // Calculate grid cell dimensions for snapping
  const HORIZONTAL_SNAP = GRID_HEIGHT / GRID_LINES;
  const VERTICAL_SNAP = (GRID_WIDTH - PIANO_KEY_WIDTH) / TIME_DIVISIONS;
  
  // Editor mode state
  const [editorMode, setEditorMode] = useState('select'); // 'select', 'draw', 'delete'
  
  // State for multiple notes and their pitch points
  const [notes, setNotes] = useState([]);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);
  
  // State for tracking active interactions
  const [activePoint, setActivePoint] = useState(null);
  const [noteDragState, setNoteDragState] = useState(null); // null, 'dragging', 'resizing-left', 'resizing-right'
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [initialRect, setInitialRect] = useState(null);
  const [initialPoints, setInitialPoints] = useState(null);
  
  const svgRef = useRef(null);
  
  // Piano keys layout (C4 to B5 - two octaves)
  const pianoKeys = [
    { note: 'B5', white: true },
    { note: 'A#5', white: false },
    { note: 'A5', white: true },
    { note: 'G#5', white: false },
    { note: 'G5', white: true },
    { note: 'F#5', white: false },
    { note: 'F5', white: true },
    { note: 'E5', white: true },
    { note: 'D#5', white: false },
    { note: 'D5', white: true },
    { note: 'C#5', white: false },
    { note: 'C5', white: true },
    { note: 'B4', white: true },
    { note: 'A#4', white: false },
    { note: 'A4', white: true },
    { note: 'G#4', white: false },
    { note: 'G4', white: true },
    { note: 'F#4', white: false },
    { note: 'F4', white: true },
    { note: 'E4', white: true },
    { note: 'D#4', white: false },
    { note: 'D4', white: true },
    { note: 'C#4', white: false },
    { note: 'C4', white: true },
  ];
  
  // Function to check if two notes are adjacent (connected)
  const areNotesConnected = (note1, note2) => {
    // Notes are connected if the right edge of note1 is at the same position as the left edge of note2
    // Allow for a small tolerance (1 pixel) to handle floating-point precision issues
    const tolerance = 1;
    return Math.abs((note1.rect.x + note1.rect.width) - note2.rect.x) <= tolerance;
  };
  
  // Function to update connections between notes
  const updateNoteConnections = (notesArray) => {
    // Sort notes by x position to find adjacent notes easily
    const sortedNotes = [...notesArray].sort((a, b) => a.rect.x - b.rect.x);
    
    // Look for adjacent notes and update their pitch points
    for (let i = 0; i < sortedNotes.length - 1; i++) {
      const currentNote = sortedNotes[i];
      const nextNote = sortedNotes[i + 1];
      
      if (areNotesConnected(currentNote, nextNote)) {
        // Notes are connected - ensure pitch lines connect smoothly
        
        // Get the last point of the current note and the first point of the next note
        const currentLastPoint = currentNote.pitchPoints[currentNote.pitchPoints.length - 1];
        const nextFirstPoint = nextNote.pitchPoints[0];
        
        // Make their y-coordinates match by using the average of their positions
        const avgY = (currentLastPoint.y + nextFirstPoint.y) / 2;
        
        // Update both points to this position
        currentLastPoint.y = avgY;
        nextFirstPoint.y = avgY;
        
        // Update their y-offsets relative to their notes
        currentLastPoint.yOffset = avgY - (currentNote.rect.y + currentNote.rect.height / 2);
        nextFirstPoint.yOffset = avgY - (nextNote.rect.y + nextNote.rect.height / 2);
        
        // Update the control points to create a smooth transition
        // For the last point of current note, control point should extend toward next note
        if (currentLastPoint.cp1x !== undefined) {
          currentLastPoint.cp1x = currentLastPoint.x + 20;
          currentLastPoint.cp1y = avgY;
          currentLastPoint.cp1yOffset = currentLastPoint.yOffset;
        }
        
        // For the first point of next note, control point should extend toward the current note
        if (nextFirstPoint.cp2x !== undefined) {
          nextFirstPoint.cp2x = nextFirstPoint.x - 20;
          nextFirstPoint.cp2y = avgY;
          nextFirstPoint.cp2yOffset = nextFirstPoint.yOffset;
        }
      }
    }
    
    // Return the updated notes
    return sortedNotes;
  };
  
  // Utility function to snap a value to the nearest grid position
  const snapToGrid = (value, gridSize) => {
    return Math.round(value / gridSize) * gridSize;
  };
  
  // Create initial pitch points for a new note
  const createInitialPitchPoints = (noteRect) => {
    const noteMiddleY = noteRect.y + noteRect.height / 2;
    
    return [
      { 
        x: noteRect.x, 
        y: noteMiddleY,
        cp1x: noteRect.x + 20,
        cp1y: noteMiddleY,
        yOffset: 0,
        cp1yOffset: 0
      },
      { 
        x: noteRect.x + noteRect.width, 
        y: noteMiddleY,
        cp2x: noteRect.x + noteRect.width - 20,
        cp2y: noteMiddleY,
        yOffset: 0,
        cp2yOffset: 0
      }
    ];
  };
  
  // Function to create a new note
  const createNewNote = (x, y) => {
    // Snap to grid
    const snappedX = snapToGrid(x - PIANO_KEY_WIDTH, VERTICAL_SNAP) + PIANO_KEY_WIDTH;
    const snappedY = snapToGrid(y, HORIZONTAL_SNAP);
    
    // Create a new note rectangle
    const noteRect = {
      x: Math.max(PIANO_KEY_WIDTH, snappedX - MIN_NOTE_WIDTH / 2),
      y: Math.max(0, Math.min(GRID_HEIGHT - NOTE_HEIGHT, snappedY - NOTE_HEIGHT / 2)),
      width: MIN_NOTE_WIDTH,
      height: NOTE_HEIGHT
    };
    
    // Ensure note is fully within grid
    if (noteRect.x + noteRect.width > GRID_WIDTH) {
      noteRect.x = GRID_WIDTH - noteRect.width;
    }
    
    // Create initial pitch points
    const pitchPoints = createInitialPitchPoints(noteRect);
    
    // Add new note to the notes array
    setNotes(prevNotes => {
      const newNotes = [...prevNotes, { rect: noteRect, pitchPoints }];
      
      // Update connections after adding the note
      return updateNoteConnections(newNotes);
    });
    
    // Select the newly created note
    setSelectedNoteIndex(notes.length);
  };
  
  // Handle click on grid to create a new note in draw mode
  const handleGridClick = (e) => {
    if (editorMode !== 'draw') return;
    
    const svgRect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    
    // Only create notes within the grid area
    if (x > PIANO_KEY_WIDTH && x < GRID_WIDTH && y > 0 && y < GRID_HEIGHT) {
      createNewNote(x, y);
    }
  };
  
  // Handle click on note in select or delete mode
  const handleNoteClick = (index, e) => {
    e.stopPropagation();
    
    if (editorMode === 'delete') {
      // Delete note
      setNotes(prevNotes => {
        const updatedNotes = prevNotes.filter((_, i) => i !== index);
        return updateNoteConnections(updatedNotes);
      });
      
      if (selectedNoteIndex === index) {
        setSelectedNoteIndex(null);
      } else if (selectedNoteIndex > index) {
        setSelectedNoteIndex(prev => prev - 1);
      }
    } else if (editorMode === 'select') {
      // Select note
      setSelectedNoteIndex(index);
    }
  };
  
  // Handle mouse down on anchor points
  const handleAnchorMouseDown = (noteIndex, pointIndex, e) => {
    if (editorMode !== 'select') return;
    
    e.preventDefault();
    e.stopPropagation();
    setSelectedNoteIndex(noteIndex);
    setActivePoint({ noteIndex, type: 'anchor', index: pointIndex });
  };
  
  // Handle mouse down on control points
  const handleControlMouseDown = (noteIndex, pointIndex, controlType, e) => {
    if (editorMode !== 'select') return;
    
    e.preventDefault();
    e.stopPropagation();
    setSelectedNoteIndex(noteIndex);
    setActivePoint({ noteIndex, type: controlType, index: pointIndex });
  };
  
  // Handle mouse down on note for dragging
  const handleNoteDragStart = (noteIndex, e) => {
    if (editorMode !== 'select') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const svgRect = svgRef.current.getBoundingClientRect();
    setSelectedNoteIndex(noteIndex);
    setDragStartPos({ 
      x: e.clientX - svgRect.left, 
      y: e.clientY - svgRect.top 
    });
    setInitialRect({ ...notes[noteIndex].rect });
    setInitialPoints([...notes[noteIndex].pitchPoints]);
    setNoteDragState('dragging');
  };
  
  // Handle mouse down on resize handles
  const handleNoteResizeStart = (noteIndex, side, e) => {
    if (editorMode !== 'select') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const svgRect = svgRef.current.getBoundingClientRect();
    setSelectedNoteIndex(noteIndex);
    setDragStartPos({ 
      x: e.clientX - svgRect.left, 
      y: e.clientY - svgRect.top 
    });
    setInitialRect({ ...notes[noteIndex].rect });
    setInitialPoints([...notes[noteIndex].pitchPoints]);
    setNoteDragState(side === 'left' ? 'resizing-left' : 'resizing-right');
  };
  
  // Adjust pitch points when note is moved or resized
  const adjustPitchPoints = (newRect, oldRect, initialPoints) => {
    // Calculate the new middle Y position
    const newMiddleY = newRect.y + newRect.height / 2;
    
    return initialPoints.map((point, index) => {
      const isFirstPoint = index === 0;
      const isLastPoint = index === initialPoints.length - 1;
      
      // Calculate relative position within the old note (horizontally)
      const relativeX = isFirstPoint ? 0 : 
                        isLastPoint ? 1 : 
                        (point.x - oldRect.x) / oldRect.width;
                        
      // Calculate new X position based on the updated note
      const newX = newRect.x + (relativeX * newRect.width);
      
      // Calculate new Y positions using offsets from the note's middle
      const newY = newMiddleY + (point.yOffset || 0);
      
      // Create new point with updated coordinates
      const newPoint = { 
        ...point, 
        x: newX,
        y: newY
      };
      
      // Adjust control points
      if (point.cp1x !== undefined) {
        const cp1RelativeX = (point.cp1x - oldRect.x) / oldRect.width;
        newPoint.cp1x = newRect.x + (cp1RelativeX * newRect.width);
        newPoint.cp1y = newMiddleY + (point.cp1yOffset || 0);
      }
      
      if (point.cp2x !== undefined) {
        const cp2RelativeX = (point.cp2x - oldRect.x) / oldRect.width;
        newPoint.cp2x = newRect.x + (cp2RelativeX * newRect.width);
        newPoint.cp2y = newMiddleY + (point.cp2yOffset || 0);
      }
      
      return newPoint;
    });
  };
  
  // Update Y offset values when pitch points are moved
  const updateYOffsets = (points, noteRect) => {
    const middleY = noteRect.y + noteRect.height / 2;
    
    return points.map(point => {
      const newPoint = { ...point };
      
      // Calculate vertical offsets from note middle
      newPoint.yOffset = point.y - middleY;
      
      if (point.cp1y !== undefined) {
        newPoint.cp1yOffset = point.cp1y - middleY;
      }
      
      if (point.cp2y !== undefined) {
        newPoint.cp2yOffset = point.cp2y - middleY;
      }
      
      return newPoint;
    });
  };
  
  // Add a pitch point in the middle of the note (helper function)
  const addMiddlePoint = (noteIndex) => {
    if (noteIndex === null || noteIndex >= notes.length) return;
    
    setNotes(prevNotes => {
      // Safety check
      if (noteIndex >= prevNotes.length) return prevNotes;
      
      const newNotes = [...prevNotes];
      const note = newNotes[noteIndex];
      
      // Make sure note and pitchPoints exist
      if (!note || !note.pitchPoints) return prevNotes;
      
      const points = [...note.pitchPoints];
      
      // Only add if we have less than 5 points (to prevent overcrowding)
      if (points.length < 5) {
        // Find the middle position
        const middleX = note.rect.x + note.rect.width / 2;
        const middleY = note.rect.y + note.rect.height / 2;
        
        // Create a new point
        const newPoint = {
          x: middleX,
          y: middleY,
          cp1x: middleX + 20,
          cp1y: middleY,
          cp2x: middleX - 20,
          cp2y: middleY,
          yOffset: 0,
          cp1yOffset: 0,
          cp2yOffset: 0
        };
        
        // Find where to insert the new point - between existing points
        // Default to inserting after the first point
        let insertIndex = 1;
        
        // Make sure we have at least 2 points before doing the insertion logic
        if (points.length >= 2) {
          // Find the appropriate insertion point based on x-coordinate
          for (let i = 0; i < points.length - 1; i++) {
            if (points[i].x <= middleX && middleX <= points[i+1].x) {
              insertIndex = i + 1;
              break;
            }
          }
          
          // Insert the new point
          points.splice(insertIndex, 0, newPoint);
          
          // Update the note with the new point
          newNotes[noteIndex].pitchPoints = updateYOffsets(points, note.rect);
          
          return updateNoteConnections(newNotes); // Update connections after adding a point
        }
      }
      
      return prevNotes;
    });
  };
  
  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      const svgRect = svgRef.current.getBoundingClientRect();
      const currentX = e.clientX - svgRect.left;
      const currentY = e.clientY - svgRect.top;
      
      // Only proceed if in select mode and a note is selected
      if (editorMode !== 'select' || selectedNoteIndex === null) return;
      
      // Case 1: Dragging pitch points
      if (activePoint) {
        const { noteIndex, type, index } = activePoint;
        const x = currentX;
        const y = currentY;
        
        // Keep y within grid
        const newY = Math.max(0, Math.min(GRID_HEIGHT, y));
        
        setNotes(prevNotes => {
          const newNotes = [...prevNotes];
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
        
        // Snap to grid
        newX = snapToGrid(newX - PIANO_KEY_WIDTH, VERTICAL_SNAP) + PIANO_KEY_WIDTH;
        newY = snapToGrid(newY, HORIZONTAL_SNAP);
        
        // Constrain to grid boundaries
        newX = Math.max(PIANO_KEY_WIDTH, newX);
        newX = Math.min(GRID_WIDTH - initialRect.width, newX);
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
        
        // Snap to grid
        newX = snapToGrid(newX - PIANO_KEY_WIDTH, VERTICAL_SNAP) + PIANO_KEY_WIDTH;
        
        let newWidth = initialRect.x + initialRect.width - newX;
        
        // Enforce minimum width and grid boundaries
        newX = Math.min(newX, initialRect.x + initialRect.width - MIN_NOTE_WIDTH);
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
        
        // Snap to grid
        const rightEdge = initialRect.x + newWidth;
        const snappedRightEdge = snapToGrid(rightEdge - PIANO_KEY_WIDTH, VERTICAL_SNAP) + PIANO_KEY_WIDTH;
        newWidth = snappedRightEdge - initialRect.x;
        
        // Enforce minimum width and grid boundaries
        newWidth = Math.max(MIN_NOTE_WIDTH, newWidth);
        newWidth = Math.min(GRID_WIDTH - initialRect.x, newWidth);
        
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
      setActivePoint(null);
      setNoteDragState(null);
      setInitialRect(null);
      setInitialPoints(null);
    };
    
    if (activePoint || noteDragState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activePoint, noteDragState, dragStartPos, initialRect, initialPoints, selectedNoteIndex, editorMode]);
  
  // Generate path string for the Bezier pitch curve
  const generateBezierPath = (pitchPoints) => {
    if (!pitchPoints || pitchPoints.length < 2) return '';
    
    let path = `M ${pitchPoints[0].x},${pitchPoints[0].y}`;
    
    for (let i = 0; i < pitchPoints.length - 1; i++) {
      const p1 = pitchPoints[i];
      const p2 = pitchPoints[i + 1];
      
      const cp1x = p1.cp1x !== undefined ? p1.cp1x : p1.x + 20;
      const cp1y = p1.cp1y !== undefined ? p1.cp1y : p1.y;
      const cp2x = p2.cp2x !== undefined ? p2.cp2x : p2.x - 20;
      const cp2y = p2.cp2y !== undefined ? p2.cp2y : p2.y;
      
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    
    return path;
  };
  
  // Delete a control point from a note
  const deleteControlPoint = (noteIndex, pointIndex) => {
    if (noteIndex === null || !notes[noteIndex]) return;
    
    setNotes(prevNotes => {
      const newNotes = [...prevNotes];
      const note = newNotes[noteIndex];
      
      if (!note || !note.pitchPoints) return prevNotes;
      
      const points = [...note.pitchPoints];
      
      // Can't delete first or last point (these are anchored to note boundaries)
      if (pointIndex === 0 || pointIndex === points.length - 1) {
        return prevNotes;
      }
      
      // Need to keep at least 2 points (start and end)
      if (points.length <= 2) {
        return prevNotes;
      }
      
      // Remove the point
      points.splice(pointIndex, 1);
      newNotes[noteIndex].pitchPoints = points;
      
      // Update connections after deleting a point
      return updateNoteConnections(newNotes);
    });
  };
  
  // Function to handle keyboard events for deleting points
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete key pressed while a control point is active
      if ((e.key === 'Delete' || e.key === 'Backspace') && 
          activePoint && 
          editorMode === 'select') {
        const { noteIndex, type, index } = activePoint;
        
        // Only delete anchor points (not control handles)
        if (type === 'anchor' && 
            noteIndex !== null && 
            index > 0 && 
            notes[noteIndex] && 
            index < notes[noteIndex].pitchPoints.length - 1) {
          deleteControlPoint(noteIndex, index);
          setActivePoint(null);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePoint, editorMode, notes]);
  
  // Function to find connected notes
  const findConnectedNotes = () => {
    const connections = [];
    // Sort notes by x position
    const sortedNotes = [...notes].sort((a, b) => a.rect.x - b.rect.x);
    
    // Check each pair of adjacent notes
    for (let i = 0; i < sortedNotes.length - 1; i++) {
      const currentNote = sortedNotes[i];
      const nextNote = sortedNotes[i + 1];
      
      if (areNotesConnected(currentNote, nextNote)) {
        // Find indices in the original notes array
        const currentIdx = notes.findIndex(n => n === currentNote);
        const nextIdx = notes.findIndex(n => n === nextNote);
        
        connections.push({
          from: currentIdx,
          to: nextIdx,
          x: currentNote.rect.x + currentNote.rect.width, // Connection point x (right edge of current note)
          // Use the average y of the connecting points
          y: (currentNote.pitchPoints[currentNote.pitchPoints.length - 1].y + 
              nextNote.pitchPoints[0].y) / 2
        });
      }
    }
    
    return connections;
  };
  
  // Resize handles size
  const handleSize = 8;
  
  // Get cursor style based on mode
  const getCursorStyle = () => {
    switch (editorMode) {
      case 'draw': return 'crosshair';
      case 'delete': return 'not-allowed';
      default: return 'default';
    }
  };
  
  // Add sample notes for the preview
  useEffect(() => {
    // Add demo notes when component mounts
    if (notes.length === 0) {
      const demoNotes = [];
      
      // First demo note
      const demoNote1Rect = {
        x: PIANO_KEY_WIDTH + VERTICAL_SNAP * 3,
        y: HORIZONTAL_SNAP * 12,
        width: VERTICAL_SNAP * 4,
        height: NOTE_HEIGHT
      };
      
      const pitchPoints1 = createInitialPitchPoints(demoNote1Rect);
      
      // Add a bend in the pitch
      if (pitchPoints1.length >= 2) {
        pitchPoints1[0].y = demoNote1Rect.y + demoNote1Rect.height / 2 + HORIZONTAL_SNAP;
        pitchPoints1[0].cp1y = demoNote1Rect.y + demoNote1Rect.height / 2 + HORIZONTAL_SNAP;
        
        // Update offsets
        pitchPoints1[0].yOffset = HORIZONTAL_SNAP;
        pitchPoints1[0].cp1yOffset = HORIZONTAL_SNAP;
      }
      
      // Add a middle point to make the demo more interesting
      const middleX = demoNote1Rect.x + demoNote1Rect.width / 2;
      const middleY = demoNote1Rect.y + demoNote1Rect.height / 2 - HORIZONTAL_SNAP/2;
      
      pitchPoints1.splice(1, 0, {
        x: middleX,
        y: middleY,
        cp1x: middleX + 15,
        cp1y: middleY - 5,
        cp2x: middleX - 15,
        cp2y: middleY - 5,
        yOffset: -HORIZONTAL_SNAP/2,
        cp1yOffset: -HORIZONTAL_SNAP/2 - 5,
        cp2yOffset: -HORIZONTAL_SNAP/2 - 5
      });
      
      demoNotes.push({ rect: demoNote1Rect, pitchPoints: pitchPoints1 });
      
      // Second demo note (connected to the first)
      const demoNote2Rect = {
        x: demoNote1Rect.x + demoNote1Rect.width, // Place right next to first note (connected)
        y: HORIZONTAL_SNAP * 10, // Different pitch
        width: VERTICAL_SNAP * 3,
        height: NOTE_HEIGHT
      };
      
      const pitchPoints2 = createInitialPitchPoints(demoNote2Rect);
      demoNotes.push({ rect: demoNote2Rect, pitchPoints: pitchPoints2 });
      
      // Third demo note (not connected)
      const demoNote3Rect = {
        x: demoNote2Rect.x + demoNote2Rect.width + VERTICAL_SNAP, // Gap between notes
        y: HORIZONTAL_SNAP * 8, // Different pitch
        width: VERTICAL_SNAP * 3,
        height: NOTE_HEIGHT
      };
      
      const pitchPoints3 = createInitialPitchPoints(demoNote3Rect);
      demoNotes.push({ rect: demoNote3Rect, pitchPoints: pitchPoints3 });
      
      // Set the notes and update connections
      setNotes(updateNoteConnections(demoNotes));
    }
  }, []);
  
  // Find any connected notes for highlighting
  const connectedNotes = findConnectedNotes();
  
  return (
    <div className="pitch-editor-container">
      <h2 className="pitch-editor-title">UTAU-like Pitch Editor with Connected Notes</h2>
      
      {/* Mode selection toolbar */}
      <div className="editor-toolbar">
        <button 
          className={`editor-button ${editorMode === 'select' ? 'active' : ''}`}
          onClick={() => setEditorMode('select')}
        >
          Select Mode
        </button>
        <button 
          className={`editor-button ${editorMode === 'draw' ? 'active' : ''}`}
          onClick={() => setEditorMode('draw')}
        >
          Draw Mode
        </button>
        <button 
          className={`editor-button ${editorMode === 'delete' ? 'active' : ''}`}
          onClick={() => setEditorMode('delete')}
        >
          Delete Mode
        </button>
      </div>
      
      {/* Additional controls when a note is selected */}
      {selectedNoteIndex !== null && editorMode === 'select' && (
        <div className="editor-controls">
          <button 
            className="add-point-button"
            onClick={() => {
              if (selectedNoteIndex !== null && selectedNoteIndex < notes.length) {
                addMiddlePoint(selectedNoteIndex);
              }
            }}
          >
            Add Control Point
          </button>
          {selectedNoteIndex !== null && notes[selectedNoteIndex] && activePoint && 
           activePoint.type === 'anchor' && 
           activePoint.index > 0 && 
           activePoint.index < notes[selectedNoteIndex].pitchPoints.length - 1 && (
            <button 
              className="delete-point-button"
              onClick={() => deleteControlPoint(activePoint.noteIndex, activePoint.index)}
            >
              Delete Selected Point
            </button>
          )}
        </div>
      )}
      
      <div className="editor-grid-container">
        <svg 
          ref={svgRef}
          width={GRID_WIDTH + 10} 
          height={GRID_HEIGHT + 10}
          className="editor-svg"
          style={{ cursor: getCursorStyle() }}
          onClick={handleGridClick}
        >
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
          
          {/* Piano keys */}
          {pianoKeys.map((key, i) => (
            <React.Fragment key={`key-${i}`}>
              <rect 
                x="0" 
                y={i * (GRID_HEIGHT / pianoKeys.length)} 
                width={PIANO_KEY_WIDTH} 
                height={GRID_HEIGHT / pianoKeys.length}
                fill={key.white ? "white" : "black"}
                stroke="#aaa"
                strokeWidth="1"
              />
              <text 
                x="5" 
                y={i * (GRID_HEIGHT / pianoKeys.length) + (GRID_HEIGHT / pianoKeys.length / 2)} 
                fill={key.white ? "black" : "white"} 
                fontSize="10"
                dominantBaseline="middle"
              >
                {key.note}
              </text>
            </React.Fragment>
          ))}
          
          {/* Render all notes */}
          {notes.map((note, noteIndex) => {
            const isSelected = noteIndex === selectedNoteIndex;
            const noteRect = note.rect;
            const pitchPoints = note.pitchPoints;
            const bezierPath = generateBezierPath(pitchPoints);
            
            // Check if this note is connected to another note
            const isConnectedLeft = connectedNotes.some(conn => conn.to === noteIndex);
            const isConnectedRight = connectedNotes.some(conn => conn.from === noteIndex);
            
            return (
              <React.Fragment key={`note-${noteIndex}`}>
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
                
                {/* Bezier control lines (only show when point is active and note is selected) */}
                {isSelected && pitchPoints.map((point, i) => (
                  <React.Fragment key={`control-lines-${noteIndex}-${i}`}>
                    {point.cp1x !== undefined && (
                      <line
                        x1={point.x}
                        y1={point.y}
                        x2={point.cp1x}
                        y2={point.cp1y}
                        stroke="#aaa"
                        strokeWidth="1"
                        strokeDasharray="5,5"
                        strokeOpacity={activePoint && activePoint.noteIndex === noteIndex && 
                          (activePoint.index === i || (i < pitchPoints.length - 1 && activePoint.index === i + 1)) ? "1" : "0"}
                      />
                    )}
                    {point.cp2x !== undefined && (
                      <line
                        x1={point.x}
                        y1={point.y}
                        x2={point.cp2x}
                        y2={point.cp2y}
                        stroke="#aaa"
                        strokeWidth="1"
                        strokeDasharray="5,5"
                        strokeOpacity={activePoint && activePoint.noteIndex === noteIndex && 
                          (activePoint.index === i || (i > 0 && activePoint.index === i - 1)) ? "1" : "0"}
                      />
                    )}
                  </React.Fragment>
                ))}
                
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
                  style={{ cursor: editorMode === 'select' ? 'move' : (editorMode === 'delete' ? 'not-allowed' : 'pointer') }}
                  onClick={(e) => handleNoteClick(noteIndex, e)}
                  onMouseDown={(e) => editorMode === 'select' && handleNoteDragStart(noteIndex, e)}
                />
                
                {/* Only show resize handles and control points for selected note in select mode */}
                {isSelected && editorMode === 'select' && (
                  <>
                    {/* Left resize handle */}
                    <rect
                      x={noteRect.x - handleSize/2}
                      y={noteRect.y + noteRect.height/2 - handleSize/2}
                      width={handleSize}
                      height={handleSize}
                      fill="#5070c0"
                      stroke="#fff"
                      strokeWidth="1"
                      style={{ cursor: 'ew-resize' }}
                      onMouseDown={(e) => handleNoteResizeStart(noteIndex, 'left', e)}
                    />
                    
                    {/* Right resize handle */}
                    <rect
                      x={noteRect.x + noteRect.width - handleSize/2}
                      y={noteRect.y + noteRect.height/2 - handleSize/2}
                      width={handleSize}
                      height={handleSize}
                      fill="#5070c0"
                      stroke="#fff"
                      strokeWidth="1"
                      style={{ cursor: 'ew-resize' }}
                      onMouseDown={(e) => handleNoteResizeStart(noteIndex, 'right', e)}
                    />
                    
                    {/* Control points */}
                    {pitchPoints.map((point, i) => (
                      <React.Fragment key={`points-${noteIndex}-${i}`}>
                        {/* Outgoing control point (CP1) */}
                        {point.cp1x !== undefined && (
                          <circle
                            cx={point.cp1x}
                            cy={point.cp1y}
                            r="4"
                            fill="#8bc34a"
                            stroke="#fff"
                            strokeWidth="1"
                            style={{ cursor: 'move' }}
                            onMouseDown={(e) => handleControlMouseDown(noteIndex, i, 'cp1', e)}
                            opacity={activePoint && activePoint.noteIndex === noteIndex && 
                              (activePoint.index === i || (i < pitchPoints.length - 1 && activePoint.index === i + 1)) ? "1" : "0.6"}
                          />
                        )}
                        
                        {/* Incoming control point (CP2) */}
                        {point.cp2x !== undefined && (
                          <circle
                            cx={point.cp2x}
                            cy={point.cp2y}
                            r="4"
                            fill="#03a9f4"
                            stroke="#fff"
                            strokeWidth="1"
                            style={{ cursor: 'move' }}
                            onMouseDown={(e) => handleControlMouseDown(noteIndex, i, 'cp2', e)}
                            opacity={activePoint && activePoint.noteIndex === noteIndex && 
                              (activePoint.index === i || (i > 0 && activePoint.index === i - 1)) ? "1" : "0.6"}
                          />
                        )}
                        
                        {/* Anchor point */}
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="6"
                          fill={activePoint && activePoint.noteIndex === noteIndex && 
                            activePoint.type === 'anchor' && activePoint.index === i ? "#ff0000" : "#ff6b6b"}
                          stroke="#fff"
                          strokeWidth="2"
                          style={{ cursor: 'move' }}
                          onMouseDown={(e) => handleAnchorMouseDown(noteIndex, i, e)}
                          onDoubleClick={() => {
                            // Double click to delete middle points
                            if (i > 0 && i < pitchPoints.length - 1) {
                              deleteControlPoint(noteIndex, i);
                            }
                          }}
                        />
                      </React.Fragment>
                    ))}
                  </>
                )}
                
                {/* Bezier curve pitch line - placed after notes so it appears on top */}
                <path
                  d={bezierPath}
                  stroke="#ff6b6b"
                  strokeWidth="2"
                  fill="none"
                />
              </React.Fragment>
            );
          })}
          
          {/* Connection indicators for pitch lines between notes */}
          {connectedNotes.map((conn, i) => (
            <circle
              key={`conn-${i}`}
              cx={conn.x}
              cy={conn.y}
              r="4"
              fill="#00cc00"
              stroke="#ffffff"
              strokeWidth="1"
            />
          ))}
          
          {/* Show snap grid indicators for selection mode */}
          {editorMode === 'select' && noteDragState && (
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
        </svg>
      </div>
      
      <div className="editor-instructions">
        <p>• <strong>Select Mode:</strong> Click on a note to select it. Drag to move, resize using handles.</p>
        <p>• <strong>Draw Mode:</strong> Click anywhere on the grid to create a new note (will snap to grid).</p>
        <p>• <strong>Delete Mode:</strong> Click on a note to delete it.</p>
        <p>• <strong>Connected Notes:</strong> When notes are placed adjacent to each other, their pitch lines will automatically connect smoothly.</p>
        <p>• Green indicators highlight where notes are connected.</p>
        <p>• For selected notes, you can add control points to create more complex pitch curves.</p>
        <p>• To delete a control point: double-click it, use Delete key when selected, or use the Delete button.</p>
        <p>• Modify the pitch by dragging the red anchor points and their control handles.</p>
      </div>
    </div>
  );
};

export default PitchEditor;