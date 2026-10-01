'use client';

import { Text, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { usePortalStore, useThemeStore } from "@stores";
import { useRef } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from 'three';
import GridTile from "./GridTile";
import Industries from "./industries";
import Offerings from "./offerings";
import Services from "./services";

const Experience = () => {
  const { theme } = useThemeStore();
  const titleRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const data = useScroll();
  const isActive = usePortalStore((state) => !!state.activePortalId);

  const fontProps = {
    font: "./soria-font.ttf",
    fontSize: 0.4,
    color: 'white',
  };

  useFrame((state, delta) => {
    if (groupRef.current && !isActive) {
      const d = data.range(0.8, 0.2);
      groupRef.current.position.y = d > 0 ? -1.8 : -30; // Pushed back from -1 to -1.8
      groupRef.current.visible = d > 0;

      // Enhanced Parallax Sway
      const targetX = -state.pointer.x * (isMobile ? 0.1 : 0.4); // Reversed
      const targetZ = -state.pointer.y * (isMobile ? 0.05 : 0.2); // Reversed
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX * 0.1, 0.05); // Reversed
    }

    if (titleRef.current) {
      const d = data.range(0.8, 0.2);
      const e = data.range(0.7, 0.2);
      titleRef.current.children.forEach((text, i) => {
        const y = Math.max(Math.min((1 - d) * (10 - i), 10), 0.5);
        text.position.y = THREE.MathUtils.damp(text.position.y, y, 7, delta);
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        (text as any).fillOpacity = e;
      });
    }
  });

  const getTitle = () => {
    const title = 'what we do'.toUpperCase();
    return title.split('').map((char, i) => {
      const diff = isMobile ? 0.4 : 0.8;
      return (
        <Text key={i} {...fontProps} position={[i * diff, 2, 1]}>{char === ' ' ? '' : char}</Text>
      );
    });
  };

  return (
    <group position={[0, -41.5, 12]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
      {/* <mesh receiveShadow position={[-5, 0, 0.1]}>
        <planeGeometry args={[10, 5, 1]} />
        <shadowMaterial opacity={0.1} />
      </mesh> */}
      <group rotation={[0, 0, Math.PI / 2]}>
        <group ref={titleRef} position={[isMobile ? -1.8 : -3.6, 2, -2]}>
          {getTitle()}
        </group>

        <group position={[0, -1, 0]} ref={groupRef} scale={0.9}>
          <GridTile title='SERVICES'
            id="services"
            color='#b9c6d6'
            textAlign='left'
            position={new THREE.Vector3(isMobile ? -2.2 : -4.05, 0, isMobile ? 0.4 : 0)}>
            <Services />
          </GridTile>
          <GridTile title='OFFERINGS'
            id="offerings"
            color='#bdd1e3'
            textAlign='center'
            position={new THREE.Vector3(0, 0, 0)}>
            <Offerings />
          </GridTile>
          <GridTile title='WHO WE WORK WITH'
            id="industries"
            color={theme?.type === 'dark' ? '#0690d4' : '#111111'}
            textAlign='right'
            position={new THREE.Vector3(isMobile ? 2.2 : 4.05, 0, isMobile ? 0.4 : 0)}>
            <Industries />
          </GridTile>
        </group>
      </group>
    </group>
  );
};

export default Experience;




