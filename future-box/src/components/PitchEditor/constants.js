// Constants for grid dimensions and editor configuration
export const PIANO_KEY_WIDTH = 50;
export const PIANO_PITCH_COUNT = 24; // Number of piano pitches (from PIANO_KEYS array length)
export const PITCH_HEIGHT = 16; // Height per pitch in pixels
export const GRID_HEIGHT = PIANO_PITCH_COUNT * PITCH_HEIGHT; // Dynamically calculated based on pitch count
export const GRID_WIDTH = 600;
export const EXTENDED_GRID_WIDTH = 1200; // Extended width for scrolling
export const EXTENDED_GRID_HEIGHT = GRID_HEIGHT * 2; // Extended height based on grid height
export const MIN_NOTE_WIDTH = 80;
export const NOTE_HEIGHT = 20;
export const GRID_LINES = PIANO_PITCH_COUNT; // Number of horizontal grid lines matches pitch count
export const TIME_DIVISIONS = 16; // Number of vertical grid lines
export const HANDLE_SIZE = 8;

// Calculate grid cell dimensions for snapping
export const HORIZONTAL_SNAP = GRID_HEIGHT / GRID_LINES;
export const VERTICAL_SNAP = (GRID_WIDTH - PIANO_KEY_WIDTH) / TIME_DIVISIONS;

// Piano keys layout (C4 to B5 - two octaves)
// The length of this array should match PIANO_PITCH_COUNT
export const PIANO_KEYS = [
  { note: 'B5', white: true },
  { note: 'A#5', white: false },
  { note: 'A5', white: true },
  { note: 'G#5', white: false },
  { note: 'G5', white: true },
  { note: 'F#5', white: false },
  { note: 'F5', white: true },
  { note: 'E5', white: true },
  { note: 'D#5', white: false },
  { note: 'D5', white: true },
  { note: 'C#5', white: false },
  { note: 'C5', white: true },
  { note: 'B4', white: true },
  { note: 'A#4', white: false },
  { note: 'A4', white: true },
  { note: 'G#4', white: false },
  { note: 'G4', white: true },
  { note: 'F#4', white: false },
  { note: 'F4', white: true },
  { note: 'E4', white: true },
  { note: 'D#4', white: false },
  { note: 'D4', white: true },
  { note: 'C#4', white: false },
  { note: 'C4', white: true },
];

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