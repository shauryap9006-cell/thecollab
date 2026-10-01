'use client';

import { Cloud, Clouds } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useThemeStore } from '@stores';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const CLOUD_OFFSET = new THREE.Vector3(0, -2.5, -4);
const tempOffset = new THREE.Vector3();

const ThemeTransition = () => {
  const { theme } = useThemeStore();
  const { camera } = useThree();
  const cloudsRef = useRef<THREE.Group>(null);
  const prevThemeRef = useRef(theme.type);

  // Keep the clouds group relative to the camera at all times
  useFrame(() => {
    if (cloudsRef.current) {
      tempOffset.copy(CLOUD_OFFSET).applyQuaternion(camera.quaternion);
      cloudsRef.current.position.copy(camera.position).add(tempOffset);
      cloudsRef.current.quaternion.copy(camera.quaternion);
    }
  });

  useEffect(() => {
    if (prevThemeRef.current !== theme.type) {
      prevThemeRef.current = theme.type;

      if (cloudsRef.current) {
        const tl = gsap.timeline();
        const innerGroup = cloudsRef.current.children[0] as THREE.Group;

        // Sweep from Left to Right
        // Extended Sweep for total width coverage
        tl.fromTo(innerGroup.position, { x: -30 }, { x: 30, duration: 1.0, ease: 'power1.inOut' });

        // Huge Solid Expansion for total height coverage
        innerGroup.children.forEach((child, i) => {
          if (child.scale) {
            tl.fromTo(
              child.scale,
              { x: 0, y: 0, z: 0 },
              { x: 12, y: 12, z: 12, duration: 0.4, ease: 'back.out' },
              i * 0.03,
            );
            tl.to(
              child.scale,
              { x: 0, y: 0, z: 0, duration: 0.4, ease: 'power2.in' },
              0.5 + i * 0.03,
            );
          }
        });
      }
    }
  }, [theme.type, camera]);

  // Use a cloud color that contrasts with the target theme
  const cloudColor = theme.type === 'dark' ? '#888' : '#FFF';

  return (
    <group ref={cloudsRef}>
      <group position={[-25, 0, 0]}>
        <Clouds material={THREE.MeshBasicMaterial} renderOrder={999}>
          <meshBasicMaterial depthTest={false} transparent={false} opacity={1} />
          {/* Exact Mirror of Hero Cloud Parameters */}
          <Cloud
            seed={1}
            segments={1}
            concentrate="inside"
            bounds={[10, 10, 10]}
            growth={3}
            position={[-2, 2, 0]}
            color={cloudColor}
            volume={2}
            fade={5}
          />

          <Cloud
            seed={3}
            segments={1}
            concentrate="outside"
            bounds={[10, 10, 10]}
            growth={2}
            position={[0, 0, 1]}
            color={cloudColor}
            volume={2}
            fade={3}
          />

          <Cloud
            seed={4}
            segments={1}
            concentrate="outside"
            bounds={[10, 20, 15]}
            growth={4}
            position={[2, -2, -1]}
            color={cloudColor}
            volume={3}
            fade={5}
          />

          <Cloud
            seed={5}
            segments={1}
            concentrate="outside"
            bounds={[5, 5, 5]}
            growth={2}
            position={[-1, -3, 0]}
            color={cloudColor}
            volume={2}
            fade={0.1}
          />

          <Cloud
            seed={6}
            segments={1}
            concentrate="outside"
            bounds={[5, 5, 5]}
            growth={2}
            position={[3, 3, 0]}
            color={cloudColor}
            volume={3}
            fade={0.1}
          />

          <Cloud
            seed={7}
            segments={1}
            concentrate="outside"
            bounds={[5, 5, 5]}
            growth={2}
            position={[0, 5, -1]}
            color={cloudColor}
            volume={3}
            fade={0.1}
          />

          {/* Extra coverage clouds mirroring the same style */}
          <Cloud
            seed={8}
            segments={1}
            concentrate="outside"
            bounds={[10, 10, 10]}
            growth={3}
            position={[0, -5, 0]}
            color={cloudColor}
            volume={3}
            fade={5}
          />
          <Cloud
            seed={9}
            segments={1}
            concentrate="inside"
            bounds={[15, 15, 15]}
            growth={4}
            position={[0, 0, -2]}
            color={cloudColor}
            volume={5}
            fade={5}
          />
        </Clouds>
      </group>
    </group>
  );
};

export default ThemeTransition;
