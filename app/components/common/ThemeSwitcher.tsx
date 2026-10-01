'use client';

import { useGSAP } from "@gsap/react";
import { usePortalStore, useThemeStore } from "@stores";
import { withBasePath } from "@constants";
import gsap from "gsap";
import Image from 'next/image';
import { useEffect, useRef } from "react";

const ThemeSwitcher = () => {
  const themeSwitcherRef = useRef<HTMLDivElement>(null);
  const { nextTheme, theme } = useThemeStore();
  const isActive = usePortalStore((state) => state.activePortalId);
  const toggleTheme = () => nextTheme();

  useGSAP(() => {
    gsap.to(themeSwitcherRef.current, {
      opacity: isActive ? 0 : 1,
      duration: 1,
      delay: isActive ? 0 : 1,
    });
  }, [isActive]);

  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.color);
    }
  }, [theme.color]);

  return (
    <div
      className="fixed top-2 right-2 md:top-6 md:right-6 z-[2]"
      ref={themeSwitcherRef}
      style={{ opacity: 0 }}
    >
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch theme (current: ${theme.type})`}
          className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 cursor-pointer"
        >
          <Image
            src={withBasePath("icons/night-mode.svg")}
            width={24}
            height={24}
            alt="Toggle theme"
            loading="lazy"
          />
        </button>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
