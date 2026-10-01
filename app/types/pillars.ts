import * as THREE from 'three';

export interface Pillar {
  point: THREE.Vector3;
  year: string;
  title: string;
  subtitle?: string;
  position: 'left' | 'right';
}
