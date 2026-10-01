'use client';

import { useEffect, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";
import ServiceTile from "./ServiceTile";

import { SERVICES } from "@constants";
import { usePortalStore } from "@stores";

const OfferingsCarousel = () => {
  const [activeId, setActiveId] = useState<number | null>(null);
  const isActive = usePortalStore((state) => state.activePortalId === "offerings");

  useEffect(() => {
    if (!isActive) setActiveId(null);
  }, [isActive]);

  const onClick = (id: number) => {
    if (!isMobile) return;
    setActiveId(id === activeId ? null : id);
  };

  const tiles = useMemo(() => {
    const fov = Math.PI;
    const distance = 13;
    const count = SERVICES.length;

    return SERVICES.map((service, i) => {
      const angle = (fov / count) * i;
      const z = -distance * Math.sin(angle);
      const x = -distance * Math.cos(angle);
      const rotY = Math.PI / 2 - angle;

      return (
        <ServiceTile
          key={i}
          service={service}
          index={i}
          position={[x, 1, z]}
          rotation={[0, rotY, 0]}
          activeId={activeId}
          onClick={() => onClick(i)}
        />
      );
    });
  }, [activeId, isActive]);

  return (
    <group rotation={[0, -Math.PI / 12, 0]}>
      {tiles}
    </group>
  );
};

export default OfferingsCarousel;
