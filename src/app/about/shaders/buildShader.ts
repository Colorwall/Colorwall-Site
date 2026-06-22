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

const CHUNKS: Record<string, string> = {
  getScatter: extracted.getScatter,
  getBlueNoise: GET_BLUE_NOISE,
  getLightUv: GET_LIGHT_UV,
  aboutHeroVisualFinal_vert: extracted.aboutHeroVisualFinalVert,
  // Lusion encodes luminance in .r and depth in .g for post-processing.
  // Output grayscale directly since we composite with bloom only.
  aboutHeroVisualFinal_frag: 'gl_FragColor.rgb = vec3(gl_FragColor.r);',
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
};
