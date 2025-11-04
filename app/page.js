'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

function Stars({ count = 1200, radius = 150 }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = radius * (0.6 + Math.random() * 0.4);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count, radius]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.6} color="#ffffff" sizeAttenuation depthWrite={false} transparent opacity={0.5} />
    </points>
  );
}

function Cloud({ seed = 0, p = new THREE.Vector3() }) {
  const group = useRef();
  const spheres = useMemo(() => {
    const rng = (x) => {
      const t = Math.sin(x * 12.9898) * 43758.5453;
      return t - Math.floor(t);
    };
    const blobs = [];
    const count = 18 + Math.floor(rng(seed) * 12);
    for (let i = 0; i < count; i++) {
      const u = rng(seed + i * 1.23);
      const v = rng(seed + i * 2.17);
      const w = rng(seed + i * 3.01);
      const x = (u - 0.5) * 6;
      const y = (v - 0.5) * 2.2;
      const z = (w - 0.5) * 2.6;
      const r = 0.6 + rng(seed + i * 4.11) * 1.8;
      blobs.push({ position: [x, y, z], scale: [r, r * (0.8 + w * 0.4), r] });
    }
    return blobs;
  }, [seed]);

  return (
    <group ref={group} position={p.toArray()}>
      {spheres.map((s, idx) => (
        <mesh key={idx} position={s.position} scale={s.scale} castShadow receiveShadow>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} metalness={0} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function CloudField() {
  const clouds = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 26; i++) {
      const angle = (i / 26) * Math.PI * 2;
      const radius = 24 + Math.random() * 18;
      const height = -2 + Math.random() * 6;
      arr.push({ seed: i * 7, position: new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius) });
    }
    return arr;
  }, []);

  return (
    <group>
      {clouds.map((c, i) => (
        <Cloud key={i} seed={c.seed} p={c.position} />
      ))}
    </group>
  );
}

function FlyingCar() {
  const group = useRef();
  const t0 = useRef(Math.random() * 1000);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + t0.current;
    const R = 16;
    const speed = 0.18;
    const x = Math.cos(t * speed) * R;
    const z = Math.sin(t * speed) * (R * 0.8);
    const y = 2.4 + Math.sin(t * 0.9) * 1.3;
    const yaw = -t * speed + Math.PI / 2;
    if (group.current) {
      group.current.position.set(x, y, z);
      group.current.rotation.set(0.06 * Math.sin(t * 1.4), yaw, 0.08 * Math.cos(t * 1.1));
    }
  });

  return (
    <group ref={group}>
      {/* Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[3.2, 0.9, 1.6]} />
        <meshStandardMaterial color="#ff435b" metalness={0.4} roughness={0.35} />
      </mesh>

      {/* Cabin */}
      <mesh position={[0.2, 0.7, 0]} castShadow>
        <boxGeometry args={[1.8, 0.8, 1.4]} />
        <meshStandardMaterial color="#2b3a67" metalness={0.2} roughness={0.8} opacity={0.9} transparent />
      </mesh>

      {/* Fins */}
      <mesh position={[-1.7, 0.2, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.2, 1.2, 1.8]} />
        <meshStandardMaterial color="#1f2559" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Thrusters */}
      <mesh position={[-1.6, -0.1, -0.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, 0.8, 16]} />
        <meshStandardMaterial color="#cccccc" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-1.6, -0.1, 0.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, 0.8, 16]} />
        <meshStandardMaterial color="#cccccc" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Engine glow */}
      <pointLight position={[-2.0, -0.1, -0.6]} color="#70e1ff" intensity={1.4} distance={6} decay={2} />
      <pointLight position={[-2.0, -0.1, 0.6]} color="#70e1ff" intensity={1.4} distance={6} decay={2} />

      {/* Headlights */}
      <spotLight position={[1.9, 0.1, -0.5]} angle={0.35} intensity={1.2} color="#fff6d5" distance={10} penumbra={0.6} />
      <spotLight position={[1.9, 0.1, 0.5]} angle={0.35} intensity={1.2} color="#fff6d5" distance={10} penumbra={0.6} />

      {/* Underglow */}
      <mesh position={[0, -0.55, 0]} castShadow>
        <boxGeometry args={[2.8, 0.08, 1.2]} />
        <meshStandardMaterial color="#5a9cff" emissive="#244bff" emissiveIntensity={0.2} metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 2]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />

      {/* Environment fog for depth */}
      <fog attach="fog" args={["#8ec5ff", 20, 120]} />

      {/* Elements */}
      <CloudField />
      <Stars />
      <FlyingCar />

      {/* Ground plane far below for subtle bounce */}
      <mesh position={[0, -30, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#aacbff" roughness={1} metalness={0} />
      </mesh>
    </>
  );
}

export default function Page() {
  return (
    <main className="main">
      <header className="header">
        <h1>Car in the Sky</h1>
      </header>
      <div className="canvasWrap">
        <Suspense fallback={null}>
          <Canvas shadows camera={{ position: [8, 6, 12], fov: 55 }} onCreated={({ gl, scene }) => {
            gl.setClearColor('#8ec5ff', 1);
            scene.background = null; // Keep CSS gradient
          }}>
            <Scene />
          </Canvas>
        </Suspense>
        <div className="badge">Drag to orbit ? Scroll to zoom</div>
      </div>
    </main>
  );
}
