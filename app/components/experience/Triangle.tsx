'use client';

import * as THREE from "three";
import { useEffect, useMemo } from "react";

export function createTriangleGeometry(points: number[][]): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array(points.flat());
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();

  const uvs = new Float32Array([
    0.5, 0,
    0, 1,
    1, 1
  ]);
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  return geometry;
}

export function TriangleMesh({ points }: { points: number[][] }) {
  const geometry = useMemo(() => createTriangleGeometry(points), [points]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return <primitive object={geometry} attach="geometry" />;
}

export function TriangleGeometry({ points }: { points: number[][] }) {
  return createTriangleGeometry(points);
}
