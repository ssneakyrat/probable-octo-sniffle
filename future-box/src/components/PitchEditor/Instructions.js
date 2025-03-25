import React from 'react';

const Instructions = () => {
  return (
    <div className="mt-4 text-sm text-gray-700">
      <p>• <strong>Select Mode:</strong> Click on a note to select it. Drag to move, resize using handles.</p>
      <p>• <strong>Draw Mode:</strong> Click anywhere on the grid to create a new note (will snap to grid).</p>
      <p>• <strong>Delete Mode:</strong> Click on a note to delete it.</p>
      <p>• <strong>Connected Notes:</strong> When notes are placed adjacent to each other, their pitch lines will automatically connect smoothly.</p>
      <p>• Green indicators highlight where notes are connected.</p>
      <p>• For selected notes, you can add control points to create more complex pitch curves.</p>
      <p>• To delete a control point: double-click it, use Delete key when selected, or use the Delete button.</p>
      <p>• Modify the pitch by dragging the red anchor points and their control handles.</p>
    </div>
  );
};

export default Instructions;