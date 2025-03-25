import React from 'react';
import { useEditor } from './EditorContext';
import { PIANO_KEY_WIDTH, GRID_WIDTH } from './constants';

const BarMeasures = () => {
  const { timeSignature, calculateTimeDivisions } = useEditor();
  
  const divisions = calculateTimeDivisions();
  const beatsPerMeasure = timeSignature.numerator;
  const measuresCount = Math.ceil(divisions / beatsPerMeasure);
  
  return (
    <>
      {/* Bar Measure Background */}
      <rect 
        x={PIANO_KEY_WIDTH} 
        y="-20" 
        width={GRID_WIDTH - PIANO_KEY_WIDTH} 
        height="20" 
        fill="#e8e8e8" 
      />
      
      {/* Time Signature Display */}
      <text
        x={PIANO_KEY_WIDTH / 2}
        y="-7"
        textAnchor="middle"
        fill="#333"
        fontSize="12"
        fontWeight="bold"
      >
        {timeSignature.display}
      </text>
      
      {/* Bar Measure Numbers (Measure count) */}
      {Array.from({ length: measuresCount + 1 }).map((_, i) => (
        <text
          key={`measure-${i}`}
          x={PIANO_KEY_WIDTH + i * ((GRID_WIDTH - PIANO_KEY_WIDTH) / measuresCount)}
          y="-7"
          textAnchor="middle"
          fill="#555"
          fontSize="10"
        >
          {i}
        </text>
      ))}
      
      {/* Bar Measure ticks */}
      {Array.from({ length: divisions + 1 }).map((_, i) => {
        // Determine if this is a measure start (every beatsPerMeasure divisions)
        const isMeasureStart = i % beatsPerMeasure === 0;
        // Determine if this is a beat (depends on time signature)
        const isBeat = timeSignature.denominator === 4 ? 
          (i % 1 === 0) : // For 4/4, 3/4, etc. - every quarter note
          (i % (timeSignature.numerator / 4) === 0); // For 6/8, 9/8, etc. - every dotted quarter (3 eighth notes)
        
        return (
          <line 
            key={`tick-${i}`}
            x1={PIANO_KEY_WIDTH + i * ((GRID_WIDTH - PIANO_KEY_WIDTH) / divisions)} 
            y1={isMeasureStart ? "-5" : (isBeat ? "-4" : "-2")} 
            x2={PIANO_KEY_WIDTH + i * ((GRID_WIDTH - PIANO_KEY_WIDTH) / divisions)} 
            y2="0"
            stroke={isMeasureStart ? "#333" : "#555"}
            strokeWidth={isMeasureStart ? "1.5" : "1"}
          />
        );
      })}
    </>
  );
};

export default BarMeasures;