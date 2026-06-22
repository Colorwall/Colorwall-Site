import extracted from './extracted.json';

const GET_BLUE_NOISE = `#define GLSLIFY 1
uniform sampler2D u_blueNoiseTexture;
uniform vec2 u_blueNoiseTexelSize;
uniform vec2 u_blueNoiseCoordOffset;
vec3 getBlueNoise(vec2 coord) {
  return texture2D(u_blueNoiseTexture, coord * u_blueNoiseTexelSize + u_blueNoiseCoordOffset).rgb;
}`;

const GET_LIGHT_UV = `#define GLSLIFY 1
uniform vec2 u_lightShadowTextureTexelSize;
vec2 getLightUv(vec3 lightToWorld) {
  float flatYScale = 1.5;
  vec2 flatUv = normalize(lightToWorld * vec3(1., flatYScale, 1.)).xz;
  vec2 dir = abs(normalize(flatUv));
  flatUv = (flatUv * (dir.y > dir.x ? 1. / dir.y : 1. / dir.x) * 0.5 + 0.5) * vec2(1., 0.5);
  float isTop = lightToWorld.y > 0.0 ? 1.0 : 0.0;
  float halfTexelY = u_lightShadowTextureTexelSize.y * 0.5;
  flatUv.y = clamp(0. + isTop * halfTexelY, 0.5 - (1. - isTop) * halfTexelY, flatUv.y);
  return flatUv + vec2(0., isTop * 0.5);
}`;

// Analytic light-field stub (no 64³ volume) — clusters energy around the hero light
const LIGHT_FIELD_SLICE = `#define GLSLIFY 1
vec3 lightFieldPosToGrid(vec3 pos) {
  return (pos - vec3(0.0, 8.0, 0.0)) * vec3(0.1, 0.14, 0.1) + vec3(32.0);
}
vec3 clampLightFieldGrid(vec3 grid) { return clamp(grid, vec3(0.5), vec3(63.5)); }
vec3 clampedLightFieldPosToGrid(vec3 pos) { return clampLightFieldGrid(lightFieldPosToGrid(pos)); }
vec4 sampleLightField(sampler2D tex, vec3 gridPos) {
  vec3 wp = (gridPos - vec3(32.0)) / vec3(0.1, 0.14, 0.1) + vec3(0.0, 8.0, 0.0);
  float d = length(wp - vec3(0.0, 8.0, 0.0));
  float e = exp(-d * 0.38) * smoothstep(16.0, 0.8, d);
  e = clamp(e + 0.06, 0.0, 1.0);
  return vec4(e, e * 0.92, e * 0.88, e);
}`;

const CHUNKS: Record<string, string> = {
  getScatter: extracted.getScatter,
  getBlueNoise: GET_BLUE_NOISE,
  getLightUv: GET_LIGHT_UV,
  lightFieldSlice: LIGHT_FIELD_SLICE,
  aboutHeroVisualFinal_vert: extracted.aboutHeroVisualFinalVert,
  // Lusion encodes luminance in .r and depth in .g for post-processing.
  aboutHeroVisualFinal_frag: 'gl_FragColor.rgb = vec3(gl_FragColor.r);',
  // Particle bloom pass — bright luma only, no scatter bleed
  particleBloomFinal_frag:
    'float luma = mix(gl_FragColor.r, 1.0, u_emissiveRatio * 0.55); gl_FragColor = vec4(vec3(luma * 2.1), 1.0);',
};

export function buildShader(source: string, defines: Record<string, string | number> = {}) {
  let result = source;

  const defineLines = Object.entries(defines)
    .map(([k, v]) => `#define ${k} ${v}`)
    .join('\n');

  if (defineLines) {
    result = defineLines + '\n' + result;
  }

  for (let pass = 0; pass < 8; pass++) {
    let changed = false;
    for (const [name, chunk] of Object.entries(CHUNKS)) {
      const token = `#include <${name}>`;
      if (result.includes(token)) {
        result = result.split(token).join(chunk);
        changed = true;
      }
    }
    if (!changed) break;
  }

  return result;
}

export const SHADERS = {
  groundVert: extracted.groundVert,
  groundFrag: extracted.groundFrag.replace(
    /#include <aboutHeroVisualFinal_frag>[\s\S]*?gl_FragColor\.a=[^}]+\}/,
    '#include <aboutHeroVisualFinal_frag>\ngl_FragColor.a = 1.0;}',
  ),
  rockVert: extracted['vert$8'],
  rockFrag: extracted['frag$c'],
  personVert: extracted['vert$6'],
  personFrag: extracted['frag$9'].replace(
    'gl_FragColor.rgb+=getScatter(cameraPosition,v_worldPosition);',
    'gl_FragColor.r=max(gl_FragColor.r,color.r*0.92);',
  ),
  shadowVert: extracted.shadowVert,
  shadowFrag: extracted.shadowFrag,
  groundShadowFrag: extracted['frag$b'],
  particleVert: extracted['vert$9'],
  // Base pass — visible particle bodies (matches Lusion frag$d output)
  particleFrag: extracted['frag$d']
    .replace('shade+=getScatter(cameraPosition,v_worldPosition)*1.35;', '')
    .replace('#include <aboutHeroVisualFinal_frag>', '#include <aboutHeroVisualFinal_frag>'),
  // Bloom mask pass — bright cores only
  particleFragBloom: extracted['frag$d']
    .replace('vec3 noise=getBlueNoise(gl_FragCoord.xy);', 'vec3 noise=vec3(0.5);')
    .replace('shade+=getScatter(cameraPosition,v_worldPosition)*1.35;', '')
    .replace('#include <aboutHeroVisualFinal_frag>', '#include <particleBloomFinal_frag>'),
};
