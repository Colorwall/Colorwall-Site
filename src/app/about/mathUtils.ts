/** Buffer-style range remap with optional easing (matches buffer_bundle math.fit). */
export function fit(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
  ease?: (t: number) => number,
): number {
  if (inMin === inMax) return outMin;
  let t = (value - inMin) / (inMax - inMin);
  t = Math.max(0, Math.min(1, t));
  if (ease) t = ease(t);
  return outMin + (outMax - outMin) * t;
}

export function saturate(v: number) {
  return Math.max(0, Math.min(1, v));
}

export function cubicOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function cubicIn(t: number) {
  return t * t * t;
}

export function sineOut(t: number) {
  return Math.sin((t * Math.PI) / 2);
}

export function sineInOut(t: number) {
  return -0.5 * (Math.cos(Math.PI * t) - 1);
}

/** Hero intro ratio — Buffer uses u / (RANGE_START_WAIT + RANGE_PAGE_12). */
export const INTRO_SCROLL_END = 0.85;
const BUFFER_INTRO_VIEWPORTS = 3.5 + 1.75; // RANGE_START_WAIT + RANGE_PAGE_12

export function introRatioFromScroll(scroll: number) {
  return saturate(scroll / INTRO_SCROLL_END);
}

/** HUD contour draw — Buffer ramps hudRatio on page 2→3 scroll. */
export function hudRatioFromIntro(intro: number) {
  return fit(intro, 0.7, 0.85, 0, 1, cubicOut);
}
