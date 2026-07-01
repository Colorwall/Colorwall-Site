export const DEFAULT_SCROLL = 0;

/** Virtual scroll range for the hero intro (matches INTRO_SCROLL_END). */
export const SCROLL_MAX = 1;

/** Scroll phases for cinematic text overlays (scroll progress 0–1). */
export const TEXT_PHASES = [
  {
    id: 'mission',
    start: 0.35,
    peak: 0.42,
    end: 0.52,
    left: ['WE MADE', 'COLORWALL', 'THE WALLPAPER ENGINE', 'OF THE FUTURE'],
    right: ['PRODUCED BY', 'OLIVER LAXENTA'],
    rightItalic: true,
  },
  {
    id: 'live',
    start: 0.52,
    peak: 0.58,
    end: 0.68,
    left: ['LIVE WALLPAPERS', '& WIDGETS FOR EVERY', 'DESKTOP'],
    right: ['REAL-TIME', 'ZERO COPY RENDERING', 'AT 144 FPS'],
    rightItalic: true,
  },
  {
    id: 'craft',
    start: 0.68,
    peak: 0.74,
    end: 0.82,
    left: ['CRAFTED WITH', 'PRECISION', 'AND CARE'],
    right: ['DESIGNED FOR', 'WINDOWS', '10/11'],
    rightItalic: true,
  },
  {
    id: 'explore',
    start: 0.82,
    peak: 0.88,
    end: 0.95,
    left: ['THANK', 'YOU!'],
    right: ['FOR', 'CHOOSING', 'COLORWALL!'],
    rightItalic: true,
  },
] as const;

/** Sidebar appears as the hero scroll nears its end. */
export const SCROLL_NAV_SHOW_START = 0.55;
export const SCROLL_NAV_COMPLETE_AT = 0.98;
