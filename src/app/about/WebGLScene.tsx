'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { useLusionGeometry } from './useLusionGeometry';
import { useTexture } from '@react-three/drei';

function RealParticleField({ theme, scrollProgress }: { theme: 'dark' | 'light', scrollProgress: { current: number } }) {
  // Load ALL Geometries
  const personGeometry = useLusionGeometry('/lusion-assets/person.buf');
  const terrainGeometry = useLusionGeometry('/lusion-assets/terrain.buf');
  
  const rock0Geometry = useLusionGeometry('/lusion-assets/rock_0.buf');
  const rock1Geometry = useLusionGeometry('/lusion-assets/rock_1.buf');
  const rock2Geometry = useLusionGeometry('/lusion-assets/rock_2.buf');
  const rock3Geometry = useLusionGeometry('/lusion-assets/rock_3.buf');

  const sphereLGeometry = useLusionGeometry('/lusion-assets/sphere_l.buf');
  const sphereMGeometry = useLusionGeometry('/lusion-assets/sphere_m.buf');
  const sphereSGeometry = useLusionGeometry('/lusion-assets/sphere_s.buf');
  const sphereXsGeometry = useLusionGeometry('/lusion-assets/sphere_xs.buf');

  // Load ALL Textures
  const personTexture = useTexture('/lusion-assets/person_light.webp');
  const terrainTexture = useTexture('/lusion-assets/terrain_shadow_light_height.webp');
  const rocksTexture = useTexture('/lusion-assets/rocks.webp');

  // CRITICAL: Prevent Three.js from flipping the UVs upside down!
  personTexture.flipY = false;
  terrainTexture.flipY = false;
  rocksTexture.flipY = false;

  personTexture.colorSpace = THREE.SRGBColorSpace;
  terrainTexture.colorSpace = THREE.SRGBColorSpace;
  rocksTexture.colorSpace = THREE.SRGBColorSpace;

  const pointsRef = useRef<THREE.Group>(null);
  const pillarRef = useRef<THREE.Mesh>(null);
  const rocksRef = useRef<THREE.Group>(null);

  // Astronaut Shader
  const shaderMaterialPerson = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: personTexture },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        varying vec2 vUv;
        void main() {
          vec4 texColor = texture2D(uTexture, vUv);
          // Convert the colorful baked lightmap to pure cinematic grayscale
          float lum = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
          vec3 finalColor = vec3(lum * 1.2); 
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });
  }, [personTexture]);

  // Terrain Shader
  const shaderMaterialTerrain = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: terrainTexture },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        varying vec2 vUv;
        void main() {
          vec4 texColor = texture2D(uTexture, vUv);
          // Convert the terrain map to grayscale. This perfectly captures the baked highlights on the ridges!
          float lum = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
          
          // Boost contrast for that dramatic, moody look
          lum = pow(lum, 1.2);
          vec3 finalColor = vec3(lum * 1.8);
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });
  }, [terrainTexture]);

  // Debris Shader (Rocks and Spheres)
  const shaderMaterialRocks = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: rocksTexture },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        varying vec2 vUv;
        void main() {
          vec4 texColor = texture2D(uTexture, vUv);
          float lum = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
          // Make debris incredibly bright to simulate the glowing meteor core
          vec3 finalColor = vec3(lum * 2.5 + 0.2);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });
  }, [rocksTexture]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    
    // Slow cinematic panning
    pointsRef.current.rotation.y = Math.sin(_.clock.elapsedTime * 0.1) * 0.05;
    
    // Animate floating debris swirling upwards
    if (rocksRef.current) {
        rocksRef.current.rotation.y -= delta * 0.05;
        rocksRef.current.position.y = Math.sin(_.clock.elapsedTime * 0.2) * 0.5;
    }

    const r = scrollProgress.current;
    if (pillarRef.current) {
        (pillarRef.current.material as THREE.MeshBasicMaterial).opacity = 0.15 * (1 - r);
    }
  });

  // Generate an epic spiraling cone of rocks AND spheres to replace the fake Meteor
  const rockPlacements = useMemo(() => {
      const arr = [];
      for(let i=0; i<200; i++) { // Massive dense debris swarm!
          const type = i % 8; // 0-3 are rocks, 4-7 are spheres
          
          const progress = i / 200; // 0 to 1
          const y = 1.5 + progress * 20; // Rising high into the beam
          const radius = 0.5 + progress * 6.0; // Cone opening up
          const angle = progress * Math.PI * 24; // Spiraling very tightly
          
          const offset = Math.random() * 3.0;
          const x = Math.cos(angle) * (radius + offset);
          const z = Math.sin(angle) * (radius + offset);
          
          const rotX = Math.random() * Math.PI;
          const rotY = Math.random() * Math.PI;
          const rotZ = Math.random() * Math.PI;
          
          let scale = 0.1 + Math.random() * 0.4;
          if (type >= 4) scale *= 2.0; // Make spheres slightly larger
          
          arr.push({ type, x, y, z, rotX, rotY, rotZ, scale });
      }
      return arr;
  }, []);

  return (
    <group ref={pointsRef} position={[0, -1.0, 0]}>

      {/* Epic Debris Swarm (Replaces EnergyMeteor) */}
      <group ref={rocksRef}>
          {rockPlacements.map((pos, i) => {
              let geo = rock0Geometry;
              if (pos.type === 1) geo = rock1Geometry;
              if (pos.type === 2) geo = rock2Geometry;
              if (pos.type === 3) geo = rock3Geometry;
              if (pos.type === 4) geo = sphereLGeometry;
              if (pos.type === 5) geo = sphereMGeometry;
              if (pos.type === 6) geo = sphereSGeometry;
              if (pos.type === 7) geo = sphereXsGeometry;

              if (!geo) return null;
              
              return (
                  <mesh 
                    key={i} 
                    geometry={geo} 
                    material={shaderMaterialRocks}
                    position={[pos.x, pos.y, pos.z]} 
                    rotation={[pos.rotX, pos.rotY, pos.rotZ]}
                    scale={[pos.scale, pos.scale, pos.scale]}
                  />
              );
          })}
      </group>

      {/* Cinematic Light Pillar */}
      <mesh ref={pillarRef} position={[0, 15, 0]}>
        <cylinderGeometry args={[2.5, 0.5, 30, 32, 1, true]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 15, 0]}>
        <cylinderGeometry args={[4, 1.5, 30, 32, 1, true]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.05} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Solid Astronaut with Lighting Map */}
      {personGeometry && (
        <mesh geometry={personGeometry} material={shaderMaterialPerson} scale={[1, 1, 1]} position={[0, 0, 0]} />
      )}

      {/* Massive Terrain with Vertex Displacement and Shadow/Height Map */}
      {terrainGeometry && (
        <mesh geometry={terrainGeometry} material={shaderMaterialTerrain} scale={[1.5, 1.5, 1.5]} position={[0, 0, 0]} />
      )}
    </group>
  );
}

