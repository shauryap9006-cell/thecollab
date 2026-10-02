'use client';

import { Text, Edges, useProgress, useCursor } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { SITE, whatsappLink, withBasePath } from '@constants';
import { useIsMobile } from '@/app/hooks/useIsMobile';
import CloudContainer from '../models/Cloud';
import StarsContainer from '../models/Stars';
import WindowModel from '../models/WindowModel';
import TextWindow from './TextWindow';
import WindowDetails from './WindowDetails';

const Hero = () => {
  const isMobile = useIsMobile();
  const heroGroupRef = useRef<THREE.Group>(null);
  const ctaRef = useRef<THREE.Group>(null);
  const [ctaHovered, setCtaHovered] = useState(false);
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100 && heroGroupRef.current) {
      gsap.fromTo(
        heroGroupRef.current.position,
        { y: -3, opacity: 0 },
        { y: 0, opacity: 1, duration: 2.2, ease: 'power3.out' },
      );
    }
  }, [progress]);

  useEffect(() => {
    const cta = ctaRef.current;
    if (cta) {
      gsap.to(cta.scale, {
        x: ctaHovered ? 1.08 : 1,
        y: ctaHovered ? 1.08 : 1,
        z: ctaHovered ? 1.08 : 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
    return () => {
      if (cta) gsap.killTweensOf(cta.scale);
    };
  }, [ctaHovered]);

  useCursor(ctaHovered);

  const pointLightRef = useRef<THREE.PointLight>(null);
  const roomRef = useRef<THREE.Group>(null);
  const roomSphereRef = useRef<THREE.Sphere>(new THREE.Sphere());
  const frustum = useMemo(() => new THREE.Frustum(), []);
  const projectionScreen = useMemo(() => new THREE.Matrix4(), []);

  // The room's point light renders a cube shadow map - six faces over the three
  // window meshes - on every frame, including while the room is off-screen. With
  // distance={10} that light reaches nothing but the room, so the map can only
  // ever be seen while the room is inside the camera frustum. Refresh it then and
  // leave it frozen otherwise. Frustum-testing the room tracks what is actually
  // on screen, which stays correct under the camera's scroll damping.
  useEffect(() => {
    const room = roomRef.current;
    const light = pointLightRef.current;
    if (!room || !light) return;
    light.shadow.autoUpdate = false;
    // Measure the room that actually mounted rather than guessing an extent, then
    // pad it so a sliver staying on screen still refreshes the map.
    new THREE.Box3().setFromObject(room).getBoundingSphere(roomSphereRef.current);
    roomSphereRef.current.radius *= 1.2;
  }, []);

  useFrame(({ camera }) => {
    const light = pointLightRef.current;
    if (!light) return;
    camera.updateMatrixWorld();
    projectionScreen.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projectionScreen);
    light.shadow.needsUpdate = frustum.intersectsSphere(roomSphereRef.current);
  });

  return (
    <>
      <StarsContainer />
      <CloudContainer />

      {/* Main Hero Header — Minimal, Elevated, Clean Hierarchy */}
      <group ref={heroGroupRef} position={[0, 0.9, -10]}>
        {/* 1. Large Commanding Brand Title */}
        <Text
          font={withBasePath('./soria-font.ttf')}
          fontSize={isMobile ? 1.25 : 1.85}
          color="white"
          position={[0, 0.5, 0]}
          anchorX="center"
          anchorY="middle"
        >
          thecollab.
        </Text>

        {/* 2. Clean Tagline */}
        <Text
          font={withBasePath('./Vercetti-Regular.woff')}
          fontSize={isMobile ? 0.24 : 0.34}
          color="white"
          fillOpacity={0.85}
          position={[0, -0.4, 0]}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.14}
          maxWidth={isMobile ? 5 : 8.5}
        >
          {SITE.tagline}
        </Text>

        {/* 3. Minimal Clean CTA Button */}
        <group
          ref={ctaRef}
          position={[0, -1.3, 0.1]}
          onClick={() => window.open(whatsappLink(), '_blank')}
          onPointerOver={() => setCtaHovered(true)}
          onPointerOut={() => setCtaHovered(false)}
        >
          <mesh>
            <boxGeometry args={[isMobile ? 2.5 : 2.8, 0.64, 0.08]} />
            <meshPhysicalMaterial
              color={ctaHovered ? '#1a1a1a' : '#0a0a0a'}
              transparent
              opacity={0.85}
              roughness={0.2}
              metalness={0.2}
            />
            <Edges color="white" lineWidth={ctaHovered ? 2 : 1} />
          </mesh>
          <Text
            font={withBasePath('./Vercetti-Regular.woff')}
            fontSize={isMobile ? 0.16 : 0.18}
            color="white"
            position={[0, 0, 0.06]}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.16}
          >
            START A PROJECT ↗
          </Text>
        </group>
      </group>

      {/* 3D Window Room Section */}
      <group position={[0, -25, 5.69]} ref={roomRef}>
        <pointLight
          ref={pointLightRef}
          castShadow
          position={[1, 1, -2.5]}
          intensity={60}
          distance={10}
        />
        <WindowModel receiveShadow />
        <TextWindow />
        <WindowDetails />
      </group>
    </>
  );
};

export default Hero;
