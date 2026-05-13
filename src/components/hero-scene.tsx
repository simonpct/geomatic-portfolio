"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Bounds,
  OrbitControls,
  useGLTF,
  Environment,
} from "@react-three/drei";

function NancyModel() {
  const { scene } = useGLTF("/nancy.glb");
  return <primitive object={scene} />;
}

useGLTF.preload("/nancy.glb");

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [8, 6, 8], fov: 35 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />

      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.1}>
          <NancyModel />
        </Bounds>
        <Environment preset="city" />
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        minDistance={4}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={-0.5}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
      />
    </Canvas>
  );
}
