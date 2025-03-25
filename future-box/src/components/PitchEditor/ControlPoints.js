import React from 'react';
import { useEditor } from './EditorContext';
import { EDITOR_MODES } from './constants';

const ControlPoints = ({ noteIndex, pitchPoints }) => {
  const { 
    editorMode, 
    activePoint, 
    handleAnchorInteraction, 
    handleControlInteraction,
    handleDeleteControlPoint
  } = useEditor();
  
  // Only show control points for select mode
  if (editorMode !== EDITOR_MODES.SELECT) {
    return null;
  }
  
  return (
    <>
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
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleControlInteraction(noteIndex, i, 'cp1');
              }}
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
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleControlInteraction(noteIndex, i, 'cp2');
              }}
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
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAnchorInteraction(noteIndex, i);
            }}
            onDoubleClick={() => {
              // Double click to delete middle points
              if (i > 0 && i < pitchPoints.length - 1) {
                handleDeleteControlPoint(noteIndex, i);
              }
            }}
          />
          
          {/* Control lines - only show when active */}
          {activePoint && activePoint.noteIndex === noteIndex && (
            <>
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
            </>
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export default ControlPoints;