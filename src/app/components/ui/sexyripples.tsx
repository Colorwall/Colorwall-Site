"use client";

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Renderer, Program, Mesh, Geometry, Triangle, Texture, RenderTarget } from 'ogl';

const MAX_WAVES = 36;
const QUALITY_SCALE: Record<string, number> = { low: 0.4, medium: 0.7, high: 1 };
const START_SCALE = 1.5;
const LIFE_CONSTANT = Math.log(500);

const waveVertex = `
precision highp float;

attribute vec2 position;
attribute vec2 uv;
attribute vec2 iOffset;
attribute vec2 iScale;
attribute float iOpacity;

varying vec2 vUv;
varying float vOpacity;

void main() {
  vUv = uv;
  vOpacity = iOpacity;
  gl_Position = vec4(iOffset + position * iScale, 0.0, 1.0);
}
`;

const waveFragment = `
precision highp float;

varying vec2 vUv;
varying float vOpacity;

uniform float uRings;

const float PI = 3.141592653589793;
const float EDGE = 0.006737947;

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = dot(p, p);
  float mask = clamp((1.0 - r) * 25.0, 0.0, 1.0);

  float brush = max(0.0, (exp(-r * 5.0) - EDGE) / (1.0 - EDGE));

  brush *= 0.55 + 0.45 * cos(sqrt(r) * PI * 2.0 * uRings);

  gl_FragColor = vec4(vec3(brush * vOpacity * vOpacity * mask), 1.0);
}
`;

const screenVertex = `
precision highp float;
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const compositeFragment = `
precision highp float;

varying vec2 vUv;

uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
uniform vec2 uResolution;
uniform vec2 uTextureSize;
uniform vec2 uTexel;
uniform vec3 uTint;
uniform vec3 uHighlight;
uniform float uStrength;
uniform float uSwirl;
uniform float uDispersion;
uniform float uGlint;
uniform float uTintAmount;
uniform float uGrayscale;

const float TAU = 6.283185307179586;

vec2 coverUV(vec2 uv) {
  vec2 safe = max(uTextureSize, vec2(1.0));
  vec2 s = uResolution / safe;
  vec2 scaledSize = safe * max(s.x, s.y);
  vec2 offset = (uResolution - scaledSize) * 0.5;
  return (uv * uResolution - offset) / scaledSize;
}

