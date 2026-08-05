export const vertexShader = /* glsl */ `
uniform vec2 uvRate1;

varying vec2 vUv;
varying vec2 vUv1;

void main() {
  vUv = uv;
  vUv1 = uv - 0.5;
  vUv1 *= uvRate1.xy;
  vUv1 += 0.5;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const fragmentShader = /* glsl */ `
uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform vec2 pixels;
uniform vec2 accel;

varying vec2 vUv;
varying vec2 vUv1;

vec2 mirrored(vec2 v) {
  vec2 m = mod(v, 2.0);
  return mix(m, 2.0 - m, step(1.0, m));
}

float tri(float p) {
  return mix(p, 1.0 - p, step(0.5, p)) * 2.0;
}

void main() {
  float p = fract(progress);
  float delayValue = p * 7.0 - vUv.y * 2.0 + vUv.x - 2.0;
  delayValue = clamp(delayValue, 0.0, 1.0);

  vec2 translateValue = p + delayValue * accel;
  vec2 translateValue1 = vec2(-0.5, 1.0) * translateValue;
  vec2 translateValue2 = vec2(-0.5, 1.0) * (translateValue - 1.0 - accel);

  vec2 w = sin(sin(time) * vec2(0.0, 0.3) + vUv.yx * vec2(0.0, 4.0)) * vec2(0.0, 0.5);
  vec2 xy = w * (tri(p) * 0.5 + tri(delayValue) * 0.5);

  vec2 uv1 = vUv1 + translateValue1 + xy;
  vec2 uv2 = vUv1 + translateValue2 + xy;

  vec4 rgba1 = texture2D(texture1, mirrored(uv1));
  vec4 rgba2 = texture2D(texture2, mirrored(uv2));

  gl_FragColor = mix(rgba1, rgba2, delayValue);
}
`;
