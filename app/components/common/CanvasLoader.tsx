'use client';

import { useGSAP } from '@gsap/react';
import { AdaptiveDpr, Preload, ScrollControls, useProgress } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { Suspense, useRef } from 'react';

import { useThemeStore } from '@stores';
import { FOOTER_LINKS, SITE, whatsappLink } from '@constants';

import SideBadge from './AwwardsBadge';
import PortalCloseButton from './PortalCloseButton';
import ProgressLoader from './ProgressLoader';
import { ScrollHint } from './ScrollHint';
import ThemeSwitcher from './ThemeSwitcher';
import ThemeTransition from './ThemeTransition';
import IndustryModal from '../experience/industries/IndustryModal';

const CanvasLoader = (props: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundColor = useThemeStore((state) => state.theme.color);
  const { progress } = useProgress();

  useGSAP(() => {
    if (progress === 100) {
      gsap.to('.base-canvas', { opacity: 1, duration: 3, delay: 1 });
    }
  }, [progress]);

  useGSAP(() => {
    gsap.to(ref.current, {
      backgroundColor: backgroundColor,
      duration: 1,
    });
    gsap.to(canvasRef.current, {
      backgroundColor: backgroundColor,
      duration: 1,
      ...noiseOverlayStyle,
    });
  }, [backgroundColor]);

  const noiseOverlayStyle = {
    backgroundBlendMode: 'soft-light',
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'repeat',
    backgroundSize: '100px',
  };

  return (
    <div className="h-[100dvh] wrapper relative">
      <div className="h-[100dvh] relative" ref={ref}>
        <Canvas
          className="base-canvas absolute inset-0 md:inset-4 md:!w-[calc(100%-2rem)] md:!h-[calc(100%-2rem)] opacity-0 overflow-hidden"
          shadows
          ref={canvasRef}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />

            <ScrollControls pages={4} damping={0.4} maxSpeed={1} distance={1} style={{ zIndex: 1 }}>
              {props.children}
            </ScrollControls>

            <ThemeTransition />

            <Preload all />
          </Suspense>
          <AdaptiveDpr pixelated />
        </Canvas>
        <ProgressLoader progress={progress} />
      </div>
      <PortalCloseButton />
      <SideBadge />
      <ThemeSwitcher />
      <ScrollHint />
      <IndustryModal />

      {/* Accessible & SEO-crawlable semantic links */}
      <footer className="sr-only" aria-label="Social and contact links">
        <h2>{SITE.name} — Contact and Social Links</h2>
        <p>{SITE.tagline}</p>
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
          Start a project on WhatsApp
        </a>
        <nav aria-label="Footer links">
          <ul>
            {FOOTER_LINKS.map((link) => (
              <li key={link.name}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.name} ({link.hoverText ?? link.name})
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </footer>
    </div>
  );
};

export default CanvasLoader;
