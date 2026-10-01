'use client';

import { usePortalStore } from "@stores";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const PortalCloseButton = () => {
  const activePortalId = usePortalStore((state) => state.activePortalId);
  const setActivePortal = usePortalStore((state) => state.setActivePortal);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActivePortal(null);
      }
    };

    if (activePortalId) {
      window.addEventListener("keydown", handleKeyDown);
      if (btnRef.current) {
        gsap.fromTo(
          btnRef.current,
          { scale: 0, rotate: -180, opacity: 0 },
          { scale: 1, rotate: 0, opacity: 1, duration: 0.5, ease: "back.out(1.5)" }
        );
      }
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePortalId, setActivePortal]);

  if (!activePortalId) return null;

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={() => setActivePortal(null)}
      aria-label="Close portal"
      className="fixed top-6 left-6 md:top-8 md:left-8 z-[100] w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors cursor-pointer group"
    >
      <svg
        className="w-5 h-5 transition-transform group-hover:rotate-90"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
};

export default PortalCloseButton;
