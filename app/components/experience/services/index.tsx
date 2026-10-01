'use client';

import { ScrollControls, useScroll } from '@react-three/drei';
import { usePortalStore, useScrollStore } from '@stores';
import { useEffect } from 'react';
import { Memory } from '../../models/Memory';
import Timeline from './Timeline';

const ServicesContent = ({ isActive }: { isActive: boolean }) => {
  const data = useScroll();
  const setScrollProgress = useScrollStore((state) => state.setScrollProgress);
  const scrollProgress = useScrollStore((state) => state.scrollProgress);

  useEffect(() => {
    const el = data?.el;
    if (!el) return;

    if (isActive) {
      el.style.zIndex = '20';
      el.style.pointerEvents = 'auto';

      const handleScroll = () => {
        const scrollTop = el.scrollTop;
        const scrollHeight = el.scrollHeight - el.clientHeight;
        const progress = scrollHeight > 0 ? Math.min(Math.max(scrollTop / scrollHeight, 0), 1) : 0;
        setScrollProgress(progress);
      };

      setScrollProgress(0);
      el.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        el.removeEventListener('scroll', handleScroll);
        el.scrollTo({ top: 0 });
        el.style.zIndex = '-1';
        el.style.pointerEvents = 'none';
        setScrollProgress(0);
      };
    } else {
      el.style.zIndex = '-1';
      el.style.pointerEvents = 'none';
      el.scrollTo({ top: 0 });
    }
  }, [isActive, data?.el, setScrollProgress]);

  return (
    <>
      <Memory scale={[5, 5, 5]} position={[0, -6, 1]} />
      <Timeline progress={isActive ? scrollProgress : 0} />
    </>
  );
};

const Services = () => {
  const isActive = usePortalStore((state) => state.activePortalId === 'services');

  return (
    <group>
      <mesh receiveShadow>
        <planeGeometry args={[4, 4, 1]} />
        <shadowMaterial opacity={0.1} />
      </mesh>
      <ScrollControls style={{ zIndex: -1 }} pages={2} maxSpeed={0.4}>
        <ServicesContent isActive={isActive} />
      </ScrollControls>
    </group>
  );
};

export default Services;
