'use client';

import { Edges, MeshPortalMaterial, Text, TextProps, useCursor, useScroll } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { usePortalStore } from '@stores';
import { withBasePath } from '@constants';
import gsap from "gsap";
import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '@/app/hooks/useIsMobile';
import * as THREE from 'three';
import { TriangleMesh } from './Triangle';

interface GridTileProps {
  id: string;
  title: string;
  textAlign: TextProps['textAlign'];
  children: React.ReactNode;
  color: string;
  position: THREE.Vector3 | [number, number, number];
}

// TODO: Rename this
const GridTile = (props: GridTileProps) => {
  const titleRef = useRef<THREE.Group>(null);
  const gridRef = useRef<THREE.Group>(null);
  const hoverBoxRef = useRef<THREE.Mesh>(null);
  const portalRef = useRef(null);
  const { title, textAlign, children, color, position, id } = props;
  const { camera } = useThree();
  const isMobile = useIsMobile();
  const setActivePortal = usePortalStore((state) => state.setActivePortal);
  const isActive = usePortalStore((state) => state.activePortalId === id);
  const activePortalId = usePortalStore((state) => state.activePortalId);
  const data = useScroll();

  useEffect(() => {
    // Hanlde the hover box and title animation for mobile.
    if (isMobile && titleRef.current) {
      const isServices = id === 'services';
      gsap.to(titleRef.current, {
        fontSize: 0.13,
        maxWidth: 4,
        color: isServices ? '#FFF' : '#888',
        letterSpacing: 0.4,
      });
      gsap.to(titleRef.current.position, {
        x: isServices ? 1 : -1,
        y: isServices ? -1.7 : 1.5,
        duration: 0.5,
      });
    }
  }, []);

  useFrame((state) => {
    const d = data.range(0.95, 0.05);
    if (isMobile && titleRef.current) {
      /* eslint-disable  @typescript-eslint/no-explicit-any */
      (titleRef.current as any).fillOpacity = d;
    }

    // Dynamic Tilt Parallax (Desktop Only)
    if (!isMobile && gridRef.current && !isActive) {
      // Check if mouse is hovering (subtle check or just always active based on distance)
      // Actually, we can use state.pointer directly to tilt the card slightly
      const tiltX = -state.pointer.y * 0.1; // Reversed
      const tiltY = state.pointer.x * 0.1; // Reversed

      // We only want to tilt if the tile is "near" the mouse or we can just apply a global subtle sway
      // But let's only do it when it's being interacted with or moderately active
      gridRef.current.rotation.x = THREE.MathUtils.lerp(gridRef.current.rotation.x, tiltX, 0.1);
      gridRef.current.rotation.y = THREE.MathUtils.lerp(gridRef.current.rotation.y, tiltY, 0.1);
    }
  });

  const wasActiveRef = useRef(false);
  const [hovered, setHovered] = useState(false);

  useCursor(!isActive && !isMobile && hovered);

  useEffect(() => {
    if (isActive) {
      wasActiveRef.current = true;
      gsap.to(portalRef.current, {
        blend: 1,
        duration: 0.5,
      });
    } else if (wasActiveRef.current) {
      wasActiveRef.current = false;
      gsap.to(camera.position, {
        x: 0,
        duration: 1,
      });
      gsap.to(camera.rotation, {
        x: -Math.PI / 2,
        y: 0,
        duration: 1,
      });
      gsap.to(portalRef.current, {
        blend: 0,
        duration: 1,
      });
    }
  }, [isActive, camera]);

  const portalInto = (e: React.MouseEvent | any) => {
    if (isActive || activePortalId) return;
    e.stopPropagation();
    setActivePortal(id);
  };

  const fontProps: Partial<TextProps> = {
    font: withBasePath("./soria-font.ttf"),
    maxWidth: 2,
    anchorX: 'center',
    anchorY: 'bottom',
    fontSize: 0.7,
    color: 'white',
    textAlign: textAlign,
    fillOpacity: 0,
  };

  const onPointerOver = () => {
    if (isActive || isMobile) return;
    setHovered(true);
    gsap.to(titleRef.current, {
      fillOpacity: 1
    });
    if (gridRef.current && hoverBoxRef.current) {
      gsap.to(gridRef.current.position, { z: 0.3, duration: 0.4 });
      gsap.to(hoverBoxRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.4 });
    }
  };

  const onPointerOut = () => {
    if (isMobile) return;
    setHovered(false);
    gsap.to(titleRef.current, {
      fillOpacity: 0
    });
    if (gridRef.current && hoverBoxRef.current) {
      gsap.to(gridRef.current.position, { z: 0, duration: 0.4 });
      gsap.to(hoverBoxRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.4 });
      gsap.to(gridRef.current.rotation, { x: 0, y: 0, duration: 0.4 });
    }
  };

  const getGeometry = () => {
    if (!isMobile) {
      return <planeGeometry args={[4, 4, 1]} />
    }

    const isServices = id === 'services';
    const points = isServices ?
      [[-1, 2, 0], [-1, -2, 0], [3, -2, 0]] :
      [[-3, 2, 0], [1, -2, 0], [1, 2, 0]];

    return <TriangleMesh points={points} />;
  };

  return (
    <mesh ref={gridRef}
      position={position}
      onClick={portalInto}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}>
      {getGeometry()}
      <group>
        <mesh position={[0, 0, -0.01]} ref={hoverBoxRef} scale={[0, 0, 0]}>
          <boxGeometry args={[4, 4, 0.5]} />
          <meshPhysicalMaterial
            color="#444"
            transparent={true}
            opacity={0.3}
          />
          <Edges color="white" lineWidth={3} />
        </mesh>
        <Text position={[0, -1.8, 0.4]} {...fontProps} ref={titleRef}>
          {title}
        </Text>
      </group>
      <MeshPortalMaterial ref={portalRef} blend={0} resolution={0} blur={0}>
        <color attach="background" args={[color]} />
        {children}
      </MeshPortalMaterial>
    </mesh>
  );
}

export default GridTile;




