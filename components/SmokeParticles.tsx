import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SmokeParticle: React.FC<{ position: [number, number, number], delay: number, randomOffset: number }> = ({ position, delay, randomOffset }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  // State to track particle life (0 to 1)
  const life = useRef(Math.random() * 0.5); // Random start life to avoid "popping" in all at once
  const speed = useRef(0.4 + Math.random() * 0.2); // Random speed variance
  const maxLife = 5.5; // Seconds to live (Increased for longer trail)

  // Random drift vector for wind simulation
  const drift = useRef(new THREE.Vector3((Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.5));

  useFrame((state, delta) => {
    if (!mesh.current || !materialRef.current) return;

    // Increment life
    life.current += delta * speed.current;

    // Reset particle if it dies
    if (life.current > maxLife) {
      life.current = 0;
      mesh.current.position.set(position[0], position[1], position[2]);
      mesh.current.scale.setScalar(0.1);
      materialRef.current.opacity = 0;
    }

    const t = life.current; // Time alive
    const progress = t / maxLife; // 0.0 to 1.0

    // --- MOVEMENT PHYSICS ---
    
    // Y Position: Rises, but speed dampens slightly at top
    const y = t * 0.9; 
    
    // Turbulence/Noise math
    // We combine two sine waves: one low frequency (sway) and one high frequency (jitter)
    const turbulence = progress * 2.0; // Increased turbulence at top
    const swayX = Math.sin(t * 1.5 + randomOffset) * 0.25 * turbulence;
    const swayZ = Math.cos(t * 1.2 + randomOffset) * 0.25 * turbulence;
    
    const jitterX = Math.sin(t * 4.0) * 0.08 * turbulence;
    const jitterZ = Math.cos(t * 3.5) * 0.08 * turbulence;

    // Apply positions
    mesh.current.position.y = position[1] + y;
    mesh.current.position.x = position[0] + swayX + jitterX + (drift.current.x * progress);
    mesh.current.position.z = position[2] + swayZ + jitterZ + (drift.current.z * progress);

    // --- ROTATION ---
    // Smoke tumbles as it rises
    mesh.current.rotation.x += delta * 0.5;
    mesh.current.rotation.z += delta * 0.2;

    // --- SCALING (Diffusion) ---
    // Smoke expands significantly as it dissipates
    const baseScale = 0.3;
    const expansion = progress * 2.5; // Increased expansion for fuller smoke
    const currentScale = baseScale + expansion;
    mesh.current.scale.setScalar(currentScale);

    // --- OPACITY (Dissipation) ---
    // Fade in fast, hold, then fade out slowly
    let alpha = 0;
    if (progress < 0.1) {
        // Fade in (0 to 10% of life)
        alpha = progress * 10; 
    } else {
        // Fade out (10% to 100% of life)
        // ease out cubic
        const fadeProgress = (progress - 0.1) / 0.9;
        alpha = 1 - Math.pow(fadeProgress, 2); 
    }
    
    // Max opacity cap (smoke isn't solid)
    materialRef.current.opacity = alpha * 0.6; // Increased opacity for denser look
  });

  return (
    <mesh ref={mesh} position={position}>
      {/* Icosahedron looks slightly softer/fluffier than dodecahedron */}
      <icosahedronGeometry args={[0.2, 0]} />
      <meshStandardMaterial 
        ref={materialRef}
        color="#e0e0e0" 
        transparent 
        opacity={0} 
        roughness={1}
        depthWrite={false}
      />
    </mesh>
  );
};

export const SmokeParticles: React.FC = () => {
  // Increased count for denser, more realistic smoke stream
  const particleCount = 120; // Doubled from 60
  
  const particles = useMemo(() => {
    return new Array(particleCount).fill(0).map((_, i) => ({
      delay: i * 0.05,
      randomOffset: Math.random() * 100, // Random seed for sine waves
      position: [
        (Math.random() - 0.5) * 0.2, // Random X start on the wood
        0, 
        (Math.random() - 0.5) * 0.2  // Random Z start on the wood
      ] as [number, number, number]
    }));
  }, []);

  return (
    <group>
      {particles.map((p, i) => (
        <SmokeParticle 
          key={i} 
          position={p.position} 
          delay={p.delay} 
          randomOffset={p.randomOffset} 
        />
      ))}
    </group>
  );
};