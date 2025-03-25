import React from 'react';
import { generateBezierPath } from './bezierUtils';

const BezierCurve = ({ pitchPoints }) => {
  const bezierPath = generateBezierPath(pitchPoints);
  
  return (
    <path
      d={bezierPath}
      stroke="#ff6b6b"
      strokeWidth="2"
      fill="none"
    />
  );
};

export default BezierCurve;