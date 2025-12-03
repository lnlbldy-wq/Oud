import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SmokeParticles } from './SmokeParticles';

export const MabkharaModel: React.FC = () => {
  const group = useRef<THREE.Group>(null);

  // Generate stud positions for the Golden Ornate style (V-shape body)
  const studs = useMemo(() => {
    const positions: { pos: [number, number, number], rot: [number, number, number] }[] = [];
    const sides = 4;
    
    // Pattern for the inverted pyramid body
    // Body goes from y=0.8 to y=2.0 roughly
    const startY = 0.9;
    const endY = 1.9;
    const height = endY - startY;
    
    // For each side
    for (let i = 0; i < sides; i++) {
        // Rotate 45 deg to match cylinder rotation
        // Note: The cylinder mesh will be rotated, so we need to align studs accordingly or generate them aligned
        
        const steps = 8;
        for (let j = 0; j <= steps; j++) {
            const t = j / steps; // 0 to 1
            const y = startY + t * height;
            
            // Inverted taper: Wider at top
            // Bottom radius approx 0.35, Top approx 0.7
            const currentRadius = 0.35 + (t * 0.35);
            
            // Face offset logic
            // We are using a 4-sided cylinder rotated by 45 degrees (PI/4).
            // This aligns the flat faces with X and Z axes.
            // Normal vectors for faces will be along X and Z axes.
            
            // Face i=0: Z+ (Normal: 0,0,1)
            // Face i=1: X+ (Normal: 1,0,0) ... and so on
            
            const angle = (i * Math.PI) / 2;
            const normal = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
            
            // Distance from center to face. 
            // For a cylinder with 4 radial segments, the "radius" arg is the distance to corners.
            // Distance to edge (apothem) is radius * cos(PI/4) approx 0.707
            const faceDist = currentRadius * Math.cos(Math.PI/4);
            
            const center = normal.clone().multiplyScalar(faceDist).setY(y);
            const tangent = new THREE.Vector3(-normal.z, 0, normal.x);

            // Pattern: V shape of studs on the face
            const widthAtHeight = currentRadius; 
            
            // Border Left
            const p1 = center.clone().add(tangent.clone().multiplyScalar(-widthAtHeight * 0.4));
            positions.push({ pos: [p1.x, p1.y, p1.z], rot: [0, angle, 0] });
            // Border Right
            const p2 = center.clone().add(tangent.clone().multiplyScalar(widthAtHeight * 0.4));
            positions.push({ pos: [p2.x, p2.y, p2.z], rot: [0, angle, 0] });
            
            // Center detail
            if (j % 2 === 0) {
                 positions.push({ pos: [center.x, center.y, center.z], rot: [0, angle, 0] });
            }
        }
    }
    return positions;
  }, []);

  // Idle animation: Very subtle floating/breathing to feel "alive" but grounded
  useFrame((state) => {
    if (group.current) {
        // Very subtle rotation sway
        group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return (
      <group ref={group} position={[0, -1.2, 0]}>
        
        {/* --- BASE --- */}
        <group position={[0, 0, 0]}>
            {/* Main Base Block */}
            <mesh position={[0, 0.15, 0]}>
                <boxGeometry args={[0.8, 0.3, 0.8]} />
                <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.3} />
            </mesh>
            {/* Bottom Plate */}
            <mesh position={[0, 0.02, 0]}>
                 <boxGeometry args={[0.9, 0.05, 0.9]} />
                 <meshStandardMaterial color="#C0C0C0" metalness={1} roughness={0.2} />
            </mesh>
             {/* Decorative Feet */}
             {[ [1,1], [1,-1], [-1,1], [-1,-1] ].map(([x,z], i) => (
                 <mesh key={i} position={[x*0.4, 0.05, z*0.4]}>
                     <sphereGeometry args={[0.08]} />
                     <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.2} />
                 </mesh>
             ))}
        </group>

        {/* --- LEGS (Connecting Base to Body) --- */}
        <group position={[0, 0.5, 0]}>
             {/* 4 Pillars */}
             {[ [1,1], [1,-1], [-1,1], [-1,-1] ].map(([x,z], i) => (
                 <mesh key={i} position={[x*0.25, 0, z*0.25]}>
                     <cylinderGeometry args={[0.04, 0.04, 0.5]} />
                     <meshStandardMaterial color="#DAA520" metalness={1} roughness={0.3} />
                 </mesh>
             ))}
             {/* Center decorative sphere */}
             <mesh position={[0, 0, 0]}>
                 <octahedronGeometry args={[0.15]} />
                 <meshStandardMaterial color="#C0C0C0" metalness={1} roughness={0.1} />
             </mesh>
        </group>

        {/* --- BODY (Inverted Pyramid V-Shape) --- */}
        <group position={[0, 1.4, 0]}>
            {/* Main Form */}
            {/* FIX: Applied rotation to mesh instead of geometry */}
            <mesh rotation={[0, Math.PI/4, 0]}>
                {/* TopRadius 0.7, BottomRadius 0.35, Height 1.2 */}
                <cylinderGeometry args={[0.7, 0.35, 1.2, 4]} /> 
                <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.2} />
            </mesh>
            
            {/* Rim/Lip at top */}
            <mesh position={[0, 0.6, 0]}>
                 <boxGeometry args={[1.05, 0.05, 1.05]} />
                 <meshStandardMaterial color="#C0C0C0" metalness={1} roughness={0.2} />
            </mesh>

            {/* Corner Turrets/Crowns */}
            {[ [1,1], [1,-1], [-1,1], [-1,-1] ].map(([x,z], i) => (
                 <group key={i} position={[x*0.5, 0.65, z*0.5]}>
                     {/* Turret Body */}
                     <mesh>
                         <boxGeometry args={[0.15, 0.3, 0.15]} />
                         <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.3} />
                     </mesh>
                     {/* Turret Top */}
                     {/* FIX: Applied rotation to mesh instead of geometry */}
                     <mesh position={[0, 0.2, 0]} rotation={[0, Math.PI/4, 0]}>
                         <coneGeometry args={[0.05, 0.15, 4]} />
                         <meshStandardMaterial color="#C0C0C0" metalness={1} roughness={0.2} />
                     </mesh>
                 </group>
            ))}
        </group>

        {/* --- STUDS DECORATION --- */}
        <group>
            {studs.map((s, i) => (
                <mesh key={i} position={s.pos as [number, number, number]} rotation={s.rot as [number, number, number]}>
                    <sphereGeometry args={[0.02, 6, 6]} />
                    <meshStandardMaterial color="#FFFFE0" metalness={0.8} roughness={0.2} />
                </mesh>
            ))}
        </group>

        {/* --- CONTENTS (Coal & Oud) --- */}
        <group position={[0, 1.9, 0]}>
            {/* Bowl Inner */}
            <mesh position={[0, -0.1, 0]}>
                <cylinderGeometry args={[0.3, 0.2, 0.2, 16]} />
                <meshStandardMaterial color="#333" roughness={0.9} />
            </mesh>

            {/* Glowing Coals */}
            <group position={[0, 0, 0]}>
                <mesh position={[0.05, 0, 0.05]}>
                    <dodecahedronGeometry args={[0.12, 0]} />
                    <meshStandardMaterial color="#1a0505" emissive="#ff4500" emissiveIntensity={2} />
                </mesh>
                <mesh position={[-0.08, 0.02, -0.06]}>
                    <dodecahedronGeometry args={[0.1, 0]} />
                    <meshStandardMaterial color="#1a0505" emissive="#ff3300" emissiveIntensity={1.5} />
                </mesh>
                <mesh position={[0.08, -0.02, -0.08]}>
                    <dodecahedronGeometry args={[0.09, 0]} />
                    <meshStandardMaterial color="#1a0505" emissive="#ff5500" emissiveIntensity={1} />
                </mesh>
            </group>

            {/* Oud Wood Piece */}
            <group position={[0, 0.12, 0]} rotation={[0.2, 0.1, 0.1]}>
                <mesh>
                    {/* Irregular shape for natural wood look */}
                    <boxGeometry args={[0.3, 0.08, 0.15]} /> 
                    <meshStandardMaterial color="#3E2723" roughness={1} />
                </mesh>
                {/* Burnt part */}
                {/* FIX: Applied rotation to mesh instead of geometry */}
                <mesh position={[0, -0.041, 0]} rotation={[Math.PI/2, 0, 0]}>
                     <planeGeometry args={[0.2, 0.1]} />
                     <meshStandardMaterial color="#000" transparent opacity={0.8} />
                </mesh>
            </group>

            {/* Smoke Emitter */}
            <group position={[0, 0.15, 0]}>
                <SmokeParticles />
            </group>
        </group>

      </group>
  );
};