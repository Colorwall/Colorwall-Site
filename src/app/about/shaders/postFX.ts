/** Buffer AboutPageHeroEfx — matches fragmentShader$1 from buffer_bundle.js */
export const COLOR_GRADE_FRAG = `
uniform sampler2D tScene;
uniform vec3 u_colorBurn;
uniform float u_colorBurnAlpha;
uniform vec3 u_colorDodge;
uniform float u_colorDodgeAlpha;
varying vec2 vUv;

vec3 colorDodge(vec3 src, vec3 dst) {
  return mix(step(0.0, src) * (min(vec3(1.0), dst / (1.0 - src))), vec3(1.0), step(1.0, dst));
}

vec3 colorBurn(vec3 src, vec3 dst) {
  return mix(step(0.0, src) * (1.0 - min(vec3(1.0), (1.0 - dst) / src)), vec3(1.0), step(1.0, dst));
}

void main() {
  vec4 tex = texture2D(tScene, vUv);
  vec3 burned = mix(tex.rgb, colorBurn(u_colorBurn, tex.rgb), u_colorBurnAlpha);
  vec3 dodged = mix(tex.rgb, colorDodge(u_colorDodge, tex.rgb), u_colorDodgeAlpha);
  tex.rgb = mix(burned, dodged, tex.rgb);
  gl_FragColor = vec4(tex.rgb, 1.0);
}
`;

/** Buffer Bloom highPassFrag USE_HALO — lens ghost reflections from bright scene areas */
export const LENS_HALO_FRAG = `
uniform sampler2D tScene;
uniform vec2 u_resolution;
uniform vec2 u_texelSize;
uniform float u_haloWidth;
uniform float u_haloRGBShift;
uniform float u_haloStrength;
uniform float u_haloMaskInner;
uniform float u_haloMaskOuter;
varying vec2 vUv;

void main() {
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  float l = u_resolution.y / length(u_resolution);
  aspect = vec2(u_resolution.x / u_resolution.y * l, l);

  vec2 toCenter = (vUv - 0.5) * aspect;
  vec2 ghostUv = 1.0 - (toCenter + 0.5);
  vec2 ghostVec = vec2(0.5) - ghostUv;
  vec2 direction = normalize(ghostVec);
  vec2 haloVec = direction * u_haloWidth;
  float weight = length(vec2(0.5) - fract(ghostUv + haloVec));
  weight = pow(1.0 - weight, 3.0);
  vec3 distortion = vec3(-u_texelSize.x, 0.0, u_texelSize.x) * u_haloRGBShift;
  float zoomBlurRatio = fract(atan(toCenter.y, toCenter.x) * 40.0) * 0.05 + 0.95;
  ghostUv *= zoomBlurRatio;
  vec2 haloUv = ghostUv + haloVec;
  vec3 halo = vec3(
    texture2D(tScene, haloUv + direction * distortion.r).r,
    texture2D(tScene, haloUv + direction * distortion.g).g,
    texture2D(tScene, haloUv + direction * distortion.b).b
  ) * u_haloStrength * smoothstep(u_haloMaskInner, u_haloMaskOuter, length(toCenter));

  gl_FragColor = vec4(halo, 1.0);
}
`;
