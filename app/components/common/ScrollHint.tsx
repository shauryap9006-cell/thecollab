'use client';

import gsap from 'gsap';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { withBasePath } from '@constants';
import { usePortalStore, useScrollStore } from '@stores';

export const ScrollHint = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const portal = usePortalStore((state) => state.activePortalId);
  const scrollProgress = useScrollStore((state) => state.scrollProgress);

  const isServices = portal === 'services';
  const hintText = !portal || isServices ? 'SCROLL' : 'PAN';
  const showScrollHint = !portal ? scrollProgress === 0 : isServices ? scrollProgress === 0 : true;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (showScrollHint) {
      gsap.to(el, {
        opacity: 1,
        duration: 1.5,
        delay: 1.5,
      });
    } else {
      gsap.killTweensOf(el);
      gsap.to(el, {
        opacity: 0,
        duration: 0.5,
      });
    }
    return () => {
      if (el) gsap.killTweensOf(el);
    };
  }, [showScrollHint]);

  const svgSrc = withBasePath(
    hintText === 'PAN' ? 'icons/chevrons-left-right.svg' : 'icons/chevrons-up-down.svg',
  );

  return (
    <div
      ref={containerRef}
      className="fixed w-full bottom-5 pointer-events-none select-none"
      style={{ opacity: 0 }}
    >
      <div className="flex items-center justify-center gap-1.5 animate-pulse">
        <Image src={svgSrc} width={18} height={18} alt="" aria-hidden="true" loading="lazy" />
        <span className="text-white text-xs tracking-wider font-mono">{hintText}</span>
      </div>
    </div>
  );
};
