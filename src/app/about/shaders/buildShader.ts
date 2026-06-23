import extracted from './extracted.json';

// From public/lusion-assets shaders — lightFieldSlice.glsl (matches lusion_bundle.js sliceShader)
const LIGHT_FIELD_SLICE = `uniform vec2 u_lightFieldSlicedTextureSize;uniform vec2 u_lightFieldSliceColRowCount;uniform vec3 u_lightFieldGridCount;uniform vec3 u_lightFieldVolumeOffset;uniform vec3 u_lightFieldVolumeSize;vec2 lightFieldGridToUv(vec3 grid){vec2 uv=grid.xy;vec2 colRow=floor(vec2(mod(grid.z,u_lightFieldSliceColRowCount.x),grid.z/u_lightFieldSliceColRowCount.x));uv+=colRow*u_lightFieldGridCount.xy+.5;return uv/u_lightFieldSlicedTextureSize;}vec3 lightFieldGridToUv3(vec3 grid){return grid/u_lightFieldGridCount;}vec3 clampLightFieldGrid(vec3 grid){return clamp(grid,vec3(.5),u_lightFieldGridCount-vec3(.5));}vec3 lightFieldPosToGrid(vec3 pos){return(pos-u_lightFieldVolumeOffset)/u_lightFieldVolumeSize*u_lightFieldGridCount;}vec3 clampedLightFieldPosToGrid(vec3 pos){return clampLightFieldGrid(lightFieldPosToGrid(pos));}vec4 sampleLightField(sampler2D tex,vec3 gridPos){gridPos.z-=.5;vec2 uv1=lightFieldGridToUv(clampLightFieldGrid(vec3(gridPos.xy,floor(gridPos.z)+.5)));vec2 uv2=lightFieldGridToUv(clampLightFieldGrid(vec3(gridPos.xy,ceil(gridPos.z)+.5)));return mix(texture2D(tex,uv1),texture2D(tex,uv2),fract(gridPos.z));}`;

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
  lightFieldSlice: LIGHT_FIELD_SLICE,
  aboutHeroVisualFinal_vert: extracted.aboutHeroVisualFinalVert,
  // Lusion encodes luminance in .r — prepass .rrra also handles this at composite time.
  aboutHeroVisualFinal_frag: 'gl_FragColor.rgb = vec3(gl_FragColor.r);',
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
    `#include <aboutHeroVisualFinal_frag>
gl_FragColor.r=mix(gl_FragColor.r,shadow*(1.-abs(N.y)),u_hudRatio);
gl_FragColor.r*=u_sceneRatio;
gl_FragColor.rgb=vec3(gl_FragColor.r);
gl_FragColor.a=1.0;}`,
  ),
  rockVert: extracted['vert$8'],
  rockFrag: extracted['frag$c'].replace(
    '#include <aboutHeroVisualFinal_frag>\n}',
    '#include <aboutHeroVisualFinal_frag>\ngl_FragColor.rgb=vec3(gl_FragColor.r);gl_FragColor.a=1.0;}',
  ),
  personVert: extracted['vert$6'],
  personFrag: extracted['frag$9'].replace(
    'gl_FragColor.r*=u_sceneRatio*(1.-u_hudRatio);}',
    'gl_FragColor.r*=u_sceneRatio*(1.-u_hudRatio);gl_FragColor.rgb=vec3(gl_FragColor.r);gl_FragColor.a=1.0;}',
  ),
  shadowVert: extracted.shadowVert,
  shadowFrag: extracted.shadowFrag,
  groundShadowFrag: extracted['frag$b'],
  particleVert: extracted['vert$9'],
  particleFrag: extracted['frag$d'].replace(
    'gl_FragColor=vec4(mix(shade,smoothstep(0.,1.,shade),0.5),v_depth,1.,mix(v_diff*v_diff+v_emission,1.,u_emissiveRatio));',
    'gl_FragColor=vec4(mix(shade,smoothstep(0.,1.,shade),0.5),v_depth,1.,mix(v_diff*v_diff+v_emission,1.,u_emissiveRatio));\n#include <aboutHeroVisualFinal_frag>\ngl_FragColor.a=1.0;',
  ),
  particleFragBloom: extracted['frag$d']
    .replace('vec3 noise=getBlueNoise(gl_FragCoord.xy);', 'vec3 noise=vec3(0.5);')
    .replace(
      'gl_FragColor=vec4(mix(shade,smoothstep(0.,1.,shade),0.5),v_depth,1.,mix(v_diff*v_diff+v_emission,1.,u_emissiveRatio));',
      'gl_FragColor=vec4(mix(shade,smoothstep(0.,1.,shade),0.5),v_depth,1.,mix(v_diff*v_diff+v_emission,1.,u_emissiveRatio));\n#include <particleBloomFinal_frag>',
    ),
};
