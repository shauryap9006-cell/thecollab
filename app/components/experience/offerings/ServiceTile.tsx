'use client';

import { Edges, Text, TextProps, useCursor } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from "three";

import { usePortalStore, whatsappServiceLink } from "@stores";
import { Service } from "@types";
import ServiceAsset from "./ServiceAsset";

interface ServiceTileProps {
  service: Service;
  index: number;
  position: [number, number, number];
  rotation: [number, number, number];
  activeId: number | null;
  onClick: () => void;
}

const ServiceTile = ({ service, index, position, rotation, activeId, onClick }: ServiceTileProps) => {
  const tileRef = useRef<THREE.Group>(null);
  const hoverAnimRef = useRef<gsap.core.Timeline | null>(null);
  const [hovered, setHovered] = useState(false);
  const isOfferingsActive = usePortalStore((state) => state.activePortalId === "offerings");

  useCursor(hovered && !isMobile);

  const titleProps = useMemo(() => ({
    font: "./soria-font.ttf",
    color: "black",
  }), []);

  const subtitleProps: Partial<TextProps> = useMemo(() => ({
    font: "./Vercetti-Regular.woff",
    color: "black",
    anchorX: "left",
    anchorY: "top",
  }), []);

  useEffect(() => {
    if (!tileRef.current) return;
    hoverAnimRef.current?.kill();

    const [mesh, title, dateGroup, textBox, button] = tileRef.current.children;

    hoverAnimRef.current = gsap.timeline();
    hoverAnimRef.current
      .to(tileRef.current.position, { z: hovered ? 1 : 0, duration: 0.2 }, 0)
      .to(tileRef.current.position, { y: hovered ? 0.4 : 0 }, 0)
      .to(tileRef.current.scale, {
        x: hovered ? 1.3 : 1,
        y: hovered ? 1.3 : 1,
        z: hovered ? 1.3 : 1,
      }, 0)
      .to(title.position, { y: hovered ? 0.7 : -0.8 }, 0)
      .to(textBox.position, { y: hovered ? 0.7 : 0 }, 0)
      .to(textBox, { fillOpacity: hovered ? 1 : 0, duration: 0.4 }, 0)
      .to(dateGroup.position, { y: hovered ? 2.6 : 1.4 }, 0)
      .to(mesh.scale, { y: hovered ? 2 : 1 }, 0)
      .to((mesh as THREE.Mesh).material, { opacity: hovered ? 0.95 : 0.3 }, 0)
      .to(mesh.position, { y: hovered ? 1 : 0 }, 0);

    hoverAnimRef.current
      .to(button.scale, { y: hovered ? 1 : 0, x: hovered ? 1 : 0 }, 0)
      .to(button.position, { z: hovered ? 0.3 : -1 }, 0);
  }, [hovered]);

  useEffect(() => {
    if (isMobile) {
      setHovered(activeId === index);
    }
  }, [isMobile, activeId, index]);

  useEffect(() => {
    if (tileRef.current) {
      gsap.to(tileRef.current.position, {
        y: isOfferingsActive ? 0 : -10,
        duration: 1,
        delay: isOfferingsActive ? index * 0.1 : 0,
      });
    }
  }, [isOfferingsActive, index]);

  const handleEnquire = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const button = e.eventObject;
    gsap.to(button.position, { z: 0, duration: 0.1 })
      .then(() => gsap.to(button.position, { z: 0.3, duration: 0.3 }));
    setTimeout(() => window.open(whatsappServiceLink(service.title), '_blank'), 50);
  };

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={onClick}
      onPointerOver={() => !isMobile && isOfferingsActive && setHovered(true)}
      onPointerOut={() => !isMobile && isOfferingsActive && setHovered(false)}>
      <ServiceAsset icon={service.icon} hovered={hovered} />
      <group ref={tileRef}>
        <mesh>
          <planeGeometry args={[4.2, 2, 1]} />
          <meshBasicMaterial color="#FFF" transparent opacity={0.3} />
          <Edges color="black" lineWidth={1.5} />
        </mesh>
        <Text
          {...titleProps}
          position={[-1.9, -0.8, 0.101]}
          anchorX="left"
          anchorY="bottom"
          maxWidth={4}
          fontSize={0.65}>
          {service.title}
        </Text>
        <group position={[-1.35, 1.4, 0.01]}>
          <mesh>
            <planeGeometry args={[1.7, 0.4, 1]} />
            <meshBasicMaterial color="#777" opacity={0} wireframe />
            <Edges color="black" lineWidth={1} />
          </mesh>
          <Text
            {...subtitleProps}
            position={[-0.7, 0.2, 0]}
            fontSize={0.22}>
            {service.date}
          </Text>
        </group>
        <Text
          {...subtitleProps}
          maxWidth={3.8}
          position={[-1.9, 2.3, 0.1]}
          fontSize={0.2}>
          {service.subtext}
        </Text>
        <group
          position={[1.3, -0.6, -1]}
          scale={[0, 0, 1]}
          onClick={handleEnquire}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'auto'}>
          <mesh>
            <boxGeometry args={[1.3, 0.4, 0.2]} />
            <meshBasicMaterial color="#0e7490" />
            <Edges color="white" lineWidth={1} />
          </mesh>
          <Text
            font="./Vercetti-Regular.woff"
            color="white"
            anchorX="center"
            anchorY="middle"
            position={[0, 0.02, 0.2]}
            fontSize={0.22}>
            ENQUIRE ↗
          </Text>
        </group>
      </group>
    </group>
  );
};

export default ServiceTile;
