import React from 'react';
import { useEditor } from './EditorContext';
import { findConnectedNotes } from './noteUtils';

const ConnectionIndicator = () => {
  const { notes } = useEditor();
  
  // Find all connected notes
  const connectedNotes = findConnectedNotes(notes);
  
  return (
    <>
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
    </>
  );
};

export default ConnectionIndicator;