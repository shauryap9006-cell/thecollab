'use client';

import { Html, Text, useCursor, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '@/app/hooks/useIsMobile';
import * as THREE from 'three';
import { FOOTER_LINKS, withBasePath } from '../../constants';
import { FooterLink } from '../../types';

const FooterLinkItem = ({ link, isMobile }: { link: FooterLink; isMobile: boolean }) => {
  const textRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const onPointerOver = () => setHovered(true);
  const onPointerOut = () => setHovered(false);
  const onClick = () => window.open(link.url, '_blank');

  const fontProps = {
    font: withBasePath('./Vercetti-Regular.woff'),
    fontSize: 0.2,
    color: 'white',
    onPointerOver,
    onPointerOut,
    onClick,
  };

  useEffect(() => {
    const textMesh = textRef.current;
    if (textMesh) {
      gsap.to(textMesh, {
        letterSpacing: hovered ? 0.3 : 0,
        duration: 0.3,
      });
    }

    return () => {
      if (textMesh) gsap.killTweensOf(textMesh);
    };
  }, [hovered]);

  useCursor(hovered);

  if (isMobile) {
    return (
      <Html center position={[0.1, 0.25, 0]}>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.name}
          className="flex items-center justify-center p-2 opacity-80 hover:opacity-100 transition-opacity"
        >
          <Image
            src={withBasePath(`/${link.icon}`)}
            alt={link.name}
            width={20}
            height={20}
            className="w-5 h-5 invert pointer-events-auto"
            unoptimized
          />
        </a>
      </Html>
    );
  }

  return (
    <group>
      <Text ref={textRef} {...fontProps}>
        {link.name.toUpperCase()}
      </Text>
      {hovered && (
        <Html center position={[0, -0.35, 0]} pointerEvents="none">
          <div className="text-[11px] font-sans text-white/90 whitespace-nowrap bg-black/70 px-2 py-0.5 rounded-full border border-white/20 shadow-lg pointer-events-none select-none backdrop-blur-sm">
            {link.hoverText ?? link.name.toUpperCase()}
          </div>
        </Html>
      )}
    </group>
  );
};

const Footer = () => {
  const isMobile = useIsMobile();
  const groupRef = useRef<THREE.Group>(null);
  const data = useScroll();

  useFrame(() => {
    const d = data.range(0.8, 0.2);
    if (groupRef.current) {
      groupRef.current.visible = d > 0;
    }
  });

  const getLinks = () => {
    return FOOTER_LINKS.map((link, i) => {
      return (
        <group key={i} position={[i * (isMobile ? 1.1 : 2), 0, 0]}>
          <FooterLinkItem link={link} isMobile={isMobile} />
        </group>
      );
    });
  };

  return (
    <group position={[0, -44, 18]} rotation={[-Math.PI / 2, 0, 0]} ref={groupRef}>
      <group position={[isMobile ? -1.65 : -3, 0, 0]}>{getLinks()}</group>
    </group>
  );
};

export default Footer;
