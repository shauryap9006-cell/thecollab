'use client';

import { Text, Float, Edges } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { withBasePath } from "@constants";

interface IndustryFrameProps {
  title: string;
  date: string;
  position: THREE.Vector3 | [number, number, number];
  rotation?: THREE.Euler | [number, number, number];
  forceHover?: boolean;
  onClick?: () => void;
}

const Emblem = ({ title }: { title: string }) => {
  // A simple gold emblem: ring + initial letter floating above the frame.
  const initial = title.charAt(0).toUpperCase();
  return (
    <group scale={0.5} position={[0, 1.35, 0.2]}>
      <mesh>
        <torusGeometry args={[0.3, 0.05, 12, 32]} />
        <meshPhysicalMaterial
          color="#ffd700"
          metalness={1}
          roughness={0.1}
          clearcoat={1}
          emissive="#ffae00"
          emissiveIntensity={0.2}
        />
      </mesh>
      <Text
        font={withBasePath("./soria-font.ttf")}
        fontSize={0.3}
        color="#ffd700"
        anchorX="center"
        anchorY="middle"
        position={[0, 0, 0.08]}>
        {initial}
      </Text>
    </group>
  );
};

const IndustryFrame = ({
  title,
  date,
  position,
  rotation,
  forceHover,
  onClick
}: IndustryFrameProps) => {
  const frameRef = useRef<THREE.Group>(null);
  const textGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const isHighlighted = hovered || forceHover;

  useEffect(() => {
    if (!frameRef.current) return;

    gsap.to(frameRef.current.scale, {
      x: isHighlighted ? 1.15 : 1,
      y: isHighlighted ? 1.15 : 1,
      z: isHighlighted ? 1.15 : 1,
      duration: 0.4,
      ease: "power2.out"
    });

    if (textGroupRef.current) {
      gsap.to(textGroupRef.current.position, {
        y: isHighlighted ? -1.8 : -1.5,
        duration: 0.4,
      });
    }

    return () => {
      if (frameRef.current) gsap.killTweensOf(frameRef.current.scale);
      if (textGroupRef.current) gsap.killTweensOf(textGroupRef.current.position);
    };
  }, [isHighlighted]);

  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    thickness: 0.4,
    roughness: 0.05,
    transmission: 1.0,
    ior: 1.45,
    dispersion: 8,
    transparent: true,
    opacity: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0,
    reflectivity: 0.5,
  }), []);

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4} position={position as THREE.Vector3}>
      <group
        ref={frameRef}
        rotation={rotation}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        scale={[1, 1, 1]}
      >
        {/* Floating Emblem */}
        <Emblem title={title} />

        {/* The Frame / Glass */}
        <mesh scale={[4.2, 2.8, 0.15]}>
          <boxGeometry />
          <primitive object={glassMaterial} attach="material" />
          <Edges color="white" lineWidth={1} />
        </mesh>

        {/* Industry wordmark */}
        <Text
          font={withBasePath("./soria-font.ttf")}
          fontSize={0.42}
          color="white"
          position={[0, 0.25, 0.08]}
          anchorX="center"
          anchorY="middle"
          maxWidth={3.6}>
          {title.toUpperCase()}
        </Text>
        <Text
          font={withBasePath("./Vercetti-Regular.woff")}
          fontSize={0.18}
          color="#9fd9ea"
          position={[0, -0.25, 0.08]}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.2}>
          {date.toUpperCase()}
        </Text>

        {/* Text Info (Small, floating below) */}
        <group ref={textGroupRef} position={[0, -1.5, 0.1]}>
          <Text
            font={withBasePath("./Vercetti-Regular.woff")}
            fontSize={0.16}
            color="#ccc"
            position={[0, -0.1, 0]}
            maxWidth={3.5}
            anchorX="center"
            anchorY="top"
            fillOpacity={isHighlighted ? 1 : 0}>
            CLICK TO SEE HOW WE HELP
          </Text>
        </group>

        {/* Subtle glow / border */}
        <mesh position={[0, 0, -0.05]} scale={[4.3, 2.9, 0.01]}>
          <boxGeometry />
          <meshBasicMaterial color="#ffffff" transparent opacity={isHighlighted ? 0.3 : 0.05} />
        </mesh>
      </group>
    </Float>
  );
};

export default IndustryFrame;
