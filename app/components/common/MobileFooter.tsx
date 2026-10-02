'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { emailLink, instagramLink, SITE, whatsappLink } from '@constants';
import { usePortalStore, useScrollStore } from '@stores';

const SOCIAL_LINKS = [
  {
    name: 'WhatsApp',
    url: whatsappLink(),
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    url: instagramLink(),
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    name: 'Email',
    url: emailLink(),
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-10 5L2 7" />
      </svg>
    ),
  },
  {
    name: 'Portfolio',
    url: SITE.portfolioUrl,
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
      </svg>
    ),
  },
];

export const MobileFooter = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isNearBottom = useScrollStore((state) => state.scrollProgress > 0.65);
  const isPortalActive = usePortalStore((state) => !!state.activePortalId);
  const isVisible = isNearBottom && !isPortalActive;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (isVisible) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        pointerEvents: 'auto',
      });
    } else {
      gsap.to(el, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        ease: 'power2.in',
        pointerEvents: 'none',
      });
    }
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-5 inset-x-0 flex justify-center z-20 md:hidden pointer-events-none"
      style={{ opacity: 0, transform: 'translateY(20px)' }}
    >
      <nav
        aria-label="Mobile social and contact links"
        className="flex items-center gap-6 px-6 py-3 rounded-full bg-black/85 backdrop-blur-xl border border-white/25 shadow-[0_10px_35px_rgba(0,0,0,0.7)] text-white"
      >
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.name}
            className="flex items-center justify-center p-1.5 rounded-full hover:text-white active:scale-90 active:opacity-75 transition-all text-white/90"
          >
            {link.icon}
          </a>
        ))}
      </nav>
    </div>
  );
};

export default MobileFooter;
