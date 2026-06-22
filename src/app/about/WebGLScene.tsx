'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Custom hook to load raw binary .buf files and cast them to Float32Arrays.
 * Lusion stores point cloud geometry directly as binary buffers to save space.
 */
function useBinaryGeometry(url: string) {
  const [positions, setPositions] = useState<Float32Array | null>(null);
  
  useEffect(() => {
    fetch(url)
      .then(res => res.arrayBuffer())
      .then(buffer => {
        // Cast the raw ArrayBuffer to 32-bit floats
        setPositions(new Float32Array(buffer));
      })
      .catch(err => console.error("Failed to load geometry:", url, err));
  }, [url]);
  
  return positions;
}

function RealParticleField({ theme, scrollProgress }: { theme: 'dark' | 'light', scrollProgress: { current: number } }) {
  // Load the successfully pirated assets from lusion.dev
  const personPositions = useBinaryGeometry('/lusion-assets/person.buf');
  const terrainPositions = useBinaryGeometry('/lusion-assets/terrain.buf');

  const pointsRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    // Extremely slow, eerie rotation
    pointsRef.current.rotation.y += delta * 0.05;
    
    // Fade out as you zoom away
    const r = scrollProgress.current;
    pointsRef.current.children.forEach(child => {
        if (child instanceof THREE.Points) {
            const mat = child.material as THREE.PointsMaterial;
            if (mat && mat.opacity !== undefined) {
                // Approximate a fade base on the original opacities
                const baseOpacity = child === pointsRef.current?.children[0] ? 0.8 : 0.4;
                mat.opacity = THREE.MathUtils.lerp(mat.opacity, baseOpacity * (1 - r * 0.8), 0.1);
            }
        }
    });
  });

  return (
    <group ref={pointsRef}>
      {/* Astronaut Point Cloud */}
      {personPositions && (
        <points scale={[15, 15, 15]} position={[0, -2, 0]}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[personPositions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.03}
            color={theme === 'dark' ? '#ffffff' : '#000000'}
            transparent
            opacity={0.8}
            depthWrite={false}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {/* Terrain Point Cloud */}
      {terrainPositions && (
        <points scale={[15, 15, 15]} position={[0, -2, 0]}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[terrainPositions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.02}
            color={theme === 'dark' ? '#a5b4fc' : '#4f46e5'}
            transparent
            opacity={0.4}
            depthWrite={false}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>
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