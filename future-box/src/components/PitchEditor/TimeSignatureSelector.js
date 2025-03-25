import React from 'react';
import { useEditor } from './EditorContext';

const TimeSignatureSelector = () => {
  const { timeSignature, setTimeSignature } = useEditor();
  
  const timeSignatures = [
    { id: '4/4', numerator: 4, denominator: 4, display: '4/4' },
    { id: '3/4', numerator: 3, denominator: 4, display: '3/4' },
    { id: '2/4', numerator: 2, denominator: 4, display: '2/4' },
    { id: '6/8', numerator: 6, denominator: 8, display: '6/8' },
    { id: '9/8', numerator: 9, denominator: 8, display: '9/8' },
    { id: '12/8', numerator: 12, denominator: 8, display: '12/8' }
  ];
  
  const handleChange = (e) => {
    const selectedId = e.target.value;
    const selected = timeSignatures.find(ts => ts.id === selectedId);
    setTimeSignature(selected);
  };
  
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="timeSignature" className="text-sm font-medium">Time Signature:</label>
      <select
        id="timeSignature"
        value={timeSignature.id}
        onChange={handleChange}
        className="px-2 py-1 border rounded text-sm"
      >
        {timeSignatures.map(ts => (
          <option key={ts.id} value={ts.id}>
            {ts.display}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeSignatureSelector;