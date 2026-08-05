import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import gsap from 'gsap';

/**
 * Port of a THREE.BAS "up in smoke" text-shatter demo.
 *
 * Unlike the "twisting in the wind" variant, this one uses an *unlit*
 * material (MeshBasicMaterial) and no rotation — each face drifts away
 * from its own centroid along a cubic bezier path, staggered by its
 * horizontal/vertical position in the text (so it reads left-to-right,
 * bottom-to-top, like smoke dispersing), then reassembles (yoyo).
 *
 * npm i three gsap
 * Needs a three.js-compatible "typeface" JSON font in /public, e.g.
 * node_modules/three/examples/fonts/helvetiker_bold.typeface.json
 */

export interface UpInSmokeProps {
  text?: string;
  fontUrl?: string;
  size?: number;
  color?: number | string;
  backgroundColor?: number | string;
  duration?: number;
  repeatDelay?: number;
  className?: string;
  style?: React.CSSProperties;
}

const EASE_OUT_CUBIC = /* glsl */ `
float easeOutCubic(float t, float b, float c, float d) {
  t /= d;
  t--;
  return c * (t * t * t + 1.0) + b;
}
`;

const CUBIC_BEZIER = /* glsl */ `
vec3 cubicBezier(vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t) {
  float tn = 1.0 - t;
  return tn * tn * tn * p0 +
         3.0 * tn * tn * t * p1 +
         3.0 * tn * t * t * p2 +
         t * t * t * p3;
}
`;

function randFloat(min: number, max: number) {
  return min + Math.random() * (max - min);
}
function randFloatSpread(range: number) {
  return range * (0.5 - Math.random());
}

