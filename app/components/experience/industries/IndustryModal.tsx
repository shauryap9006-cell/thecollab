"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useIndustryStore, whatsappLink } from "@stores";

const IndustryModal = () => {
  const { selectedIndustry, setSelectedIndustry } = useIndustryStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedIndustry) {
      // Entry Animation
      const tl = gsap.timeline();
      tl.set(overlayRef.current, { pointerEvents: "auto" });
      tl.to(overlayRef.current, { opacity: 1, duration: 0.3 });
      tl.fromTo(
        modalRef.current,
        { scale: 0.8, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.2)" },
        "-=0.2"
      );
    }
  }, [selectedIndustry]);

  const handleClose = () => {
    const tl = gsap.timeline({
      onComplete: () => setSelectedIndustry(null),
    });
    tl.to(modalRef.current, { scale: 0.9, opacity: 0, y: 10, duration: 0.3, ease: "power2.in" });
    tl.to(overlayRef.current, { opacity: 0, duration: 0.2 }, "-=0.1");
    tl.set(overlayRef.current, { pointerEvents: "none" });
  };

  if (!selectedIndustry) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm opacity-0 pointer-events-none p-4 md:p-8"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className="relative max-w-3xl w-full bg-white/5 border border-white/20 rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Liquid Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-[80px] animate-liquid" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-[80px] animate-liquid" style={{ animationDelay: '-5s' }} />
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 z-20 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10 backdrop-blur-md group"
        >
          <svg className="transition-transform group-hover:rotate-90" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Content */}
        <div className="p-8 md:p-12">
          <p className="text-blue-400 text-xs font-bold tracking-[0.2em] uppercase mb-2 opacity-80">
            {selectedIndustry.date}
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-[1.1] tracking-tight">
            {selectedIndustry.title}
          </h2>
          <div className="flex items-center gap-2 mt-4 text-neutral-400 font-medium text-sm">
            <span className="w-8 h-[1px] bg-white/20" />
            how thecollab helps
          </div>

          <div className="h-px bg-gradient-to-r from-white/20 to-transparent w-full my-6" />

          <p className="text-neutral-300 leading-relaxed text-base md:text-lg font-medium opacity-90">
            {selectedIndustry.description}
          </p>

          <div className="pt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.open(whatsappLink(`Hi thecollab! I run a ${selectedIndustry.title.toLowerCase()} business and I'd like to grow my online presence.`), '_blank')}
              className="group relative flex-1 py-4 px-8 bg-white text-black font-bold rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-10 transition-opacity" />
              <span className="relative">Start a project ↗</span>
            </button>
            <button
              onClick={handleClose}
              className="flex-1 py-4 px-8 bg-white/10 text-white font-bold rounded-2xl border border-white/20 transition-all hover:bg-white/20 active:scale-[0.98]"
            >
              Back to gallery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustryModal;
