'use client';

import gsap from 'gsap';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { withBasePath } from '@constants';
import { usePortalStore, useScrollStore } from '@stores';

export const ScrollHint = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const portal = usePortalStore((state) => state.activePortalId);
  // Only the "still at the very top" boolean is used below, so select that instead
  // of the raw progress: this component then re-renders when the boolean flips
  // rather than on every 0.005 step ScrollWrapper publishes.
  const atTop = useScrollStore((state) => state.scrollProgress === 0);

  const isServices = portal === 'services';
  const hintText = !portal || isServices ? 'SCROLL' : 'PAN';
  const showScrollHint = !portal || isServices ? atTop : true;

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
