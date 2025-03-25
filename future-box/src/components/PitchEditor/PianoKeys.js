import React from 'react';
import { PIANO_KEY_WIDTH, GRID_HEIGHT, PIANO_KEYS, PIANO_PITCH_COUNT, PITCH_HEIGHT } from './constants';

const PianoKeys = () => {
  return (
    <>
      {/* Piano keys */}
      {PIANO_KEYS.map((key, i) => (
        <React.Fragment key={`key-${i}`}>
          <rect 
            x="0" 
            y={i * PITCH_HEIGHT} 
            width={PIANO_KEY_WIDTH} 
            height={PITCH_HEIGHT}
            fill={key.white ? "white" : "black"}
            stroke="#aaa"
            strokeWidth="1"
          />
          <text 
            x="5" 
            y={i * PITCH_HEIGHT + (PITCH_HEIGHT / 2)} 
            fill={key.white ? "black" : "white"} 
            fontSize="10"
            dominantBaseline="middle"
          >
            {key.note}
          </text>
        </React.Fragment>
      ))}
    </>
  );
};

export default PianoKeys;