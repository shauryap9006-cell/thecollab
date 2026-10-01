import * as THREE from "three";
import { Pillar } from "../types";

/**
 * The four pillars of thecollab, plotted along the scroll-driven
 * CatmullRom curve — same engine as the portfolio timeline.
 */
export const PILLAR_TIMELINE: Pillar[] = [
  {
    point: new THREE.Vector3(0, 0, 0),
    year: '01',
    title: 'DEVELOPMENT',
    subtitle: 'Building the digital foundation — fast, modern, conversion-focused websites.',
    position: 'right',
  },
  {
    point: new THREE.Vector3(-4, -4, -3),
    year: '02',
    title: 'CONTENT',
    subtitle: 'A consistent, recognizable presence across Instagram and beyond.',
    position: 'left',
  },
  {
    point: new THREE.Vector3(-3, -1, -6),
    year: '03',
    title: 'CREATORS',
    subtitle: 'Getting the brand in front of relevant, engaged audiences.',
    position: 'left',
  },
  {
    point: new THREE.Vector3(0, -1, -10),
    year: '04',
    title: 'STRATEGY',
    subtitle: 'Connecting everything to an actual business objective.',
    position: 'left',
  },
  {
    point: new THREE.Vector3(1, 1, -12),
    year: '05',
    title: 'THE JOURNEY',
    subtitle: 'DISCOVER → TRUST → EXPLORE → CONTACT → CONVERT',
    position: 'right',
  },
];
