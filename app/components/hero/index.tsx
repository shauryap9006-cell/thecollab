'use client';

import { Text } from "@react-three/drei";

import { useProgress } from "@react-three/drei";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SITE, whatsappLink, withBasePath } from "@constants";
import { useCursor } from "@react-three/drei";
import CloudContainer from "../models/Cloud";
import StarsContainer from "../models/Stars";
import WindowModel from "../models/WindowModel";
import TextWindow from "./TextWindow";

const Hero = () => {
  const titleRef = useRef<THREE.Mesh>(null);
  const ctaRef = useRef<THREE.Group>(null);
  const [ctaHovered, setCtaHovered] = useState(false);
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100) {
      const tl = gsap.timeline();
      if (titleRef.current) {
        tl.fromTo(titleRef.current.position, { y: -10 }, { y: 0, duration: 3, ease: 'power2.out' }, 0);
      }
      if (ctaRef.current) {
        tl.fromTo(ctaRef.current.position, { y: -4 }, { y: 0, duration: 2, ease: 'power2.out' }, 1);
      }
      return () => {
        tl.kill();
      };
    }
  }, [progress]);

  useEffect(() => {
    if (ctaRef.current) {
      gsap.to(ctaRef.current.scale, {
        x: ctaHovered ? 1.1 : 1,
        y: ctaHovered ? 1.1 : 1,
        z: ctaHovered ? 1.1 : 1,
        duration: 0.3,
      });
    }
    return () => {
      if (ctaRef.current) gsap.killTweensOf(ctaRef.current.scale);
    };
  }, [ctaHovered]);

  useCursor(ctaHovered);

  const fontProps = {
    font: withBasePath("./soria-font.ttf"),
    fontSize: 1.2,
  };

  return (
    <>
      <Text position={[0, 2, -10]} {...fontProps} ref={titleRef}>thecollab.</Text>
      <Text
        font={withBasePath("./Vercetti-Regular.woff")}
        fontSize={0.35}
        color="#9fd9ea"
        position={[0, 1, -10]}
        anchorX="center">
        {SITE.tagline}
      </Text>
      <StarsContainer />
      <CloudContainer />

      {/* Start a project — deep link to WhatsApp */}
      <group
        ref={ctaRef}
        position={[2.6, -0.6, -9.5]}
        onClick={() => window.open(whatsappLink(), '_blank')}
        onPointerOver={() => setCtaHovered(true)}
        onPointerOut={() => setCtaHovered(false)}>
        <mesh>
          <boxGeometry args={[2.2, 0.6, 0.1]} />
          <meshPhysicalMaterial
            color={ctaHovered ? '#22d3ee' : '#0e2a33'}
            transparent
            opacity={0.85}
            roughness={0.2}
            metalness={0.4}
          />
        </mesh>
        <Text
          font={withBasePath("./Vercetti-Regular.woff")}
          fontSize={0.24}
          color="white"
          position={[0, 0, 0.1]}
          anchorX="center"
          anchorY="middle">
          START A PROJECT ↗
        </Text>
      </group>

      <group position={[0, -25, 5.69]}>
        <pointLight castShadow position={[1, 1, -2.5]} intensity={60} distance={10} />
        <WindowModel receiveShadow />
        <TextWindow />
      </group>
    </>
  );
};

export default Hero;
