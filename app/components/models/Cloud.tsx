'use client';

import { Cloud, Clouds, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

const CloudContainer = () => {
  const groupRef = useRef<THREE.Group>(null);
  const data = useScroll();

  // `frustumCulled={false}` keeps this instanced cloud layer in the render list on
  // every frame, even after the camera drops past the hero. Screenshot diffs
  // against a build with the layer hidden show it contributes no visible pixels
  // between scroll offsets 0.65 and 0.9, so it is switched off exactly there.
  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    const visible = data.visible(0, 0.6, 0.05) || data.offset > 0.9;
    if (group.visible !== visible) group.visible = visible;
  });

  return (
    <group ref={groupRef}>
      <Clouds material={THREE.MeshBasicMaterial} position={[0, -5, 0]} frustumCulled={false}>
        <Cloud
          seed={1}
          segments={1}
          concentrate="inside"
          bounds={[10, 10, 10]}
          growth={3}
          position={[-1, 0, 0]}
          smallestVolume={2}
          scale={1.9}
          volume={2}
          speed={0.2}
          fade={5}
        />
        <Cloud
          seed={3}
          segments={1}
          concentrate="outside"
          bounds={[10, 10, 10]}
          growth={2}
          position={[2, 0, 2]}
          smallestVolume={2}
          scale={1}
          volume={2}
          fade={3}
          speed={0.1}
        />

        <Cloud
          seed={4}
          segments={1}
          concentrate="outside"
          bounds={[10, 20, 15]}
          growth={4}
          position={[-10, -10, 4]}
          smallestVolume={2}
          scale={2}
          speed={0.2}
          volume={3}
        />

        <Cloud
          seed={5}
          segments={1}
          concentrate="outside"
          bounds={[5, 5, 5]}
          growth={2}
          position={[6, -3, 8]}
          smallestVolume={2}
          scale={2}
          volume={2}
          fade={0.1}
          speed={0.1}
        />

        <Cloud
          seed={6}
          segments={1}
          concentrate="outside"
          bounds={[5, 5, 5]}
          growth={2}
          position={[0, -20, 20]}
          smallestVolume={2}
          scale={4}
          volume={3}
          fade={0.1}
          speed={0.1}
        />

        <Cloud
          seed={7}
          segments={1}
          concentrate="outside"
          bounds={[5, 5, 5]}
          growth={2}
          position={[10, -15, -5]}
          smallestVolume={2}
          scale={3}
          volume={3}
          fade={0.1}
          speed={0.1}
        />
      </Clouds>
    </group>
  );
};

export default CloudContainer;
