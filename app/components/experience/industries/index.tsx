'use client';

import { useScroll, Stars, Cloud, Clouds } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useState, useRef } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from "three";
import { usePortalStore, useThemeStore, useIndustryStore } from "@stores";
import { INDUSTRIES } from "@constants";
import IndustryFrame from "./IndustryFrame";
import { TouchPanControls } from "../projects/TouchPanControls";

interface MovingCloudProps {
  seed: number;
  y: number;
  z: number;
  speed: number;
  initialX: number;
  color: string;
}

const MovingCloud = ({ seed: initialSeed, y: initialY, z: initialZ, speed: initialSpeed, initialX, color }: MovingCloudProps) => {
  const ref = useRef<THREE.Group>(null);
  const [cloudState, setCloudState] = useState({
    seed: initialSeed,
    y: initialY,
    z: initialZ,
    speed: initialSpeed,
    opacity: 0.3 + Math.random() * 0.4,
    volume: 6 + Math.random() * 6,
    scale: 0.8 + Math.random() * 1.2,
  });

  const BOUNDS = 140; // Much wider bounds to prevent "popping"

  useFrame((state, delta) => {
    if (ref.current) {
      // Drift right
      ref.current.position.x += delta * cloudState.speed;

      // Continuous Swapping: If it goes past the right edge, reset and re-randomize
      if (ref.current.position.x > BOUNDS) {
        ref.current.position.x = -BOUNDS;

        // Randomize all properties to make it look like a totally new cloud
        setCloudState({
          seed: Math.random() * 1000,
          y: (Math.random() - 0.5) * 40,
          z: -20 - Math.random() * 80,
          speed: 0.6 + Math.random() * 2.5,
          opacity: 0.2 + Math.random() * 0.8,
          volume: 5 + Math.random() * 10,
          scale: 0.8 + Math.random() * 2.0,
        });
      }
    }
  });

  return (
    <group ref={ref} position={[initialX, cloudState.y, cloudState.z]} scale={cloudState.scale}>
      <Cloud
        seed={cloudState.seed}
        segments={1}
        color={color}
        volume={cloudState.volume}
        growth={4}
        opacity={cloudState.opacity}
        speed={0.2} // Internal noise speed
      />
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
              position={new THREE.Vector3(0, 0, 0)}
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

        {/* 60 Large, Majestic background clouds moving in a continuous 'River' flow */}
        <Clouds material={THREE.MeshBasicMaterial}>
          {[...Array(60)].map((_, i) => {
            const seed = Math.random() * 1000;
            const zDepth = -20 - Math.random() * 80;
            const yPos = (Math.random() - 0.5) * 50;
            const speed = 0.6 + Math.random() * 1.5;
            const xOffset = (Math.random() - 0.5) * 200;

            return (
              <MovingCloud
                key={i}
                seed={seed}
                y={yPos}
                z={zDepth}
                speed={speed}
                initialX={xOffset}
                color={isNight ? "#e0e0e0" : "#ffffff"}
              />
            );
          })}
        </Clouds>

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
