import React from 'react';
import { useEditor } from './EditorContext';
import { EDITOR_MODES } from './constants';

const EditorToolbar = () => {
  const { 
    editorMode, 
    setEditorMode, 
    selectedNoteIndex, 
    activePoint, 
    handleAddMiddlePoint, 
    handleDeleteControlPoint 
  } = useEditor();
  
  return (
    <div className="flex flex-col items-center mb-4">
      {/* Mode selection toolbar */}
      <div className="flex space-x-2 mb-4">
        <button 
          className={`px-4 py-2 rounded ${editorMode === EDITOR_MODES.SELECT ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
          onClick={() => setEditorMode(EDITOR_MODES.SELECT)}
        >
          Select Mode
        </button>
        <button 
          className={`px-4 py-2 rounded ${editorMode === EDITOR_MODES.DRAW ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
          onClick={() => setEditorMode(EDITOR_MODES.DRAW)}
        >
          Draw Mode
        </button>
        <button 
          className={`px-4 py-2 rounded ${editorMode === EDITOR_MODES.DELETE ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
          onClick={() => setEditorMode(EDITOR_MODES.DELETE)}
        >
          Delete Mode
        </button>
      </div>
      
      {/* Additional controls when a note is selected */}
      {selectedNoteIndex !== null && editorMode === EDITOR_MODES.SELECT && (
        <div className="flex space-x-2">
          <button 
            className="px-4 py-1 bg-green-500 text-white rounded"
            onClick={handleAddMiddlePoint}
          >
            Add Control Point
          </button>
          {activePoint && 
           activePoint.type === 'anchor' && 
           activePoint.index > 0 && 
           activePoint.index < (activePoint.noteIndex !== null ? Number.MAX_SAFE_INTEGER : 0) && (
            <button 
              className="px-4 py-1 bg-red-500 text-white rounded"
              onClick={() => handleDeleteControlPoint(activePoint.noteIndex, activePoint.index)}
            >
              Delete Selected Point
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EditorToolbar;