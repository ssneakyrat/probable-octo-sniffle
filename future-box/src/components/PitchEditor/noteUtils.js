import {
  PIANO_KEY_WIDTH,
  GRID_HEIGHT,
  GRID_WIDTH,
  EXTENDED_GRID_WIDTH,
  HORIZONTAL_SNAP,
  VERTICAL_SNAP,
  MIN_NOTE_WIDTH,
  NOTE_HEIGHT
} from './constants';

// Utility function to snap a value to the nearest grid position
export const snapToGrid = (value, gridSize) => {
  return Math.round(value / gridSize) * gridSize;
};

// Function to check if two notes are adjacent (connected)
export const areNotesConnected = (note1, note2) => {
  // Notes are connected if the right edge of note1 is at the same position as the left edge of note2
  // Allow for a small tolerance (1 pixel) to handle floating-point precision issues
  const tolerance = 1;
  return Math.abs((note1.rect.x + note1.rect.width) - note2.rect.x) <= tolerance;
};

// Create initial pitch points for a new note
export const createInitialPitchPoints = (noteRect) => {
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

// Update the createNewNote function to properly snap to the time signature grid
export const createNewNote = (x, y, verticalSnap = VERTICAL_SNAP) => {
  // Snap the grid position (after accounting for piano width and centering)
  const snappedX = PIANO_KEY_WIDTH + snapToGrid(x - PIANO_KEY_WIDTH - MIN_NOTE_WIDTH / 2, verticalSnap);
  const snappedY = snapToGrid(y - NOTE_HEIGHT / 2, HORIZONTAL_SNAP);
  
  // Create a note rectangle at the snapped position
  const noteRect = {
    x: Math.max(PIANO_KEY_WIDTH, snappedX),
    y: Math.max(0, Math.min(GRID_HEIGHT - NOTE_HEIGHT, snappedY)),
    width: MIN_NOTE_WIDTH,
    height: NOTE_HEIGHT
  };
  
  // Ensure note is fully within grid
  if (noteRect.x + noteRect.width > GRID_WIDTH) {
    noteRect.x = GRID_WIDTH - noteRect.width;
  }
  
  // Create initial pitch points
  const pitchPoints = createInitialPitchPoints(noteRect);
  
  return { rect: noteRect, pitchPoints };
};

// Function to update connections between notes
export const updateNoteConnections = (notesArray) => {
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
        currentLastPoint.cp1yOffset = currentLastPoint.cp1yOffset;
      }
      
      // For the first point of next note, control point should extend toward the current note
      if (nextFirstPoint.cp2x !== undefined) {
        nextFirstPoint.cp2x = nextFirstPoint.x - 20;
        nextFirstPoint.cp2y = avgY;
        nextFirstPoint.cp2yOffset = nextFirstPoint.cp2yOffset;
      }
    }
  }
  
  // Return the updated notes
  return sortedNotes;
};

// Update Y offset values when pitch points are moved
export const updateYOffsets = (points, noteRect) => {
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

// Adjust pitch points when note is moved or resized
export const adjustPitchPoints = (newRect, oldRect, initialPoints) => {
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

// Function to find connected notes
export const findConnectedNotes = (notes) => {
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

// Create demo notes for initial display
export const createDemoNotes = () => {
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
  
  return updateNoteConnections(demoNotes);
};