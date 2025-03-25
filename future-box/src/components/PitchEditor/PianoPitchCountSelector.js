import React from 'react';
import { useEditor } from './EditorContext';
import { PIANO_PITCH_COUNT } from './constants';

const PianoPitchCountSelector = () => {
  const { pianoPitchCount, setPianoPitchCount } = useEditor();
  
  // Options for piano pitch count
  const pitchCountOptions = [
    { value: 12, label: '1 Octave (12 keys)' },
    { value: 24, label: '2 Octaves (24 keys)' },
    { value: 36, label: '3 Octaves (36 keys)' },
    { value: 48, label: '4 Octaves (48 keys)' }
  ];
  
  const handleChange = (e) => {
    const newPitchCount = parseInt(e.target.value, 10);
    
    // Only update if value actually changed
    if (newPitchCount !== pianoPitchCount) {
      setPianoPitchCount(newPitchCount);
    }
  };
  
  // Use the current pitch count value or the default from constants
  const currentValue = pianoPitchCount || PIANO_PITCH_COUNT;
  
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="pitchCount" className="text-sm font-medium">Piano Range:</label>
      <select
        id="pitchCount"
        value={currentValue}
        onChange={handleChange}
        className="px-2 py-1 border rounded text-sm"
      >
        {pitchCountOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PianoPitchCountSelector;