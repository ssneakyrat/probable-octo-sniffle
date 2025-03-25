// Constants for grid dimensions and editor configuration
export const PIANO_KEY_WIDTH = 50;
export const PIANO_PITCH_COUNT = 48; // Default number of piano pitches
export const PITCH_HEIGHT = 16; // Height per pitch in pixels
export const GRID_WIDTH = 1200;
//export const EXTENDED_GRID_WIDTH = 1200; // Extended width for scrolling
export const TOTAL_GRID_WIDTH = 2400; // Total width of the grid including scrollable area
export const MIN_NOTE_WIDTH = 80;
export const NOTE_HEIGHT = 20;
export const TIME_DIVISIONS = 16; // Number of vertical grid lines
export const HANDLE_SIZE = 8;

// Function to generate piano keys based on pitch count
export const generatePianoKeys = (pitchCount) => {
  const notesPerOctave = 12;
  const noteNames = ['B', 'A#', 'A', 'G#', 'G', 'F#', 'F', 'E', 'D#', 'D', 'C#', 'C'];
  const whiteKeys = ['B', 'A', 'G', 'F', 'E', 'D', 'C']; // Keys that are white
  
  const keys = [];
  let keysNeeded = pitchCount;
  
  for (let octave = 5; keysNeeded > 0; octave--) {
    for (let i = 0; i < noteNames.length && keysNeeded > 0; i++) {
      const note = noteNames[i] + octave;
      const isWhite = whiteKeys.includes(noteNames[i]);
      
      keys.push({
        note: note,
        white: isWhite
      });
      
      keysNeeded--;
    }
  }
  
  return keys;
};

// Variable to store the current pitch count (default initially)
let currentPitchCount = PIANO_PITCH_COUNT;

// Function to update piano-related values based on a new pitch count
export const updatePianoValues = (pitchCount) => {
  currentPitchCount = pitchCount;
  PIANO_KEYS = generatePianoKeys(pitchCount);
  GRID_HEIGHT = pitchCount * PITCH_HEIGHT;
  GRID_LINES = pitchCount;
  //EXTENDED_GRID_HEIGHT = GRID_HEIGHT;
  TOTAL_GRID_HEIGHT = GRID_HEIGHT * 2; // Set total height to double the grid height, similar to width
  HORIZONTAL_SNAP = GRID_HEIGHT / GRID_LINES;
};

// Piano keys layout - now a variable that gets filled based on the current pitch count
export let PIANO_KEYS = generatePianoKeys(currentPitchCount);

// Grid dimensions that depend on pitch count - now variables
export let GRID_HEIGHT = currentPitchCount * PITCH_HEIGHT;
export let GRID_LINES = currentPitchCount;
export let EXTENDED_GRID_HEIGHT = GRID_HEIGHT;
export let TOTAL_GRID_HEIGHT = GRID_HEIGHT * 2; // Added total height, similar to total width
export let HORIZONTAL_SNAP = GRID_HEIGHT / GRID_LINES;

// Grid dimensions that don't depend on pitch count - still constants
export const VERTICAL_SNAP = (GRID_WIDTH - PIANO_KEY_WIDTH) / TIME_DIVISIONS;

// Editor modes
export const EDITOR_MODES = {
  SELECT: 'select',
  DRAW: 'draw',
  DELETE: 'delete'
};

// Note drag states
export const DRAG_STATES = {
  NONE: null,
  DRAGGING: 'dragging',
  RESIZING_LEFT: 'resizing-left',
  RESIZING_RIGHT: 'resizing-right'
};