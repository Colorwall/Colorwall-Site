'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { useLusionGeometry } from './useLusionGeometry';
import { useTexture } from '@react-three/drei';

function LusionMeshes({ theme, scrollProgress }: { theme: 'dark' | 'light', scrollProgress: { current: number } }) {
  // Decode the completely proprietary binary format!
  const personGeometry = useLusionGeometry('/lusion-assets/person.buf');
  const terrainGeometry = useLusionGeometry('/lusion-assets/terrain.buf');

  // Load the webp textures
  const personTexture = useTexture('/lusion-assets/person_light.webp');
  const terrainTexture = useTexture('/lusion-assets/terrain_shadow_light_height.webp');

  // The textures might need to be flipped vertically depending on how Lusion exported them
  personTexture.flipY = false;
  terrainTexture.flipY = false;
  personTexture.colorSpace = THREE.SRGBColorSpace;
  terrainTexture.colorSpace = THREE.SRGBColorSpace;

  const meshRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    // The user mentioned it "doesn't stay on ground". 
    // This is because we're rotating the whole group! We should stop rotating it.
    // Let's just slightly gently float the astronaut instead.
    const time = _.clock.elapsedTime;
    if (meshRef.current.children[0]) {
      // Gentle floating animation for the astronaut
      meshRef.current.children[0].position.y = Math.sin(time * 2) * 0.1;
    }
    
    // We can also apply the opacity fade as we zoom out
    const r = scrollProgress.current;
    meshRef.current.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
            const mat = child.material as THREE.MeshBasicMaterial;
            if (mat && mat.opacity !== undefined) {
                // Approximate a fade base on the original opacities
                mat.opacity = THREE.MathUtils.lerp(mat.opacity, 1 - r * 0.8, 0.1);
            }
        }
    });
  });

  return (
    <group ref={meshRef} position={[0, -2, 0]}>
      {/* Astronaut Mesh */}
      {personGeometry && (
        <mesh geometry={personGeometry} scale={[5, 5, 5]} position={[0, 0, 0]}>
          <meshBasicMaterial 
            map={personTexture} 
            transparent={true} 
            opacity={1.0}
            depthWrite={true}
          />
        </mesh>
      )}

      {/* Terrain Mesh */}
      {terrainGeometry && (
        <mesh geometry={terrainGeometry} scale={[5, 5, 5]} position={[0, 0, 0]}>
          <meshBasicMaterial 
            map={terrainTexture} 
            transparent={true}
            opacity={0.8}
            depthWrite={false}
          />
        </mesh>
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
      <LusionMeshes theme={theme} scrollProgress={scrollProgress} />
    </>
  );
}