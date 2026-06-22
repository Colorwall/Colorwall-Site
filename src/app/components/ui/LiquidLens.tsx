'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, MeshTransmissionMaterial, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function LensBlob() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, pointer } = useThree();
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Smoothly move the droplet towards the mouse
    const targetX = (pointer.x * viewport.width) / 2;
    const targetY = (pointer.y * viewport.height) / 2;
    
    meshRef.current.position.x += (targetX - meshRef.current.position.x) * delta * 5;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * delta * 5;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 2]} scale={[1, 1, 0.2]}>
      {/* A flat, smooth sphere acts like a puddle/droplet of water when scaled on Z */}
      <sphereGeometry args={[0.8, 64, 64]} />
      <MeshTransmissionMaterial
        buffer={undefined}
        thickness={2}
        roughness={0}
        transmission={1}
        ior={1.1}
        chromaticAberration={0.15}
        backside={false}
        distortion={0.1}
        distortionScale={0.1}
        temporalDistortion={0.0}
        color="#ffffff"
        resolution={1024}
      />
    </mesh>
  );
}

export function LiquidLens({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  return <LensBlob />;
}
