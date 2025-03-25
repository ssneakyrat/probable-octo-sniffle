import React from 'react';
import { useEditor } from './EditorContext';
import { PIANO_KEY_WIDTH, GRID_WIDTH, TOTAL_GRID_WIDTH, DEFAULT_MEASURE_COUNT } from './constants';

const BarMeasures = () => {
  const { timeSignature, calculateTimeDivisions } = useEditor();
  
  const divisions = calculateTimeDivisions();
  const beatsPerMeasure = timeSignature.numerator;
  
  // Use DEFAULT_MEASURE_COUNT directly instead of calculating from grid widths
  // This ensures the number of measures matches what was defined in constants.js
  const totalMeasuresCount = DEFAULT_MEASURE_COUNT;
  
  // Calculate total divisions based on measures and beats per measure
  const totalDivisions = totalMeasuresCount * beatsPerMeasure;
  
  return (
    <>
      {/* Bar Measure Background - now spans the total width */}
      <rect 
        x={PIANO_KEY_WIDTH} 
        y="-20" 
        width={TOTAL_GRID_WIDTH - PIANO_KEY_WIDTH} 
        height="20" 
        fill="#e8e8e8" 
      />
      
      {/* Time Signature Display - unchanged */}
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
      
      {/* Bar Measure Numbers - show all measures defined in DEFAULT_MEASURE_COUNT */}
      {Array.from({ length: totalMeasuresCount + 1 }).map((_, i) => (
        <text
          key={`measure-${i}`}
          x={PIANO_KEY_WIDTH + i * ((TOTAL_GRID_WIDTH - PIANO_KEY_WIDTH) / totalMeasuresCount)}
          y="-7"
          textAnchor="middle"
          fill="#555"
          fontSize="10"
        >
          {i}
        </text>
      ))}
      
      {/* Bar Measure ticks - use totalDivisions based on measure count */}
      {Array.from({ length: totalDivisions + 1 }).map((_, i) => {
        // Determine if this is a measure start (every beatsPerMeasure divisions)
        const isMeasureStart = i % beatsPerMeasure === 0;
        // Determine if this is a beat (depends on time signature)
        const isBeat = timeSignature.denominator === 4 ? 
          (i % 1 === 0) : // For 4/4, 3/4, etc. - every quarter note
          (i % (timeSignature.numerator / 4) === 0); // For 6/8, 9/8, etc. - every dotted quarter (3 eighth notes)
        
        return (
          <line 
            key={`tick-${i}`}
            x1={PIANO_KEY_WIDTH + i * ((TOTAL_GRID_WIDTH - PIANO_KEY_WIDTH) / totalDivisions)} 
            y1={isMeasureStart ? "-5" : (isBeat ? "-4" : "-2")} 
            x2={PIANO_KEY_WIDTH + i * ((TOTAL_GRID_WIDTH - PIANO_KEY_WIDTH) / totalDivisions)} 
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