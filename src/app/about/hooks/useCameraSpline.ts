import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { fetchBuffer } from '../parseBuffer';

export interface SplineFrame {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
}

export interface ScrollPhases {
  introRatio: number;
  initialSplineRatio: number;
  panningSplineRatio: number;
  hudRatio: number;
  splineT: number;
}

export function useCameraSpline(url = '/shaders/camera_spline.buf') {
  const [frames, setFrames] = useState<SplineFrame[] | null>(null);

  useEffect(() => {
    fetchBuffer(url).then(({ header, raw }) => {
      const count = header.vertexCount;
      const orient = raw.orient as Float32Array;
      const positionPacked = raw.position as Uint16Array;

      const packs = header.attributes.find((a) => a.id === 'position')!.packedComponents!;
      const result: SplineFrame[] = [];

      for (let i = 0; i < count; i++) {
        const x = packs[0].from + (positionPacked[i * 3] / 65535) * packs[0].delta;
        const y = packs[1].from + (positionPacked[i * 3 + 1] / 65535) * packs[1].delta;
        const z = packs[2].from + (positionPacked[i * 3 + 2] / 65535) * packs[2].delta;

        result.push({
          position: new THREE.Vector3(x, y, z),
          quaternion: new THREE.Quaternion(
            orient[i * 4],
            orient[i * 4 + 1],
            orient[i * 4 + 2],
            orient[i * 4 + 3],
          ),
        });
      }

      setFrames(result);
    });
  }, [url]);

  return frames;
}

export function getScrollPhases(scroll: number): ScrollPhases {
  const introRatio = Math.min(scroll / 0.85, 1);
  const initialSplineRatio = introRatio;
  const panningSplineRatio = scroll > 0.85 ? (scroll - 0.85) / 0.15 : 0;
  const hudRatio = scroll > 0.85 ? Math.min((scroll - 0.85) / 0.15, 1) : 0;
  const splineT = initialSplineRatio * 149 + panningSplineRatio * 50;
  return { introRatio, initialSplineRatio, panningSplineRatio, hudRatio, splineT };
}

const _forward = new THREE.Vector3();

export function sampleSpline(frames: SplineFrame[], t: number) {
  const clamped = Math.max(0, Math.min(frames.length - 1, t));
  const floor = Math.floor(clamped);
  const ceil = Math.min(frames.length - 1, floor + 1);
  const fract = clamped - floor;

  const position = frames[floor].position.clone().lerp(frames[ceil].position, fract);
  const quaternion = frames[floor].quaternion.clone().slerp(frames[ceil].quaternion, fract);

  const lookAt = position
    .clone()
    .add(_forward.set(0, 0, 1).applyQuaternion(quaternion));

  return { position, quaternion, lookAt };
}

/** Buffer eases camera toward spline; weaker follow as zoom-out progresses. */
export function getCameraFollowStrength(initialSplineRatio: number) {
  return THREE.MathUtils.lerp(0.1, 0.035, initialSplineRatio);
}

export { introRatioFromScroll } from '../mathUtils';

// Legacy helper
export function scrollToSplineT(scroll: number) {
  return getScrollPhases(scroll).splineT;
}
