import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import { MabkharaModel } from './MabkharaModel';

export const Experience: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full z-20 pointer-events-auto">
      <Canvas 
        camera={{ position: [0, 1.2, 3], fov: 45 }} // Lower, closer camera for "tabletop" feel
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={null}>
          <Environment preset="sunset" />
          
          <ambientLight intensity={1.0} />
          <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
          <pointLight position={[-5, 5, -5]} intensity={0.5} color="#ffd700" />
          
          <MabkharaModel />
          
          {/* Enhanced Shadow to ground the object on the real world surface */}
          <ContactShadows position={[0, -2.2, 0]} opacity={0.7} scale={15} blur={2} far={4} color="#000000" />
          
          <OrbitControls 
             enableZoom={true} 
             enablePan={false} 
             minPolarAngle={0} 
             maxPolarAngle={Math.PI / 1.6} 
          />
        </Suspense>
      </Canvas>
    </div>
  );
};