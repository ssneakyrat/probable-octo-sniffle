import React from 'react';
import { PIANO_KEY_WIDTH, GRID_WIDTH, TIME_DIVISIONS } from './constants';

const BarMeasures = () => {
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
      
      {/* Bar Measure Numbers */}
      {Array.from({ length: TIME_DIVISIONS + 1 }).map((_, i) => (
        <text
          key={`measure-${i}`}
          x={PIANO_KEY_WIDTH + i * ((GRID_WIDTH - PIANO_KEY_WIDTH) / TIME_DIVISIONS)}
          y="-7"
          textAnchor="middle"
          fill="#555"
          fontSize="10"
        >
          {i}
        </text>
      ))}
      
      {/* Bar Measure ticks */}
      {Array.from({ length: TIME_DIVISIONS + 1 }).map((_, i) => (
        <line 
          key={`tick-${i}`}
          x1={PIANO_KEY_WIDTH + i * ((GRID_WIDTH - PIANO_KEY_WIDTH) / TIME_DIVISIONS)} 
          y1="-3" 
          x2={PIANO_KEY_WIDTH + i * ((GRID_WIDTH - PIANO_KEY_WIDTH) / TIME_DIVISIONS)} 
          y2="0"
          stroke="#555"
          strokeWidth="1"
        />
      ))}
    </>
  );
};

export default BarMeasures;