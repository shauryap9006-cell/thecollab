'use client';

import { Text, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { usePortalStore, useThemeStore } from '@stores';
import { withBasePath } from '@constants';
import { useRef } from 'react';
import { useIsMobile } from '@/app/hooks/useIsMobile';
import * as THREE from 'three';
import GridTile from './GridTile';
import Industries from './industries';
import Offerings from './offerings';

const Experience = () => {
  const { theme } = useThemeStore();
  const isMobile = useIsMobile();
  const titleRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const titleHiddenRef = useRef(false);
  const data = useScroll();
  const isActive = usePortalStore((state) => !!state.activePortalId);

  const fontProps = {
    font: withBasePath('./soria-font.ttf'),
    fontSize: 0.4,
    color: 'white',
  };

  useFrame((state, delta) => {
    if (groupRef.current && !isActive) {
      const d = data.range(0.8, 0.2);
      const defaultY = isMobile ? -0.35 : -1.8;
      groupRef.current.position.y = d > 0 ? defaultY : -30;
      groupRef.current.visible = d > 0;

      // Enhanced Parallax Sway
      const targetX = -state.pointer.x * (isMobile ? 0.05 : 0.4); // Reversed
      const targetZ = -state.pointer.y * (isMobile ? 0.05 : 0.2); // Reversed
      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        targetX,
        0.05,
      );
      groupRef.current.position.z = THREE.MathUtils.lerp(
        groupRef.current.position.z,
        targetZ,
        0.05,
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetX * 0.1,
        0.05,
      ); // Reversed
    }

    const d = data.range(0.8, 0.2);
    const e = data.range(0.7, 0.2);
    // Below offset 0.7 the letters are fully transparent and settle into a fixed
    // stacked pose, so once a frame has written that state there is nothing left
    // to do until they fade back in. The guard keeps the loop from being what
    // reveals them: the loop still runs on the frame that first reaches e > 0.
    if (titleRef.current && (e > 0 || !titleHiddenRef.current)) {
      titleRef.current.children.forEach((text, i) => {
        const y = Math.max(Math.min((1 - d) * (10 - i), 10), 0.5);
        text.position.y = THREE.MathUtils.damp(text.position.y, y, 7, delta);
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        (text as any).fillOpacity = e;
      });
      titleHiddenRef.current = e === 0;
    }
  });

  const getTitle = () => {
    const title = 'what we do'.toUpperCase();
    return title.split('').map((char, i) => {
      const diff = isMobile ? 0.4 : 0.8;
      return (
        <Text key={i} {...fontProps} position={[i * diff, 2, 1]}>
          {char === ' ' ? '' : char}
        </Text>
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

        <group
          position={[0, isMobile ? -0.35 : -1, 0]}
          ref={groupRef}
          scale={isMobile ? 0.46 : 0.9}
        >
          <GridTile
            title="OFFERINGS"
            id="offerings"
            color="#bdd1e3"
            textAlign="center"
            position={isMobile ? [0, 2.3, 0] : [-2.3, 0, 0]}
          >
            <Offerings />
          </GridTile>
          <GridTile
            title="WHO WE WORK WITH"
            id="industries"
            color={theme?.type === 'dark' ? '#060a12' : '#0690d4'}
            textAlign="center"
            position={isMobile ? [0, -2.3, 0] : [2.3, 0, 0]}
          >
            <Industries />
          </GridTile>
        </group>
      </group>
    </group>
  );
};

export default Experience;
