'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface FluidBackgroundProps {
  className?: string;
}

const MAX_POINTS = 30;

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uPoints[${MAX_POINTS}]; // x, y, age
uniform vec2 uVelocity[${MAX_POINTS}]; // vx, vy

varying vec2 vUv;

// Noise function for the base background
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;
  vec2 aspectUv = vec2(uv.x * aspect, uv.y);

  // Calculate fluid displacement from points
  vec2 displacement = vec2(0.0);
  for(int i = 0; i < ${MAX_POINTS}; i++) {
    if(uPoints[i].z > 0.0) {
      vec2 pointUv = vec2(uPoints[i].x * aspect, uPoints[i].y);
      float dist = distance(aspectUv, pointUv);
      
      // Radius of the distortion
      float radius = 0.2;
      float influence = smoothstep(radius, 0.0, dist);
      
      // Decay by age (z stores life from 1.0 to 0.0)
      influence *= pow(uPoints[i].z, 1.5); 
      
      displacement += uVelocity[i] * influence * 0.15;
    }
  }

  // Distort UVs
  vec2 distortedUv = uv - displacement;

  // Render a premium dark background with subtle noise and gradients
  float noise = snoise(distortedUv * 3.0 + uTime * 0.1) * 0.5 + 0.5;
  
  // Base colors
  vec3 color1 = vec3(0.05, 0.02, 0.1); // Deep violet/black
  vec3 color2 = vec3(0.15, 0.05, 0.25); // Dark purple
  vec3 color3 = vec3(0.02, 0.02, 0.02); // Pure dark
  
  vec3 finalColor = mix(color1, color2, noise);
  finalColor = mix(finalColor, color3, distortedUv.y);

  // Add chromatic aberration on the displacement edges
  float rDist = snoise((uv - displacement * 1.2) * 3.0 + uTime * 0.1) * 0.5 + 0.5;
  float bDist = snoise((uv - displacement * 0.8) * 3.0 + uTime * 0.1) * 0.5 + 0.5;
  
  finalColor.r += mix(0.0, 0.1, rDist) * length(displacement) * 10.0;
  finalColor.b += mix(0.0, 0.1, bDist) * length(displacement) * 10.0;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export const FluidBackground: React.FC<FluidBackgroundProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const points = new Float32Array(MAX_POINTS * 3); // x, y, age
    const velocity = new Float32Array(MAX_POINTS * 2); // vx, vy
    let pointIndex = 0;

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uPoints: { value: points },
      uVelocity: { value: velocity }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let lastMouse = new THREE.Vector2(0.5, 0.5);
    let lastScrollY = window.scrollY;
    
    const addPoint = (x: number, y: number, vx: number, vy: number) => {
      // Normalize coords to 0..1
      const nx = x / window.innerWidth;
      const ny = 1.0 - (y / window.innerHeight);
      
      // Normalize velocity
      const nvx = vx / window.innerWidth;
      const nvy = -vy / window.innerHeight;

      // Avoid adding points if velocity is too small
      if (Math.abs(nvx) < 0.001 && Math.abs(nvy) < 0.001) return;

      const idx3 = pointIndex * 3;
      const idx2 = pointIndex * 2;

      points[idx3] = nx;
      points[idx3 + 1] = ny;
      points[idx3 + 2] = 1.0; // Starting life

      velocity[idx2] = nvx * 10.0; // Amplify velocity for visual effect
      velocity[idx2 + 1] = nvy * 10.0;

      pointIndex = (pointIndex + 1) % MAX_POINTS;
      uniforms.uPoints.value = points;
      uniforms.uVelocity.value = velocity;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const vx = e.clientX - lastMouse.x;
      const vy = e.clientY - lastMouse.y;
      addPoint(e.clientX, e.clientY, vx, vy);
      lastMouse.set(e.clientX, e.clientY);
    };

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const dy = currentScroll - lastScrollY;
      
      // Simulate points along the vertical center when scrolling
      // to create a full-page tearing effect
      addPoint(window.innerWidth / 2, window.innerHeight / 2, 0, -dy * 2.0);
      addPoint(window.innerWidth / 4, window.innerHeight / 2, 0, -dy * 1.5);
      addPoint((window.innerWidth / 4) * 3, window.innerHeight / 2, 0, -dy * 1.5);

      lastScrollY = currentScroll;
    };

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const render = () => {
      const dt = clock.getDelta();
      uniforms.uTime.value += dt;

      // Age points
      for (let i = 0; i < MAX_POINTS; i++) {
        const idx = i * 3 + 2; // age index
        if (points[idx] > 0) {
          points[idx] -= dt * 1.5; // Fade out speed
          if (points[idx] < 0) points[idx] = 0;
        }
      }
      uniforms.uPoints.value = points;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      material.dispose();
      geometry.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`fixed inset-0 z-[-1] pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
};
