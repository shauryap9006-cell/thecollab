'use client';

import { useScroll, Stars, Cloud, Clouds } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import * as THREE from "three";
import { usePortalStore, useThemeStore, useIndustryStore } from "@stores";
import { INDUSTRIES } from "@constants";
import IndustryFrame from "./IndustryFrame";
import { TouchPanControls } from "../projects/TouchPanControls";

const STATIC_CLOUDS = [
  { seed: 42, position: [-45, 12, -35] as [number, number, number], volume: 8, opacity: 0.4, scale: 1.4 },
  { seed: 105, position: [35, -8, -50] as [number, number, number], volume: 11, opacity: 0.35, scale: 1.8 },
  { seed: 217, position: [-20, -15, -40] as [number, number, number], volume: 9, opacity: 0.5, scale: 1.2 },
  { seed: 334, position: [15, 18, -60] as [number, number, number], volume: 12, opacity: 0.3, scale: 2.0 },
  { seed: 489, position: [-60, -5, -70] as [number, number, number], volume: 14, opacity: 0.3, scale: 2.2 },
  { seed: 562, position: [50, 10, -45] as [number, number, number], volume: 7, opacity: 0.45, scale: 1.3 },
  { seed: 671, position: [-5, 5, -55] as [number, number, number], volume: 10, opacity: 0.4, scale: 1.6 },
  { seed: 789, position: [25, -12, -65] as [number, number, number], volume: 13, opacity: 0.35, scale: 1.9 },
];

const CloudsLayer = ({ isNight }: { isNight: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.position.x += delta * 0.5;
      if (groupRef.current.position.x > 60) {
        groupRef.current.position.x = -60;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <Clouds material={THREE.MeshBasicMaterial}>
        {STATIC_CLOUDS.map((cloud, i) => (
          <group key={i} position={cloud.position} scale={cloud.scale}>
            <Cloud
              seed={cloud.seed}
              segments={1}
              color={isNight ? "#e0e0e0" : "#ffffff"}
              volume={cloud.volume}
              growth={4}
              opacity={cloud.opacity}
              speed={0.2}
            />
          </group>
        ))}
      </Clouds>
    </group>
  );
};

const IndustryCarousel = ({ onSelect, activeId }: { onSelect: (industry: typeof INDUSTRIES[0]) => void, activeId: number | null }) => {
  return (
    <group position={[0, 0, -5]}>
      {/* Floating Industries in a gentle curve/arc for better depth */}
      {INDUSTRIES.map((industry, i) => {
        const total = INDUSTRIES.length;
        const radius = 12; // Radius of the arc
        const angleStep = Math.PI / 6; // Spread angle
        const angle = (i - (total - 1) / 2) * (angleStep / (total / 4));

        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius - radius; // Offset so center is at 0
        const y = 0.8;

        return (
          <group key={i} position={[x, y, z]} rotation={[0, -angle, 0]}>
            <spotLight
              position={[0, 4, 3]}
              angle={0.6}
              penumbra={1}
              intensity={40}
              castShadow
              target-position={[0, 0, 0]}
            />
            <IndustryFrame
              {...industry}
              position={[0, 0, 0]}
              forceHover={activeId === i}
              onClick={() => onSelect(industry)}
            />
          </group>
        );
      })}
    </group>
  );
};

const Industries = () => {
  const { camera } = useThree();
  const isMobile = useIsMobile();
  const isActive = usePortalStore((state) => state.activePortalId === "industries");
  const { theme } = useThemeStore();
  const data = useScroll();
  const mouseLightRef = useRef<THREE.PointLight>(null);
  const { selectedIndustry, setSelectedIndustry } = useIndustryStore();

  useEffect(() => {
    // Hide scrollbar when active.
    if (data.el) data.el.style.overflow = isActive ? 'hidden' : 'auto';
    if (isActive) {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        gsap.to(camera.position, { z: 11.5, y: -39, x: 5, duration: 1 });
      } else {
        gsap.to(camera.position, { y: -39, x: 6.5, duration: 1 });
      }
    }
  }, [isActive, camera, data.el]);

  useFrame((state, delta) => {
    if (isActive) {
      if (!isMobile) {
        // Parallax Effect
        camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, -(state.pointer.x * Math.PI) / 6, 0.03);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, 11.5 - state.pointer.y, 7, delta);

        // Update Mouse Follow Light
        if (mouseLightRef.current) {
          mouseLightRef.current.position.x = THREE.MathUtils.lerp(mouseLightRef.current.position.x, state.pointer.x * 10, 0.1);
          mouseLightRef.current.position.y = THREE.MathUtils.lerp(mouseLightRef.current.position.y, state.pointer.y * 5, 0.1);
        }
      }
    }
  });

  // Inverse Sky Theme
  const isNight = theme.type === 'light';
  const skyColor = isNight ? "#0a0a0a" : "#0690d4"; // Darker night for more depth

  return (
    <>
      <group>
        <color attach="background" args={[skyColor]} />
        <fog attach="fog" args={[skyColor, 15, 80]} />

        {/* Curated majestic background clouds moving in a continuous flow */}
        <CloudsLayer isNight={isNight} />

        {isNight && <Stars radius={200} depth={100} count={5000} factor={10} saturation={10} fade={true} speed={1} />}

        <ambientLight intensity={isNight ? 0.3 : 1.5} />
        <pointLight
          ref={mouseLightRef}
          position={[0, 4, 3]}
          intensity={80}
          decay={2}
          distance={25}
          color={isNight ? "#60a5fa" : "#ffffff"}
        />

        <IndustryCarousel onSelect={setSelectedIndustry} activeId={selectedIndustry ? INDUSTRIES.indexOf(selectedIndustry) : null} />
        {isActive && isMobile && <TouchPanControls />}
      </group>
    </>
  );
};

export default Industries;
