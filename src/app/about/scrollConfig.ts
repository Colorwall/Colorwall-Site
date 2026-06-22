/** One mouse-wheel notch (typical deltaY ≈ 100). */
export const SCROLL_WHEEL_STEP = 100 * 0.0012;

/**
 * Start one wheel notch pulled back from spline origin — enough to frame the
 * astronaut outside the light core without jumping deep into the zoom phase.
 */
export const DEFAULT_SCROLL = SCROLL_WHEEL_STEP;