/**
 * The massive swirling procedural energy particle cluster.
 */
function EnergyMeteor() {
  const count = 30000;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Random points inside a sphere
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = Math.cbrt(Math.random()) * 2.0; // radius of 2
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      
      // Classic 3D Perlin Noise for turbulence
      vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
      float snoise(vec3 v){ 
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + 1.0 * C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
        i = mod(i, 289.0 ); 
        vec4 p = permute( permute( permute( 
                   i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        float n_ = 1.0/7.0;
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                      dot(p2,x2), dot(p3,x3) ) );
      }

      void main() {
        vec3 pos = position;
        
        // Add swirling turbulence
        float noise = snoise(pos * 1.5 + uTime * 0.5);
        pos += normalize(pos) * noise * 0.8;
        // Make it drift upwards like a teardrop
        pos.y += (noise * 0.5);

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = 6.0 * (1.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      void main() {
        // Soft round particles
        vec2 xy = gl_PointCoord.xy - vec2(0.5);
        float ll = length(xy);
        if(ll > 0.5) discard;
        
        // Bright white/blue core
        gl_FragColor = vec4(0.9, 0.95, 1.0, 1.0 - (ll * 2.0));
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }), []);

  const meshRef = useRef<THREE.Points>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value += delta;
    }
  });

  return (
    <points ref={meshRef} position={[0, 4, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  );
}

/**
 * Custom scrollbar-less camera rig.
 */
function CameraRig({ scrollProgress }: { scrollProgress: { current: number } }) {
  const { camera } = useThree();

  useEffect(() => {
    // Cinematic telephoto lens! 
    // This flattens perspective and makes the terrain feel massive and imposing.
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 45;
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  useFrame((state) => {
    const r = scrollProgress.current; // 0 to 1
    
    // Epic cinematic ground-level framing!
    // Start low to the ground, looking forward at the astronaut and meteor
    const targetY = 1.0 + (r * 3.0); 
    const targetZ = 12.0 + (r * 15.0); 
    
    // Keep camera relatively level, very slight tilt
    const targetRotX = r * -0.1;
    const targetRotY = 0;

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