export default function UpInSmoke({
  text = 'UP IN SMOKE',
  fontUrl = '/fonts/helvetiker_bold.typeface.json',
  size = 14,
  color = 0x000000,
  backgroundColor = 0xffffff,
  duration = 4,
  repeatDelay = 0.25,
  className,
  style,
}: UpInSmokeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let raf = 0;

    // --- renderer / scene / camera ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setClearColor(backgroundColor as THREE.ColorRepresentation);
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      1,
      10000
    );
    camera.position.set(0, 0, 400);

    const scene = new THREE.Scene();

    let mesh: THREE.Mesh | null = null;
    const uTime = { value: 0 };
    let tl: gsap.core.Timeline | null = null;
    const animObj = { progress: 0 };

    function resize() {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }
    resize();
    window.addEventListener('resize', resize);

    function tick() {
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }
    tick();

    // --- scrubber (mouse + touch via pointer events) ---
    let pointerDown = false;
    let lastX = 0;
    const seekSpeed = 0.001;

    function stopTween() {
      if (tl) gsap.to(tl, { timeScale: 0, duration: 2 });
    }
    function resumeTween() {
      if (tl) gsap.to(tl, { timeScale: 1, duration: 2 });
    }
    function onPointerDown(e: PointerEvent) {
      pointerDown = true;
      lastX = e.clientX;
      container!.style.cursor = 'ew-resize';
      stopTween();
    }
    function onPointerUp() {
      pointerDown = false;
      container!.style.cursor = 'pointer';
      resumeTween();
    }
    function onPointerMove(e: PointerEvent) {
      if (!pointerDown || !tl) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      const p = THREE.MathUtils.clamp(tl.progress() + dx * seekSpeed, 0, 1);
      tl.progress(p);
    }
    container.style.cursor = 'pointer';
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);

    // --- build the shattered text mesh ---
    const loader = new FontLoader();
    loader.load(
      fontUrl,
      (font: Font) => {
        if (disposed) return;

        const textGeo = new TextGeometry(text, {
          font,
          size,
          depth: 0,
          bevelEnabled: true,
          bevelThickness: 0.5,
          bevelSize: 0.75,
        }).toNonIndexed(); // equivalent of the original separateFaces()

        textGeo.computeBoundingBox();
        const bbox = textGeo.boundingBox!;
        const w = bbox.max.x - bbox.min.x;
        const h = bbox.max.y - bbox.min.y;
        const d = bbox.max.z - bbox.min.z;
        // anchor {x:0.5, y:0, z:0.5} -> centered horizontally, bottom-anchored vertically
        // (matches the original's literal -size*anchor translation, no bbox.min correction)
        textGeo.translate(-w * 0.5, -h * 0.0, -d * 0.5);

        const posAttr = textGeo.getAttribute('position') as THREE.BufferAttribute;
        const faceCount = posAttr.count / 3;

        const maxDelayX = 2.0;
        const maxDelayY = 0.25;
        const minDuration = 2;
        const maxDuration = 8;
        const stretch = 0.25;

        const aAnimation = new Float32Array(faceCount * 3 * 2);
        const aCentroid = new Float32Array(faceCount * 3 * 3);
        const aControl0 = new Float32Array(faceCount * 3 * 3);
        const aControl1 = new Float32Array(faceCount * 3 * 3);
        const aEndPosition = new Float32Array(faceCount * 3 * 3);

        const v0 = new THREE.Vector3();
        const v1 = new THREE.Vector3();
        const v2 = new THREE.Vector3();
        const centroid = new THREE.Vector3();

        for (let f = 0; f < faceCount; f++) {
          const base = f * 3;
          v0.fromBufferAttribute(posAttr, base);
          v1.fromBufferAttribute(posAttr, base + 1);
          v2.fromBufferAttribute(posAttr, base + 2);
          centroid.copy(v0).add(v1).add(v2).divideScalar(3);

          const delayX = Math.max(0, (centroid.x / w) * maxDelayX);
          const delayY = Math.max(0, (1.0 - centroid.y / h) * maxDelayY);
          const dly = delayX + delayY + Math.random() * stretch;
          const dur = randFloat(minDuration, maxDuration);

          const c0x = centroid.x + randFloat(40, 120);
          const c0y = centroid.y + h * randFloat(0.0, 12.0);
          const c0z = randFloatSpread(120);

          const c1x = centroid.x + randFloat(80, 120) * -1;
          const c1y = centroid.y + h * randFloat(0.0, 12.0);
          const c1z = randFloatSpread(120);

          const endX = centroid.x + randFloatSpread(120);
          const endY = centroid.y + h * randFloat(0.0, 12.0);
          const endZ = randFloat(-20, 20);

          for (let v = 0; v < 3; v++) {
            const i2 = (base + v) * 2;
            const i3 = (base + v) * 3;

            aAnimation[i2] = dly;
            aAnimation[i2 + 1] = dur;

            aCentroid[i3] = centroid.x;
            aCentroid[i3 + 1] = centroid.y;
            aCentroid[i3 + 2] = centroid.z;

            aControl0[i3] = c0x;
            aControl0[i3 + 1] = c0y;
            aControl0[i3 + 2] = c0z;

            aControl1[i3] = c1x;
            aControl1[i3 + 1] = c1y;
            aControl1[i3 + 2] = c1z;

            aEndPosition[i3] = endX;
            aEndPosition[i3 + 1] = endY;
            aEndPosition[i3 + 2] = endZ;
          }
        }

        textGeo.setAttribute('aAnimation', new THREE.BufferAttribute(aAnimation, 2));
        textGeo.setAttribute('aCentroid', new THREE.BufferAttribute(aCentroid, 3));
        textGeo.setAttribute('aControl0', new THREE.BufferAttribute(aControl0, 3));
        textGeo.setAttribute('aControl1', new THREE.BufferAttribute(aControl1, 3));
        textGeo.setAttribute('aEndPosition', new THREE.BufferAttribute(aEndPosition, 3));

        const material = new THREE.MeshBasicMaterial({
          color,
          side: THREE.DoubleSide,
          transparent: true,
        });

        material.onBeforeCompile = (shader) => {
          shader.uniforms.uTime = uTime;

          shader.vertexShader = shader.vertexShader
            .replace(
              '#include <common>',
              `#include <common>
              uniform float uTime;
              attribute vec2 aAnimation;
              attribute vec3 aCentroid;
              attribute vec3 aControl0;
              attribute vec3 aControl1;
              attribute vec3 aEndPosition;
              ${EASE_OUT_CUBIC}
              ${CUBIC_BEZIER}`
            )
            .replace(
              '#include <begin_vertex>',
              `
              float tDelay = aAnimation.x;
              float tDuration = aAnimation.y;
              float tTime = clamp(uTime - tDelay, 0.0, tDuration);
              float tProgress = easeOutCubic(tTime, 0.0, 1.0, tDuration);

              vec3 transformed = vec3(position);
              vec3 tPosition = transformed - aCentroid;
              tPosition *= 1.0 - tProgress;
              tPosition += aCentroid;
              tPosition += cubicBezier(tPosition, aControl0, aControl1, aEndPosition, tProgress);
              transformed = tPosition;
              `
            );

          material.userData.shader = shader;
        };

        mesh = new THREE.Mesh(textGeo, material);
        mesh.position.y = -40;
        mesh.frustumCulled = false;
        scene.add(mesh);

        const animationDuration = maxDelayX + maxDelayY + maxDuration - 3;

        tl = gsap.timeline({ repeat: -1, repeatDelay, yoyo: true });
        tl.fromTo(
          animObj,
          { progress: 0 },
          {
            progress: 1.0,
            duration,
            ease: 'power1.inOut',
            onUpdate: () => {
              uTime.value = animationDuration * animObj.progress;
            },
          }
        );
      },
      undefined,
      (err) => console.error('Failed to load font for UpInSmoke:', err)
    );

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
      tl?.kill();
      if (mesh) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [text, fontUrl, size, color, backgroundColor, duration, repeatDelay]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', ...style }}
    />
  );
}