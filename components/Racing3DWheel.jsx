'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial, RoundedBox, Ring, Torus } from '@react-three/drei';
import * as THREE from 'three';

// Racing wheel rim with detailed spokes
function WheelRim({ color = '#f97316' }) {
  const rimRef = useRef();
  const spokesRef = useRef();
  
  useFrame((state) => {
    if (rimRef.current) {
      rimRef.current.rotation.z += 0.008;
    }
    if (spokesRef.current) {
      spokesRef.current.rotation.z += 0.008;
    }
  });

  const spokeCount = 5;
  const spokeAngles = useMemo(() => 
    Array.from({ length: spokeCount }, (_, i) => (i * Math.PI * 2) / spokeCount),
    []
  );

  return (
    <group ref={rimRef}>
      {/* Outer rim ring */}
      <Torus args={[1.8, 0.15, 16, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.9}
          roughness={0.2}
        />
      </Torus>
      
      {/* Inner rim ring */}
      <Torus args={[1.4, 0.08, 16, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.85}
          roughness={0.3}
        />
      </Torus>

      {/* Center hub */}
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
        <meshStandardMaterial
          color="#111"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Center cap with logo glow */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.05, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Spokes */}
      <group ref={spokesRef}>
        {spokeAngles.map((angle, i) => (
          <group key={i} rotation={[0, 0, angle]}>
            {/* Main spoke */}
            <mesh position={[0.95, 0, 0]} rotation={[0, 0, 0]}>
              <boxGeometry args={[1.1, 0.18, 0.12]} />
              <meshStandardMaterial
                color="#1f1f1f"
                metalness={0.85}
                roughness={0.25}
              />
            </mesh>
            {/* Spoke accent line */}
            <mesh position={[0.95, 0.1, 0]}>
              <boxGeometry args={[0.9, 0.02, 0.05]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.3}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Lug nuts */}
      {spokeAngles.map((angle, i) => (
        <mesh 
          key={`lug-${i}`} 
          position={[
            Math.cos(angle) * 0.32,
            0.17,
            Math.sin(angle) * 0.32
          ]}
        >
          <cylinderGeometry args={[0.04, 0.04, 0.08, 6]} />
          <meshStandardMaterial
            color="#333"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

// Tire with tread pattern
function Tire({ accentColor = '#f97316' }) {
  const tireRef = useRef();
  
  useFrame(() => {
    if (tireRef.current) {
      tireRef.current.rotation.z += 0.008;
    }
  });

  return (
    <group ref={tireRef}>
      {/* Main tire body */}
      <Torus args={[1.8, 0.45, 32, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color="#0a0a0a"
          roughness={0.9}
          metalness={0.1}
        />
      </Torus>
      
      {/* Tire sidewall detail */}
      <Torus args={[1.55, 0.05, 16, 64]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
        <meshStandardMaterial
          color="#151515"
          roughness={0.8}
        />
      </Torus>
      <Torus args={[1.55, 0.05, 16, 64]} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
        <meshStandardMaterial
          color="#151515"
          roughness={0.8}
        />
      </Torus>

      {/* Tread grooves */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 24;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 1.8,
              0,
              Math.sin(angle) * 1.8
            ]}
            rotation={[0, -angle + Math.PI / 2, 0]}
          >
            <boxGeometry args={[0.08, 0.35, 0.15]} />
            <meshStandardMaterial color="#050505" roughness={0.95} />
          </mesh>
        );
      })}
    </group>
  );
}

// Floating speed particles
function SpeedParticles({ count = 30, color = '#f97316' }) {
  const particlesRef = useRef();
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        positions[i * 3] -= 0.03;
        if (positions[i * 3] < -4) {
          positions[i * 3] = 4;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Ambient glow ring
function GlowRing({ color = '#22d3ee' }) {
  const ringRef = useRef();
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      ringRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={ringRef}>
      <Ring args={[2.8, 2.85, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </Ring>
      <Ring args={[3.0, 3.02, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </Ring>
    </group>
  );
}

// Main scene
function Scene({ primaryColor = '#f97316', accentColor = '#22d3ee' }) {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#fff" />
      <pointLight position={[-5, -5, 3]} intensity={0.5} color={accentColor} />
      <pointLight position={[0, 0, 5]} intensity={0.3} color={primaryColor} />
      
      <Float
        speed={2}
        rotationIntensity={0.2}
        floatIntensity={0.3}
      >
        <group ref={groupRef} rotation={[0.3, 0.5, 0]}>
          <Tire accentColor={primaryColor} />
          <WheelRim color={primaryColor} />
          <GlowRing color={accentColor} />
        </group>
      </Float>
      
      <SpeedParticles count={40} color={primaryColor} />
      <SpeedParticles count={20} color={accentColor} />
    </>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="racing-3d-loading">
      <div className="racing-3d-loading-spinner" />
      <span>Loading 3D...</span>
    </div>
  );
}

// Main export component
export default function Racing3DWheel({ 
  height = '400px',
  primaryColor = '#f97316',
  accentColor = '#22d3ee',
  className = ''
}) {
  return (
    <div 
      className={`racing-3d-container ${className}`}
      style={{ height, width: '100%' }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          dpr={[1, 2]}
          gl={{ 
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
          }}
        >
          <Scene primaryColor={primaryColor} accentColor={accentColor} />
        </Canvas>
      </Suspense>
      
      {/* Gradient overlay for blending */}
      <div className="racing-3d-overlay" />
    </div>
  );
}