void main() {
  float amount = texture2D(uDisplacement, vUv).r;
  vec2 base = coverUV(vUv);

  float theta = amount * uSwirl * TAU;
  vec2 dir = vec2(sin(theta), cos(theta));
  vec2 push = dir * amount * uStrength;

  vec3 color;
  if (uDispersion > 0.001) {
    float split = uDispersion * 0.25;
    color.r = texture2D(uTexture, base + push * (1.0 + split)).r;
    color.g = texture2D(uTexture, base + push).g;
    color.b = texture2D(uTexture, base + push * (1.0 - split)).b;
  } else {
    color = texture2D(uTexture, base + push).rgb;
  }

  if (uGrayscale > 0.001) {
    color = mix(color, vec3(dot(color, vec3(0.2126, 0.7152, 0.0722))), uGrayscale);
  }

  if (uTintAmount > 0.001) {
    color = mix(color, color * uTint * 1.9, clamp(amount * 1.6, 0.0, 1.0) * uTintAmount);
  }

  if (uGlint > 0.001) {
    float ex = texture2D(uDisplacement, vUv + vec2(uTexel.x, 0.0)).r - texture2D(uDisplacement, vUv - vec2(uTexel.x, 0.0)).r;
    float ey = texture2D(uDisplacement, vUv + vec2(0.0, uTexel.y)).r - texture2D(uDisplacement, vUv - vec2(0.0, uTexel.y)).r;
    vec3 normal = normalize(vec3(-ex * 26.0, -ey * 26.0, 1.0));
    vec3 light = normalize(vec3(-0.35, 0.55, 1.0));
    float raw = pow(max(dot(normal, light), 0.0), 22.0);
    float flatSpec = pow(max(light.z, 0.0), 22.0);
    color += uHighlight * clamp((raw - flatSpec) / max(1.0 - flatSpec, 0.0001), 0.0, 1.0) * uGlint;
  }

  gl_FragColor = vec4(color, 1.0);
}
`;

type RippleTrigger = 'hover' | 'click' | 'both';
type RippleQuality = 'low' | 'medium' | 'high';

export interface RippleDistortionProps {
  src?: string;
  brushSize?: number;
  strength?: number;
  swirl?: number;
  rings?: number;
  spread?: number;
  fade?: number;
  spacing?: number;
  dispersion?: number;
  glint?: number;
  tint?: string;
  tintAmount?: number;
  grayscale?: boolean;
  highlightColor?: string;
  trigger?: RippleTrigger;
  clickStrength?: number;
  quality?: RippleQuality;
  enabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

interface WaveConfig {
  brushSize: number;
  spread: number;
  fade: number;
  spacing: number;
  clickStrength: number;
  trigger: RippleTrigger;
  enabled: boolean;
}

interface Wave {
  x: number;
  y: number;
  scale: number;
  target: number;
  size: number;
  opacity: number;
}

interface CompositeUniforms {
  uTexture: { value: Texture };
  uDisplacement: { value: Texture };
  uResolution: { value: [number, number] };
  uTextureSize: { value: [number, number] };
  uTexel: { value: [number, number] };
  uTint: { value: [number, number, number] };
  uHighlight: { value: [number, number, number] };
  uStrength: { value: number };
  uSwirl: { value: number };
  uDispersion: { value: number };
  uGlint: { value: number };
  uTintAmount: { value: number };
  uGrayscale: { value: number };
  [key: string]: { value: unknown };
}

interface WaveUniforms {
  uRings: { value: number };
  [key: string]: { value: unknown };
}

interface RippleUniforms {
  wave: WaveUniforms;
  composite: CompositeUniforms;
}

const hexToRGB = (hex: string): [number, number, number] => {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map(c => c + c)
          .join('')
      : clean;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return [1, 1, 1];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

const RippleDistortion = ({
  src = 'https://images.unsplash.com/photo-1782977389500-dd7adad33ebe?q=80&w=3416&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  brushSize = 200,
  strength = 0.22,
  swirl = 0.8,
  rings = 3,
  spread = 2.75,
  fade = 2.6,
  spacing = 10,
  dispersion = 0.02,
  glint = 0.25,
  tint = '#ffffffff',
  tintAmount = 0.3,
  grayscale = false,
  highlightColor = '#00c3ffff',
  trigger = 'both',
  clickStrength = 3,
  quality = 'low',
  enabled = true,
  className = '',
  style
}: RippleDistortionProps) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const configRef = useRef<WaveConfig>({} as WaveConfig);
  const uniformsRef = useRef<RippleUniforms | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  configRef.current = { brushSize, spread, fade, spacing, clickStrength, trigger, enabled };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new Renderer({
      alpha: false,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 1);
    const canvas = gl.canvas;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    mount.appendChild(canvas);

    const imageTexture = new Texture(gl, {
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE
    });

    let disposed = false;
    const image = new window.Image();
    // only apply anonymous cors when fetching from external origins to prevent local canvas tainting
    if (/^https?:\/\//i.test(src)) {
      image.crossOrigin = 'anonymous';
    }
    image.decoding = 'async';
    image.onload = () => {
      if (disposed) return;
      imageTexture.image = image;
      compositeUniforms.uTextureSize.value = [image.naturalWidth || 1, image.naturalHeight || 1];
      setIsLoaded(true);
    };
    image.src = src;

    const offsets = new Float32Array(MAX_WAVES * 2);
    const scales = new Float32Array(MAX_WAVES * 2);
    const opacities = new Float32Array(MAX_WAVES);

    const waves: Wave[] = Array.from({ length: MAX_WAVES }, () => ({
      x: 0,
      y: 0,
      scale: START_SCALE,
      target: START_SCALE,
      size: 1,
      opacity: 0
    }));
    let current = 0;

    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]) },
      uv: { size: 2, data: new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]) },
      iOffset: { instanced: 1, size: 2, data: offsets },
      iScale: { instanced: 1, size: 2, data: scales },
      iOpacity: { instanced: 1, size: 1, data: opacities }
    });

    const waveUniforms: WaveUniforms = { uRings: { value: rings } };
    const waveProgram = new Program(gl, {
      vertex: waveVertex,
      fragment: waveFragment,
      uniforms: waveUniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      cullFace: false
    });
    waveProgram.setBlendFunc(gl.ONE, gl.ONE);
    const waveMesh = new Mesh(gl, { geometry, program: waveProgram, frustumCulled: false });

    const displacementTarget = new RenderTarget(gl, {
      width: 2,
      height: 2,
      depth: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE
    });

    const compositeUniforms: CompositeUniforms = {
      uTexture: { value: imageTexture },
      uDisplacement: { value: displacementTarget.texture },
      uResolution: { value: [1, 1] },
      uTextureSize: { value: [1, 1] },
      uTexel: { value: [1, 1] },
      uTint: { value: hexToRGB(tint) },
      uHighlight: { value: hexToRGB(highlightColor) },
      uStrength: { value: strength },
      uSwirl: { value: swirl },
      uDispersion: { value: dispersion },
      uGlint: { value: glint },
      uTintAmount: { value: tintAmount },
      uGrayscale: { value: grayscale ? 1 : 0 }
    };

    const compositeMesh = new Mesh(gl, {
      geometry: new Triangle(gl),
      program: new Program(gl, {
        vertex: screenVertex,
        fragment: compositeFragment,
        uniforms: compositeUniforms,
        depthTest: false,
        depthWrite: false
      })
    });

    uniformsRef.current = { wave: waveUniforms, composite: compositeUniforms };

    let width = 1;
    let height = 1;

    const resize = () => {
      width = Math.max(1, mount.clientWidth);
      height = Math.max(1, mount.clientHeight);
      renderer.setSize(width, height);
      compositeUniforms.uResolution.value = [width, height];

      const scale = QUALITY_SCALE[quality] || QUALITY_SCALE.high;
      const fieldW = Math.max(2, Math.round(width * scale));
      const fieldH = Math.max(2, Math.round(height * scale));
      displacementTarget.setSize(fieldW, fieldH);
      compositeUniforms.uTexel.value = [1 / fieldW, 1 / fieldH];
    };

    let cachedRect = mount.getBoundingClientRect();
    const updateRect = () => {
      if (mount) cachedRect = mount.getBoundingClientRect();
    };
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, { passive: true });

    const ro = new ResizeObserver(() => {
      resize();
      updateRect();
    });
    ro.observe(mount);
    resize();

    const setNewWave = (x: number, y: number, power: number) => {
      const cfg = configRef.current;
      const wave = waves[current];
      current = (current + 1) % MAX_WAVES;
      wave.x = x;
      wave.y = y;
      wave.scale = START_SCALE * power;
      
      // clamp max expansion diameter to 1.1x viewport diagonal to eliminate offscreen overdraw
      const maxTargetPixels = Math.max(width, height) * 1.1;
      const requestedTarget = START_SCALE * Math.max(1, cfg.spread) * power;
      const maxAllowedScale = maxTargetPixels / Math.max(1, cfg.brushSize);
      wave.target = Math.min(requestedTarget, maxAllowedScale);
      wave.size = Math.max(1, cfg.brushSize);
      wave.opacity = 1;
    };

    const localPoint = (clientX: number, clientY: number): [number, number] | null => {
      const rect = cachedRect;
      if (rect.width === 0 || rect.height === 0) return null;
      if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
        return null;
      }
      return [clientX - rect.left, rect.height - (clientY - rect.top)];
    };

    let previousX = 0;
    let previousY = 0;

    const onMove = (event: PointerEvent) => {
      const cfg = configRef.current;
      if (!cfg.enabled || reduceMotion || cfg.trigger === 'click') return;
      const point = localPoint(event.clientX, event.clientY);
      if (!point) return;
      const step = Math.max(1, cfg.spacing);
      if (Math.abs(point[0] - previousX) > step || Math.abs(point[1] - previousY) > step) {
        setNewWave(point[0], point[1], 1);
        previousX = point[0];
        previousY = point[1];
      }
    };

    const onDown = (event: PointerEvent) => {
      const cfg = configRef.current;
      if (!cfg.enabled || reduceMotion || cfg.trigger === 'hover') return;
      const point = localPoint(event.clientX, event.clientY);
      if (!point) return;
      setNewWave(point[0], point[1], Math.max(1, cfg.clickStrength));
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });

    let raf = 0;
    let previousTime = 0;
    let hadActiveWaves = true;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const delta = previousTime ? Math.min(0.05, (now - previousTime) / 1000) : 0;
      previousTime = now;
      const cfg = configRef.current;

      const growth = reduceMotion ? 0 : 1 - Math.exp(-delta * 1.09);
      const decay = reduceMotion ? 1 : Math.exp((-delta * LIFE_CONSTANT) / Math.max(0.15, cfg.fade));

      // compact active waves into front of buffer and track active count
      let activeCount = 0;

      for (let i = 0; i < MAX_WAVES; i += 1) {
        const wave = waves[i];
        if (wave.opacity <= 0.005) {
          wave.opacity = 0;
          continue;
        }

        wave.opacity *= decay;
        wave.scale += (wave.target - wave.scale) * growth;

        if (wave.opacity < 0.005) {
          wave.opacity = 0;
          continue;
        }

        const half = (wave.scale * wave.size) / 2;
        offsets[activeCount * 2] = (wave.x / width) * 2 - 1;
        offsets[activeCount * 2 + 1] = (wave.y / height) * 2 - 1;
        scales[activeCount * 2] = (half / width) * 2;
        scales[activeCount * 2 + 1] = (half / height) * 2;
        opacities[activeCount] = wave.opacity;
        activeCount += 1;
      }

      // dynamically inform ogl renderer how many instances to draw
      geometry.instancedCount = activeCount;

      if (activeCount > 0) {
        hadActiveWaves = true;
        geometry.attributes.iOffset.needsUpdate = true;
        geometry.attributes.iScale.needsUpdate = true;
        geometry.attributes.iOpacity.needsUpdate = true;
        renderer.render({ scene: waveMesh, target: displacementTarget, clear: true });
      } else if (hadActiveWaves) {
        // clear displacement target once when entering idle state
        hadActiveWaves = false;
        gl.bindFramebuffer(gl.FRAMEBUFFER, displacementTarget.buffer);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }

      renderer.render({ scene: compositeMesh });
    };
    raf = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      uniformsRef.current = null;
      // remove canvas cleanly from parent container without forcibly invalidating webgl context
      if (canvas.parentNode === mount) {
        mount.removeChild(canvas);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, quality]);

  useEffect(() => {
    const u = uniformsRef.current;
    if (!u) return;
    u.wave.uRings.value = rings;
    u.composite.uStrength.value = strength;
    u.composite.uSwirl.value = swirl;
    u.composite.uDispersion.value = dispersion;
    u.composite.uGlint.value = glint;
    u.composite.uTintAmount.value = tintAmount;
    u.composite.uGrayscale.value = grayscale ? 1 : 0;
    u.composite.uHighlight.value = hexToRGB(highlightColor);
    u.composite.uTint.value = hexToRGB(tint);
  }, [rings, strength, swirl, dispersion, glint, tintAmount, grayscale, highlightColor, tint]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full overflow-hidden transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'} [&>canvas]:block [&>canvas]:w-full [&>canvas]:h-full ${className}`.trim()}
      style={style}
    />
  );
};

export default RippleDistortion;
