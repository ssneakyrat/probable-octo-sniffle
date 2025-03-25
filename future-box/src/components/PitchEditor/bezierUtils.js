// Generate path string for the Bezier pitch curve
export const generateBezierPath = (pitchPoints) => {
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

// Add a pitch point in the middle of the note
export const addMiddlePoint = (note) => {
  if (!note || !note.pitchPoints) return note;
  
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
      
      return {
        ...note,
        pitchPoints: points
      };
    }
  }
  
  return note;
};

// Delete a control point from a note
export const deleteControlPoint = (note, pointIndex) => {
  if (!note || !note.pitchPoints) return note;
  
  const points = [...note.pitchPoints];
  
  // Can't delete first or last point (these are anchored to note boundaries)
  if (pointIndex === 0 || pointIndex === points.length - 1) {
    return note;
  }
  
  // Need to keep at least 2 points (start and end)
  if (points.length <= 2) {
    return note;
  }
  
  // Remove the point
  points.splice(pointIndex, 1);
  
  return {
    ...note,
    pitchPoints: points
  };
};