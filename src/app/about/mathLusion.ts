/** Lusion-style range remap with optional easing (matches lusion_bundle math.fit). */
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

/** Hero intro ratio — Lusion uses u / (RANGE_START_WAIT + RANGE_PAGE_12). */
export const INTRO_SCROLL_END = 0.85;
const LUSION_INTRO_VIEWPORTS = 3.5 + 1.75; // RANGE_START_WAIT + RANGE_PAGE_12

export function introRatioFromScroll(scroll: number) {
  return saturate(scroll / INTRO_SCROLL_END);
}

/** HUD fade — platform + halo dim after mid-intro (aligned with scatter falloff). */
export function hudRatioFromIntro(intro: number) {
  const hudEnd = 1 + (1.75 * 0.5) / LUSION_INTRO_VIEWPORTS;
  return fit(intro, 0.75, hudEnd, 0, 1, cubicIn);
}
