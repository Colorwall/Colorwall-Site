import * as THREE from "three";

// cubic bezier vertex shader matching the codepen smoke shatter animation 1:1
const smokeVertexShader = `
uniform float uTime;
uniform float uProgress;

attribute vec2 aAnimation;
attribute vec3 aCentroid;
attribute vec3 aControl0;
attribute vec3 aControl1;
attribute vec3 aEndPosition;

varying vec2 vUv;

vec3 cubicBezier(vec3 p0, vec3 c0, vec3 c1, vec3 p1, float t) {
  float tn = 1.0 - t;
  return p0 * tn * tn * tn +
         c0 * 3.0 * t * tn * tn +
         c1 * 3.0 * t * t * tn +
         p1 * t * t * t;
}

float easeOutCubic(float t) {
  float f = t - 1.0;
  return f * f * f + 1.0;
}

void main() {
  vUv = uv;
  float tDelay = aAnimation.x;
  float tDuration = aAnimation.y;
  float maxTime = tDelay + tDuration;
  
  // calculate current time offset from uniform uProgress
  float currentTime = uProgress * maxTime;
  float tTime = clamp(currentTime - tDelay, 0.0, tDuration);
  float tProgress = easeOutCubic(tTime / tDuration);

  vec3 tPosition = position - aCentroid;
  tPosition *= (1.0 - tProgress * 0.9);
  tPosition += aCentroid;
  tPosition += cubicBezier(vec3(0.0), aControl0, aControl1, aEndPosition, tProgress);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(tPosition, 1.0);
}
`;

const smokeFragmentShader = `
uniform sampler2D uMap;
uniform float uOpacity;
varying vec2 vUv;

void main() {
  vec4 color = texture2D(uMap, vUv);
  gl_FragColor = vec4(color.rgb, color.a * uOpacity);
}
`;

export function createTextTexture(text: string, width = 1024, height = 256): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.clearRect(0, 0, width, height);
    ctx.font = "bold 84px Georgia, 'Playfair Display', serif";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
    ctx.shadowBlur = 16;
    ctx.fillText(text, 20, 150);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function createSmokeTextGeometry(width = 3.2, height = 0.8, widthSegments = 45, heightSegments = 22): THREE.PlaneGeometry {
  const baseGeometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
  const positionAttr = baseGeometry.attributes.position;
  const count = positionAttr.count;

  const aAnimation = new Float32Array(count * 2);
  const aCentroid = new Float32Array(count * 3);
  const aControl0 = new Float32Array(count * 3);
  const aControl1 = new Float32Array(count * 3);
  const aEndPosition = new Float32Array(count * 3);

  const maxDelayX = 1.2;
  const maxDelayY = 0.3;
  const minDuration = 1.5;
  const maxDuration = 3.5;

  for (let i = 0; i < count; i += 3) {
    const x1 = positionAttr.getX(i);
    const y1 = positionAttr.getY(i);
    const z1 = positionAttr.getZ(i);

    const x2 = positionAttr.getX(i + 1);
    const y2 = positionAttr.getY(i + 1);
    const z2 = positionAttr.getZ(i + 1);

    const x3 = positionAttr.getX(i + 2);
    const y3 = positionAttr.getY(i + 2);
    const z3 = positionAttr.getZ(i + 2);

    const cx = (x1 + x2 + x3) / 3;
    const cy = (y1 + y2 + y3) / 3;
    const cz = (z1 + z2 + z3) / 3;

    const delayX = Math.max(0, (cx + width / 2) * maxDelayX);
    const delayY = Math.max(0, (height / 2 - cy) * maxDelayY);
    const duration = minDuration + Math.random() * (maxDuration - minDuration);

    const c0x = cx + (Math.random() * 0.8 + 0.4);
    const c0y = cy + Math.random() * 2.2;
    const c0z = (Math.random() - 0.5) * 1.5;

    const c1x = cx - (Math.random() * 0.8 + 0.4);
    const c1y = cy + Math.random() * 2.8;
    const c1z = (Math.random() - 0.5) * 1.5;

    const endX = cx + (Math.random() - 0.5) * 1.5;
    const endY = cy + Math.random() * 3.5 + 1.2;
    const endZ = (Math.random() - 0.5) * 1.0;

    for (let v = 0; v < 3; v++) {
      const idx = i + v;
      aAnimation[idx * 2] = delayX + delayY + Math.random() * 0.2;
      aAnimation[idx * 2 + 1] = duration;

      aCentroid[idx * 3] = cx;
      aCentroid[idx * 3 + 1] = cy;
      aCentroid[idx * 3 + 2] = cz;

      aControl0[idx * 3] = c0x;
      aControl0[idx * 3 + 1] = c0y;
      aControl0[idx * 3 + 2] = c0z;

      aControl1[idx * 3] = c1x;
      aControl1[idx * 3 + 1] = c1y;
      aControl1[idx * 3 + 2] = c1z;

      aEndPosition[idx * 3] = endX;
      aEndPosition[idx * 3 + 1] = endY;
      aEndPosition[idx * 3 + 2] = endZ;
    }
  }

  baseGeometry.setAttribute("aAnimation", new THREE.BufferAttribute(aAnimation, 2));
  baseGeometry.setAttribute("aCentroid", new THREE.BufferAttribute(aCentroid, 3));
  baseGeometry.setAttribute("aControl0", new THREE.BufferAttribute(aControl0, 3));
  baseGeometry.setAttribute("aControl1", new THREE.BufferAttribute(aControl1, 3));
  baseGeometry.setAttribute("aEndPosition", new THREE.BufferAttribute(aEndPosition, 3));

  return baseGeometry;
}

export function createSmokeTextMaterial(texture: THREE.Texture): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: smokeVertexShader,
    fragmentShader: smokeFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uOpacity: { value: 1 },
      uMap: { value: texture },
    },
    transparent: true,
    side: THREE.DoubleSide,
  });
}
