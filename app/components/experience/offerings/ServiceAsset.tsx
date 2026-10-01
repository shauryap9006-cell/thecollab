'use client';

import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ServiceIcon } from '@types';

interface ServiceAssetProps {
  icon: ServiceIcon;
  hovered: boolean;
}

/**
 * 🌐 Globe — wireframe sphere with an orbiting ring.
 */
const GlobeAsset = ({ hovered }: { hovered: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += hovered ? 0.03 : 0.012;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.4) * 0.07;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.4, 24, 24]} />
        <meshBasicMaterial color="#22d3ee" wireframe />
      </mesh>
      <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[0.55, 0.015, 8, 48]} />
        <meshStandardMaterial color="#a3e635" />
      </mesh>
    </group>
  );
};

/**
 * 📱 Phone — rounded slab with a glowing screen.
 */
const PhoneAsset = ({ hovered }: { hovered: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.4;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.6) * 0.06;
    }
  });

  useEffect(() => {
    if (groupRef.current) {
      gsap.to(groupRef.current.scale, {
        x: hovered ? 1.15 : 1,
        y: hovered ? 1.15 : 1,
        z: hovered ? 1.15 : 1,
        duration: 0.4,
        ease: 'power2.out',
      });
    }
  }, [hovered]);

  return (
    <group ref={groupRef} rotation={[0.1, 0.3, 0]}>
      <mesh>
        <boxGeometry args={[0.45, 0.85, 0.06]} />
        <meshPhysicalMaterial color="#1f2937" metalness={0.6} roughness={0.3} clearcoat={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[0.38, 0.72, 0.01]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={hovered ? 0.9 : 0.4}
        />
      </mesh>
    </group>
  );
};

/**
 * 🎥 Reel — film reel with holes, spins up on hover.
 */
const ReelAsset = ({ hovered }: { hovered: boolean }) => {
  const reelRef = useRef<THREE.Group>(null);
  const speedRef = useRef(0.015);

  useEffect(() => {
    gsap.to(speedRef, { current: hovered ? 0.08 : 0.015, duration: 0.5 });
  }, [hovered]);

  useFrame((state) => {
    if (reelRef.current) {
      reelRef.current.rotation.z += speedRef.current;
      reelRef.current.rotation.y += 0.01;
      reelRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  return (
    <group ref={reelRef}>
      <mesh>
        <cylinderGeometry args={[0.42, 0.42, 0.06, 32]} />
        <meshPhysicalMaterial color="#2c3e50" metalness={0.8} roughness={0.2} clearcoat={0.7} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.26, 0.04, Math.sin(angle) * 0.26]}>
            <cylinderGeometry args={[0.07, 0.07, 0.08, 12]} />
            <meshStandardMaterial color="#0b0f14" />
          </mesh>
        );
      })}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
        <meshStandardMaterial color="#a3e635" emissive="#a3e635" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
};

/**
 * 🤝 Handshake — two interlocking rings meeting in the middle.
 */
const HandshakeAsset = ({ hovered }: { hovered: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.012;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.3) * 0.06;
      const spread = hovered ? 0.32 : 0.4;
      const left = groupRef.current.children[0];
      const right = groupRef.current.children[1];
      if (left) left.position.x = -spread;
      if (right) right.position.x = spread;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.4, 0, 0]}>
      <mesh position={[-0.4, 0, 0]} rotation={[0, 0, hovered ? 0.5 : 0.35]}>
        <torusGeometry args={[0.22, 0.05, 12, 32]} />
        <meshPhysicalMaterial color="#22d3ee" metalness={0.5} roughness={0.25} clearcoat={0.8} />
      </mesh>
      <mesh position={[0.4, 0, 0]} rotation={[0, 0, hovered ? -0.5 : -0.35]}>
        <torusGeometry args={[0.22, 0.05, 12, 32]} />
        <meshPhysicalMaterial color="#a3e635" metalness={0.5} roughness={0.25} clearcoat={0.8} />
      </mesh>
    </group>
  );
};

/**
 * 📍 Pin — location marker with a pulsing base.
 */
const PinAsset = () => {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.015;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.7) * 0.07 + 0.15;
    }
    if (ringRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
      ringRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group>
      <group ref={groupRef}>
        <mesh>
          <coneGeometry args={[0.28, 0.65, 24]} />
          <meshPhysicalMaterial color="#f87171" metalness={0.3} roughness={0.3} clearcoat={0.7} />
        </mesh>
        <mesh position={[0, 0.38, 0]}>
          <sphereGeometry args={[0.24, 24, 24]} />
          <meshPhysicalMaterial color="#f87171" metalness={0.3} roughness={0.3} clearcoat={0.7} />
        </mesh>
        <mesh position={[0, 0.4, 0.19]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#0b0f14" />
        </mesh>
      </group>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]}>
        <torusGeometry args={[0.32, 0.015, 8, 40]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

/**
 * 🚀 Rocket — cone + fins, gentle climb.
 */
const RocketAsset = ({ hovered }: { hovered: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.1) * 0.12;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.9) * 0.08 + (hovered ? 0.12 : 0);
      groupRef.current.rotation.y += 0.008;
    }
  });

  return (
    <group ref={groupRef} rotation={[0, 0, 0.3]}>
      <mesh>
        <coneGeometry args={[0.2, 0.6, 20]} />
        <meshPhysicalMaterial color="#e2e8f0" metalness={0.6} roughness={0.25} clearcoat={0.8} />
      </mesh>
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.2, 0.16, 0.35, 20]} />
        <meshPhysicalMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.75, 0]}>
        <coneGeometry args={[0.17, 0.3, 20]} />
        <mesh rotation={[Math.PI, 0, 0]}>
        </mesh>
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={hovered ? 1 : 0.5} />
      </mesh>
      {[0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.2, -0.4, Math.sin(angle) * 0.2]} rotation={[0, -angle, 0.2]}>
            <boxGeometry args={[0.05, 0.25, 0.18]} />
            <meshPhysicalMaterial color="#f87171" metalness={0.4} roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
};

/**
 * 🎨 Palette — torus with orbiting color dots.
 */
const PaletteAsset = ({ hovered }: { hovered: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const colors = ['#22d3ee', '#a3e635', '#f87171', '#fbbf24', '#c084fc'];

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += hovered ? 0.035 : 0.014;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.4) * 0.06;
      groupRef.current.children.forEach((dot, i) => {
        if (i < colors.length) {
          const angle = state.clock.elapsedTime * (hovered ? 1.6 : 0.7) + (i / colors.length) * Math.PI * 2;
          dot.position.set(Math.cos(angle) * 0.5, Math.sin(angle) * 0.18, Math.sin(angle) * 0.5);
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[Math.PI / 2.6, 0, 0]}>
        <torusGeometry args={[0.5, 0.045, 12, 48]} />
        <meshPhysicalMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} clearcoat={0.8} />
      </mesh>
      {colors.map((color, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Factory — renders the right 3D icon for a service.
 */
const ServiceAsset = ({ icon, hovered }: ServiceAssetProps) => {
  switch (icon) {
    case 'globe': return <GlobeAsset hovered={hovered} />;
    case 'phone': return <PhoneAsset hovered={hovered} />;
    case 'reel': return <ReelAsset hovered={hovered} />;
    case 'handshake': return <HandshakeAsset hovered={hovered} />;
    case 'pin': return <PinAsset />;
    case 'rocket': return <RocketAsset hovered={hovered} />;
    case 'palette': return <PaletteAsset hovered={hovered} />;
    default: return null;
  }
};

export default ServiceAsset;
