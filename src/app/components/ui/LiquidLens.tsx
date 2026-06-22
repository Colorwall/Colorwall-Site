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
    
    // Smoothly move the blob towards the mouse
    const targetX = (pointer.x * viewport.width) / 2;
    const targetY = (pointer.y * viewport.height) / 2;
    
    // Custom easing for that heavy, fluid feel
    meshRef.current.position.x += (targetX - meshRef.current.position.x) * delta * 3;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * delta * 3;
    
    // Slowly rotate it
    meshRef.current.rotation.x += delta * 0.2;
    meshRef.current.rotation.y += delta * 0.3;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 2]}>
      {/* A complex geometry that looks liquid/organic */}
      <icosahedronGeometry args={[2.5, 32]} />
      <MeshTransmissionMaterial
        buffer={undefined}
        thickness={1.5}
        roughness={0}
        transmission={1}
        ior={1.2}
        chromaticAberration={0.4}
        backside={false}
        distortion={0.5}
        distortionScale={0.2}
        temporalDistortion={0.1}
        color="#ffffff"
        resolution={1024}
      />
    </mesh>
  );
}

function SceneText({ theme }: { theme: 'dark' | 'light' }) {
  const { width } = useThree((state) => state.viewport);
  const fontSize = width < 8 ? width * 0.15 : width * 0.12;

  return (
    <group position={[0, 0, -2]}>
      <Text
        position={[0, 1.5, 0]}
        fontSize={fontSize}
        color={theme === 'dark' ? '#ffffff' : '#000000'}
        anchorX="center"
        anchorY="middle"
        letterSpacing={-0.05}
        fontWeight="bold"
      >
        Bold Ideas,
      </Text>
      <Text
        position={[0, -1.5, 0]}
        fontSize={fontSize}
        color={theme === 'dark' ? '#ffffff' : '#000000'}
        anchorX="center"
        anchorY="middle"
        letterSpacing={-0.05}
        fontWeight="bold"
      >
        Brought to Life
      </Text>
    </group>
  );
}

export function LiquidLens({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  return (
    <div className="w-full h-screen absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 10], fov: 35 }}>
        <ambientLight intensity={theme === 'dark' ? 0.5 : 2} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        
        <SceneText theme={theme} />
        <LensBlob />
        
        <Environment preset={theme === 'dark' ? "city" : "studio"} />
      </Canvas>
    </div>
  );
}
