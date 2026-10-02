'use client';

import { Image as DreiImage, Text, Float, Edges } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { withBasePath } from '@constants';

interface IndustryFrameProps {
  title: string;
  date: string;
  position: THREE.Vector3 | [number, number, number];
  rotation?: THREE.Euler | [number, number, number];
  forceHover?: boolean;
  onClick?: () => void;
  video?: string;
  image?: string;
  liveUrl?: string;
  tag?: string;
}

const Emblem = ({ title }: { title: string }) => {
  const initial = title.charAt(0).toUpperCase();
  return (
    <group scale={0.42} position={[-1.6, 1.35, 0.15]}>
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
        font={withBasePath('./soria-font.ttf')}
        fontSize={0.3}
        color="#ffd700"
        anchorX="center"
        anchorY="middle"
        position={[0, 0, 0.08]}
      >
        {initial}
      </Text>
    </group>
  );
};

const ProjectScreen = ({
  imageSrc,
  isHighlighted,
}: {
  imageSrc?: string;
  isHighlighted: boolean;
}) => {
  if (!imageSrc) return null;

  return (
    <Suspense
      fallback={
        <mesh position={[0, 0.28, 0.08]}>
          <planeGeometry args={[3.95, 1.9]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
      }
    >
      <DreiImage
        url={withBasePath(imageSrc)}
        scale={[3.95, 1.9]}
        position={[0, 0.28, 0.08]}
        radius={0.06}
        zoom={isHighlighted ? 1.05 : 1}
        transparent
        toneMapped={false}
      />
    </Suspense>
  );
};

const IndustryFrame = ({
  title,
  date,
  position,
  rotation,
  forceHover,
  onClick,
  image,
  liveUrl,
  tag,
}: IndustryFrameProps) => {
  const frameRef = useRef<THREE.Group>(null);
  const textGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const isHighlighted = hovered || forceHover;

  useEffect(() => {
    const frame = frameRef.current;
    const textGroup = textGroupRef.current;
    if (!frame) return;

    gsap.to(frame.scale, {
      x: isHighlighted ? 1.12 : 1,
      y: isHighlighted ? 1.12 : 1,
      z: isHighlighted ? 1.12 : 1,
      duration: 0.4,
      ease: 'power2.out',
    });

    if (textGroup) {
      gsap.to(textGroup.position, {
        y: isHighlighted ? -1.95 : -1.75,
        duration: 0.4,
      });
    }

    return () => {
      if (frame) gsap.killTweensOf(frame.scale);
      if (textGroup) gsap.killTweensOf(textGroup.position);
    };
  }, [isHighlighted]);

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        thickness: 0.4,
        roughness: 0.08,
        transmission: 0.95,
        ior: 1.45,
        dispersion: 6,
        clearcoat: 1.0,
        color: '#ffffff',
        transparent: true,
        opacity: 0.35,
        clearcoatRoughness: 0.05,
        reflectivity: 0.6,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      glassMaterial.dispose();
    };
  }, [glassMaterial]);

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.15}
      floatIntensity={0.35}
      position={position as THREE.Vector3}
    >
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

        {/* Preview Image Screen */}
        <ProjectScreen
          imageSrc={image}
          isHighlighted={!!isHighlighted}
        />

        {/* The Frame / Glass Enclosure */}
        <mesh scale={[4.3, 3.2, 0.15]}>
          <boxGeometry />
          <primitive object={glassMaterial} attach="material" />
          <Edges color={isHighlighted ? '#38bdf8' : 'white'} lineWidth={isHighlighted ? 2 : 1} />
        </mesh>

        {/* Tag pill at top right */}
        {tag && (
          <group position={[1.4, 1.25, 0.1]}>
            <mesh>
              <planeGeometry args={[1.2, 0.28]} />
              <meshBasicMaterial color="#0284c7" transparent opacity={0.85} />
              <Edges color="#38bdf8" lineWidth={1} />
            </mesh>
            <Text
              font={withBasePath('./Vercetti-Regular.woff')}
              fontSize={0.12}
              color="#ffffff"
              position={[0, 0, 0.02]}
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.1}
            >
              {tag.toUpperCase()}
            </Text>
          </group>
        )}

        {/* Project Title Wordmark */}
        <Text
          font={withBasePath('./soria-font.ttf')}
          fontSize={0.34}
          color="white"
          position={[0, -0.95, 0.1]}
          anchorX="center"
          anchorY="middle"
          maxWidth={3.8}
        >
          {title.toUpperCase()}
        </Text>

        {/* Project Subtitle */}
        <Text
          font={withBasePath('./Vercetti-Regular.woff')}
          fontSize={0.15}
          color="#9fd9ea"
          position={[0, -1.25, 0.1]}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.15}
          maxWidth={3.8}
        >
          {date.toUpperCase()}
        </Text>

        {/* Text Info (Small, floating below) */}
        <group ref={textGroupRef} position={[0, -1.75, 0.1]}>
          <Text
            font={withBasePath('./Vercetti-Regular.woff')}
            fontSize={0.16}
            color="#38bdf8"
            position={[0, 0, 0]}
            maxWidth={3.8}
            anchorX="center"
            anchorY="top"
            fillOpacity={isHighlighted ? 1 : 0}
            letterSpacing={0.15}
          >
            {liveUrl ? 'CLICK TO LAUNCH LIVE SITE ↗' : 'CLICK TO VIEW SHOWCASE ↗'}
          </Text>
        </group>

        {/* Subtle glow / border behind */}
        <mesh position={[0, 0, -0.05]} scale={[4.4, 3.3, 0.01]}>
          <boxGeometry />
          <meshBasicMaterial
            color={isHighlighted ? '#0284c7' : '#ffffff'}
            transparent
            opacity={isHighlighted ? 0.4 : 0.06}
          />
        </mesh>
      </group>
    </Float>
  );
};

export default IndustryFrame;

