'use client';

import { Box, Edges, Line, Text, TextProps } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { usePortalStore } from '@stores';
import gsap from 'gsap';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { JOURNEY_STEPS, PILLAR_TIMELINE, withBasePath } from '@constants';
import { Pillar } from '@types';
import { useIsMobile } from '@/app/hooks/useIsMobile';

const reusableLeft = new THREE.Vector3(-0.3, 0, -0.1);
const reusableRight = new THREE.Vector3(0.3, 0, -0.1);

const TimelinePoint = ({
  point,
  diff,
  isMobile,
}: {
  point: Pillar;
  diff: number;
  isMobile: boolean;
}) => {
  const getPoint = useMemo(() => {
    switch (point.position) {
      case 'left':
        return reusableLeft;
      case 'right':
        return reusableRight;
      default:
        return new THREE.Vector3();
    }
  }, [point.position]);

  const textAlign = point.position === 'left' ? 'right' : 'left';

  const textProps: Partial<TextProps> = useMemo(
    () => ({
      font: withBasePath('./Vercetti-Regular.woff'),
      color: 'white',
      anchorX: textAlign,
      fillOpacity: 2 - 2 * diff,
    }),
    [textAlign, diff],
  );

  const titleProps = useMemo(
    () => ({
      ...textProps,
      font: withBasePath('./soria-font.ttf'),
      fontSize: 0.6,
      maxWidth: 3,
    }),
    [textProps],
  );

  return (
    <group position={point.point} scale={isMobile ? 0.35 : 0.6}>
      <Box args={[0.2, 0.2, 0.2]} position={[0, 0, -0.1]} scale={[1 - diff, 1 - diff, 1 - diff]}>
        <meshBasicMaterial color="white" wireframe />
        <Edges color="white" lineWidth={1.5} />
      </Box>
      <group>
        <group position={getPoint}>
          <Text {...textProps} fontSize={0.3} position={[-diff / 2, 0, 0]}>
            {point.year}
          </Text>
          <group position={[0, -0.5, 0]}>
            <Text {...titleProps} fontSize={0.6} maxWidth={3} position={[0, -diff / 2, 0]}>
              {point.title}
            </Text>
            <Text {...textProps} fontSize={0.16} maxWidth={4.2} position={[0, -0.4 - diff, 0]}>
              {point.subtitle}
            </Text>
          </group>
        </group>
      </group>
    </group>
  );
};

const Timeline = ({ progress }: { progress: number }) => {
  const { camera } = useThree();
  const isMobile = useIsMobile();
  const isActive = usePortalStore((state) => state.activePortalId === 'services');
  const timeline = useMemo(() => PILLAR_TIMELINE, []);

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        timeline.map((p) => p.point),
        false,
      ),
    [timeline],
  );
  const curvePoints = useMemo(() => curve.getPoints(500), [curve]);
  const visibleCurvePoints = useMemo(
    () => curvePoints.slice(0, Math.max(1, Math.ceil(progress * curvePoints.length))),
    [curvePoints, progress],
  );
  const visibleTimelinePoints = useMemo(
    () => timeline.slice(0, Math.max(1, Math.round(progress * (timeline.length - 1) + 1))),
    [timeline, progress],
  );

  const [visibleDashedCurvePoints, setVisibleDashedCurvePoints] = useState<THREE.Vector3[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFrame((_, delta) => {
    if (isActive) {
      const position = curve.getPoint(progress);
      camera.position.x = THREE.MathUtils.damp(
        camera.position.x,
        (isMobile ? -1 : -2) + position.x,
        4,
        delta,
      );
      camera.position.y = THREE.MathUtils.damp(camera.position.y, -39 + position.z, 4, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, 13 - position.y, 4, delta);
    }
  });

  const groupRef = useRef<THREE.Group>(null);
  const journeyRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const group = groupRef.current;
    const tl = gsap.timeline();
    if (group) {
      tl.to(group.scale, {
        x: isActive ? 1 : 0,
        y: isActive ? 1 : 0,
        z: isActive ? 1 : 0,
        duration: 1,
        delay: isActive ? 0.4 : 0,
      });
      tl.to(
        group.position,
        {
          y: isActive ? 0 : -2,
          duration: 1,
          delay: isActive ? 0.4 : 0,
        },
        0,
      );
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isActive) {
      let i = 0;
      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          const p = i++ / 100;
          setVisibleDashedCurvePoints(
            curvePoints.slice(0, Math.max(1, Math.ceil(p * curvePoints.length))),
          );
          if (i > 100) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }, 10);
      }, 1000);
    } else {
      setVisibleDashedCurvePoints([]);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (group) gsap.killTweensOf(group);
    };
  }, [isActive, curvePoints]);

  // The journey caption appears once the last pillar (THE JOURNEY) is reached.
  const journeyOpacity = Math.max(0, Math.min(1, (progress - 0.85) * 8));

  useEffect(() => {
    const journey = journeyRef.current;
    if (journey) {
      gsap.to(journey.position, {
        y: -2.6,
        duration: 0.5,
      });
    }

    return () => {
      if (journey) gsap.killTweensOf(journey.position);
    };
  }, []);

  return (
    <group position={[0, -0.1, -0.1]}>
      <Line points={visibleCurvePoints} color="white" lineWidth={3} />
      {visibleDashedCurvePoints.length > 0 && (
        <Line
          points={visibleDashedCurvePoints}
          color="white"
          lineWidth={0.5}
          dashed
          dashSize={0.25}
          gapSize={0.25}
        />
      )}
      <group ref={groupRef}>
        {visibleTimelinePoints.map((point, i) => {
          const diff = Math.min(2 * Math.max(i - progress * (timeline.length - 1), 0), 1);
          return <TimelinePoint point={point} key={i} diff={diff} isMobile={isMobile} />;
        })}
      </group>
      <group ref={journeyRef} position={[0, -3.4, 0]}>
        <Text
          font={withBasePath('./Vercetti-Regular.woff')}
          fontSize={0.22}
          color="#9fd9ea"
          anchorX="center"
          anchorY="middle"
          fillOpacity={journeyOpacity}
          letterSpacing={0.15}
        >
          {JOURNEY_STEPS.join('  →  ')}
        </Text>
      </group>
    </group>
  );
};

export default Timeline;
