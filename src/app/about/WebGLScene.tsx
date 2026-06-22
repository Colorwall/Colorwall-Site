'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { useLusionGeometry } from './useLusionGeometry';
import { useTexture } from '@react-three/drei';

function RealParticleField({ theme, scrollProgress }: { theme: 'dark' | 'light', scrollProgress: { current: number } }) {
  const personGeometry = useLusionGeometry('/lusion-assets/person.buf');
  const terrainGeometry = useLusionGeometry('/lusion-assets/terrain.buf');

  const personTexture = useTexture('/lusion-assets/person_light.webp');
  const terrainTexture = useTexture('/lusion-assets/terrain_shadow_light_height.webp');

  const pointsRef = useRef<THREE.Group>(null);

  // Astronaut Point Shader
  const shaderMaterialPerson = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: personTexture },
        uOpacity: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          // Significantly larger point size so they merge into a "solid" shell
          gl_PointSize = 15.0 * (1.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          vec4 texColor = texture2D(uTexture, vUv);
          // If the texture is dark, discard it so we don't draw black squares
          if (texColor.a < 0.1) discard;
          gl_FragColor = vec4(texColor.rgb, texColor.a * uOpacity);
        }
      `,
      transparent: true,
      blending: THREE.NormalBlending, // Normal blending looks more solid than additive
      depthWrite: false,
    });
  }, [personTexture]);

  // Terrain Point Shader
  const shaderMaterialTerrain = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: terrainTexture },
        uOpacity: { value: 0.8 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 8.0 * (1.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          vec4 texColor = texture2D(uTexture, vUv);
          gl_FragColor = vec4(texColor.rgb, texColor.a * uOpacity);
        }
      `,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
  }, [terrainTexture]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    
    // Very slow panning of the entire environment
    pointsRef.current.rotation.y = Math.sin(_.clock.elapsedTime * 0.1) * 0.05;
    
    const r = scrollProgress.current;
    shaderMaterialPerson.uniforms.uOpacity.value = 1.0 - (r * 0.8);
    shaderMaterialTerrain.uniforms.uOpacity.value = 0.8 - (r * 0.5);
  });

  return (
    <group ref={pointsRef} position={[0, -0.5, 0]}>
      {/* Scale is 1x so they sit accurately in world space! */}
      {personGeometry && (
        <points geometry={personGeometry} material={shaderMaterialPerson} scale={[1, 1, 1]} position={[0, 0, 0]} />
      )}

      {terrainGeometry && (
        <points geometry={terrainGeometry} material={shaderMaterialTerrain} scale={[1, 1, 1]} position={[0, 0, 0]} />
      )}
    </group>
  );
}

/**
 * Custom scrollbar-less camera rig.
 * Reads the raw, hijacked wheel events and moves the camera into the sky.
 */
function CameraRig({ scrollProgress }: { scrollProgress: { current: number } }) {
  useFrame((state) => {
    const r = scrollProgress.current; // 0 to 1
    
    // Start low and close (y = -3, z = 5)
    // End high up and far (y = 10, z = 25)
    const targetY = -3 + (r * 13);
    const targetZ = 5 + (r * 20);
    
    // Start looking straight, end looking down and sideways
    const targetRotX = r * -0.4;
    const targetRotY = r * 0.3;

    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.05);
    state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, targetRotX, 0.05);
    state.camera.rotation.y = THREE.MathUtils.lerp(state.camera.rotation.y, targetRotY, 0.05);
  });
  return null;
}

export function WebGLAboutScene({ theme, scrollProgress }: { theme: 'dark' | 'light', scrollProgress: { current: number } }) {
  return (
    <>
      <fog attach="fog" args={[theme === 'dark' ? '#080809' : '#f8fafc', 5, 30]} />
      <CameraRig scrollProgress={scrollProgress} />
      <RealParticleField theme={theme} scrollProgress={scrollProgress} />
    </>
  );
}