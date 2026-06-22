'use client';

import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Image as DreiImage, useScroll, Scroll, ScrollControls } from '@react-three/drei';
import * as THREE from 'three';
import { LiquidLens } from '@/app/components/ui/LiquidLens'; // We'll keep this for the droplet

// --- 3D Components ---

function HeroSection({ theme }: { theme: 'dark' | 'light' }) {
  const { width } = useThree((state) => state.viewport);
  const fontSize = width < 8 ? width * 0.12 : width * 0.1;

  return (
    <group position={[0, 0, -2]}>
      <Text
        position={[0, 1.2, 0]}
        fontSize={fontSize}
        color={theme === 'dark' ? '#ffffff' : '#000000'}
        anchorX="center"
        anchorY="middle"
        letterSpacing={-0.05}
        fontWeight="bold"
      >
        Built by one
      </Text>
      <Text
        position={[0, -1.2, 0]}
        fontSize={fontSize}
        color={theme === 'dark' ? '#a5b4fc' : '#4f46e5'}
        anchorX="center"
        anchorY="middle"
        letterSpacing={-0.05}
        fontWeight="bold"
      >
        stubborn dev.
      </Text>
    </group>
  );
}

function DevCard({ theme, yOffset }: { theme: 'dark' | 'light', yOffset: number }) {
  const { width, height } = useThree((state) => state.viewport);
  const isMobile = width < 8;
  const cardWidth = isMobile ? width * 0.8 : width * 0.5;
  
  return (
    <group position={[0, yOffset, -2]}>
      {/* Background Plane */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[cardWidth, isMobile ? 5 : 4]} />
        <meshBasicMaterial color={theme === 'dark' ? '#111111' : '#ffffff'} />
      </mesh>
      
      {/* Avatar Placeholder */}
      <mesh position={[-cardWidth/2 + 1.5, 0, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial color={theme === 'dark' ? '#333333' : '#dddddd'} />
      </mesh>

      {/* Text Group */}
      <group position={[-cardWidth/2 + 3.5, 0.5, 0]}>
        <Text fontSize={0.5} color={theme === 'dark' ? '#ffffff' : '#000000'} anchorX="left" fontWeight="bold">
          Oliver Laxenta
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.25} color={theme === 'dark' ? '#888888' : '#666666'} anchorX="left">
          @LaxentaInc · Laxenta Inc
        </Text>
        <Text position={[0, -1.5, 0]} fontSize={0.3} maxWidth={cardWidth - 4} color={theme === 'dark' ? '#aaaaaa' : '#444444'} anchorX="left" lineHeight={1.5}>
          Nunca te amé, pero lo estaba intentando. Well i am not spainish but the quote is for a specific someone who is.
        </Text>
      </group>
    </group>
  );
}

function ProjectsGrid({ theme, yOffset }: { theme: 'dark' | 'light', yOffset: number }) {
  const { width } = useThree((state) => state.viewport);
  
  return (
    <group position={[0, yOffset, -2]}>
      <Text position={[0, 3, 0]} fontSize={0.8} color={theme === 'dark' ? '#ffffff' : '#000000'} fontWeight="bold">
        Projects
      </Text>
      
      {/* Project 1 */}
      <group position={[-width * 0.25, 0, 0]}>
        <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[width * 0.4, 4]} />
          <meshBasicMaterial color={theme === 'dark' ? '#111111' : '#ffffff'} />
        </mesh>
        <Text position={[-width * 0.18, 1, 0]} fontSize={0.4} color={theme === 'dark' ? '#ffffff' : '#000000'} anchorX="left" fontWeight="bold">
          ColorWall
        </Text>
        <Text position={[-width * 0.18, 0, 0]} fontSize={0.25} maxWidth={width * 0.36} color={theme === 'dark' ? '#888888' : '#666666'} anchorX="left" lineHeight={1.5}>
          8K live wallpaper & desktop customization engine for Windows 10/11 — shaders, particles, store, library — all in 10mb.
        </Text>
      </group>

      {/* Project 2 */}
      <group position={[width * 0.25, 0, 0]}>
        <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[width * 0.4, 4]} />
          <meshBasicMaterial color={theme === 'dark' ? '#111111' : '#ffffff'} />
        </mesh>
        <Text position={[-width * 0.18, 1, 0]} fontSize={0.4} color={theme === 'dark' ? '#ffffff' : '#000000'} anchorX="left" fontWeight="bold">
          MTS Migrator
        </Text>
        <Text position={[-width * 0.18, 0, 0]} fontSize={0.25} maxWidth={width * 0.36} color={theme === 'dark' ? '#888888' : '#666666'} anchorX="left" lineHeight={1.5}>
          full code migrator of a javascript project to typescript with type inference and patching with ast!
        </Text>
      </group>
    </group>
  );
}

function StackGrid({ theme, yOffset }: { theme: 'dark' | 'light', yOffset: number }) {
  const icons = ['rust', 'ts', 'js', 'react', 'nextjs', 'vite', 'tauri', 'electron'];
  
  return (
    <group position={[0, yOffset, -2]}>
      <Text position={[0, 2, 0]} fontSize={0.8} color={theme === 'dark' ? '#ffffff' : '#000000'} fontWeight="bold">
        Stack
      </Text>
      
      {icons.map((icon, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const x = (col - 1.5) * 2.5;
        const y = -row * 2.5;
        
        return (
          <group key={icon} position={[x, y, 0]}>
            <mesh>
              <planeGeometry args={[1.5, 1.5]} />
              <meshBasicMaterial color={theme === 'dark' ? '#333333' : '#dddddd'} />
            </mesh>
            <Text position={[0, 0, 0.1]} fontSize={0.2} color={theme === 'dark' ? '#ffffff' : '#000000'}>
              {icon}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

export function WebGLAboutScene({ theme }: { theme: 'dark' | 'light' }) {
  const { height } = useThree((state) => state.viewport);

  return (
    <>
      {/* 
        This Scroll component renders its children in 3D space, 
        but their Y positions are driven by the HTML scrollbar automatically!
      */}
      <Scroll>
        <HeroSection theme={theme} />
        <DevCard theme={theme} yOffset={-height} />
        <ProjectsGrid theme={theme} yOffset={-height * 2} />
        <StackGrid theme={theme} yOffset={-height * 3} />
      </Scroll>
    </>
  );
}
