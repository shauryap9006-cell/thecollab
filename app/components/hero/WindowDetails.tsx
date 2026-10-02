'use client';

/* ═══════════════════════════════════════════════════════════════════════════
   WINDOW DETAILS — "EVENT HORIZON"
   Same export · same scroll range · same imports. Drop-in replacement.

   • Light burst   — anamorphic rays + warm→cold core pouring out of the portal
   • Vortex dust   — 1800 GPU particles spiralling into the portal, they scatter
                     around your cursor
   • Comets        — two ribbon-trail comets orbiting on tilted 3D paths
   • Dot rings     — instrument rings with a travelling light wave
   • Type tunnel   — "thecollab." echoes down the Y axis into the window
   • Ledger blocks — hoverable rows, magnetic slide + hairline expand
   • Chapters      — ghost roman numerals, hover to ignite
   • Cursor reticle— projected onto the scene plane, with soft glow
═══════════════════════════════════════════════════════════════════════════ */

import { Billboard, Text, useScroll } from '@react-three/drei';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { type ComponentProps, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { withBasePath } from '@constants';
import { useIsMobile } from '@/app/hooks/useIsMobile';

/* ── tokens ─────────────────────────────────────────────────────────────── */
const TAU = Math.PI * 2;
const SERIF = withBasePath('./soria-font.ttf');
const SANS = withBasePath('./Vercetti-Regular.woff');
const ICE = '#9fd9ea';
const SOFT = '#cbd5e1';
const WARM = '#ffb070';

type OpRef = { current: number };
type Num = number | (() => number);
const val = (n: Num) => (typeof n === 'function' ? n() : n);
/** staggered reveal: every element enters at its own point of the scroll range */
const stage = (o: number, d: number) => THREE.MathUtils.smoothstep(o, d, d + 0.45);

const UV_VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }
`;

const RETICLE_TICKS = [
  0.17, 0, 0, 0.25, 0, 0, -0.17, 0, 0, -0.25, 0, 0,
  0, 0.17, 0, 0, 0.25, 0, 0, -0.17, 0, 0, -0.25, 0,
];

/* ═══ HOOKS / PRIMITIVES ═══════════════════════════════════════════════════ */

const useHover = (opRef: OpRef) => {
  const h = useRef(0);
  const t = useRef(0);
  const tick = (dt: number) => {
    h.current = THREE.MathUtils.damp(h.current, t.current, 9, dt);
  };
  const bind = useMemo(
    () => ({
      onPointerOver: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (opRef.current < 0.4) return;
        t.current = 1;
        document.body.style.cursor = 'pointer';
      },
      onPointerOut: () => {
        t.current = 0;
        document.body.style.cursor = '';
      },
    }),
    [opRef],
  );
  return { h, bind, tick };
};

type FadeTextProps = ComponentProps<typeof Text> & {
  opRef: OpRef;
  base?: Num;
  stroke?: Num;
  delay?: number;
};
const FadeText = ({ opRef, base = 1, stroke, delay = 0, ...rest }: FadeTextProps) => {
  const ref = useRef<THREE.Mesh & { fillOpacity: number; strokeOpacity: number }>(null);
  useFrame(() => {
    const k = stage(opRef.current, delay);
    if (!ref.current) return;
    ref.current.fillOpacity = val(base) * k;
    if (stroke !== undefined) ref.current.strokeOpacity = val(stroke) * k;
  });
  return <Text ref={ref} fillOpacity={0} strokeOpacity={0} {...rest} />;
};

/** flat plate: hairline / diamond / rail. Scales outward from its origin. */
const Plate = ({
  opRef, w, h = 0.004, dir = 1, color = SOFT, base = 0.4, delay = 0,
  scaleX, rot = 0, position = [0, 0, 0],
}: {
  opRef: OpRef; w: number; h?: number; dir?: number; color?: string; base?: Num;
  delay?: number; scaleX?: () => number; rot?: number; position?: [number, number, number];
}) => {
  const g = useRef<THREE.Group>(null);
  const m = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    if (g.current) g.current.scale.x = scaleX ? scaleX() : 1;
    if (m.current) m.current.opacity = val(base) * stage(opRef.current, delay);
  });
  return (
    <group ref={g} position={position}>
      <mesh position={[dir * w * 0.5, 0, 0]} rotation={[0, 0, rot]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial ref={m} color={color} transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
};

/** raw line segments */
const Seg = ({
  pts, opRef, base = 0.3, delay = 0, color = SOFT,
}: { pts: number[]; opRef: OpRef; base?: number; delay?: number; color?: string }) => {
  const m = useRef<THREE.LineBasicMaterial>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pts.join(',')]);
  useFrame(() => {
    if (m.current) m.current.opacity = base * stage(opRef.current, delay);
  });
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial ref={m} color={color} transparent opacity={0} depthWrite={false} />
    </lineSegments>
  );
};

/** hairline circle (world XZ or camera-facing XY) */
const Circle = ({
  r, plane = 'xz', seg = 96, opRef, base = 0.25, delay = 0, color = SOFT, spin = 0,
}: {
  r: number; plane?: 'xy' | 'xz'; seg?: number; opRef: OpRef; base?: Num;
  delay?: number; color?: string; spin?: number;
}) => {
  const ref = useRef<THREE.LineLoop>(null);
  const m = useRef<THREE.LineBasicMaterial>(null);
  const geo = useMemo(() => {
    const p: number[] = [];
    for (let i = 0; i < seg; i++) {
      const a = (i / seg) * TAU;
      p.push(Math.cos(a) * r, plane === 'xy' ? Math.sin(a) * r : 0, plane === 'xz' ? Math.sin(a) * r : 0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    return g;
  }, [r, plane, seg]);
  useFrame((_, dt) => {
    if (ref.current && spin) {
      if (plane === 'xy') ref.current.rotation.z += dt * spin;
      else ref.current.rotation.y += dt * spin;
    }
    if (m.current) m.current.opacity = val(base) * stage(opRef.current, delay);
  });
  return (
    <lineLoop ref={ref} geometry={geo}>
      <lineBasicMaterial ref={m} color={color} transparent opacity={0} depthWrite={false} />
    </lineLoop>
  );
};

/** soft additive orb, camera-facing */
const Glow = ({
  opRef, size, color, base = 1, delay = 0.2, tight = 40,
}: { opRef: OpRef; size: number; color: string; base?: number; delay?: number; tight?: number }) => {
  const u = useMemo(
    () => ({ uOp: { value: 0 }, uColor: { value: new THREE.Color(color) }, uTight: { value: tight } }),
    [color, tight],
  );
  useFrame(() => {
    u.uOp.value = base * stage(opRef.current, delay);
  });
  return (
    <Billboard>
      <mesh>
        <planeGeometry args={[size, size]} />
        <shaderMaterial
          uniforms={u}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={UV_VERT}
          fragmentShader={/* glsl */ `
            varying vec2 vUv; uniform float uOp, uTight; uniform vec3 uColor;
            void main(){
              float d = length(vUv - .5) * 2.;
              float a = exp(-d*d*uTight) + exp(-d*d*5.) * .22;
              a *= 1. - smoothstep(.75, 1., d);
              gl_FragColor = vec4(uColor, a * uOp);
            }
          `}
        />
      </mesh>
    </Billboard>
  );
};

/* ═══ LIGHT & ATMOSPHERE ═══════════════════════════════════════════════════ */

/** rays pouring out of the portal + anamorphic flare + warm core */
const Burst = ({ opRef, size }: { opRef: OpRef; size: number }) => {
  const u = useMemo(() => ({ uOp: { value: 0 }, uTime: { value: 0 } }), []);
  useFrame(({ clock }) => {
    u.uOp.value = stage(opRef.current, 0);
    u.uTime.value = clock.elapsedTime;
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <planeGeometry args={[size, size]} />
      <shaderMaterial
        uniforms={u}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={UV_VERT}
        fragmentShader={/* glsl */ `
          varying vec2 vUv; uniform float uOp, uTime;
          float h(float x){ return fract(sin(x * 127.1) * 43758.5453); }
          float rays(float ang, float n, float t){
            float x = (ang / 6.2831853 + .5) * n + t;
            float i = floor(x), f = fract(x);
            f = f * f * (3. - 2. * f);
            return mix(h(mod(i, n)), h(mod(i + 1., n)), f);
          }
          void main(){
            vec2 p = (vUv - .5) * 2.;
            float d = length(p);
            float ang = atan(p.y, p.x);
            float r1 = rays(ang, 46., uTime * .25);
            float r2 = rays(ang, 17., -uTime * .12);
            float rr = pow(r1, 3.) * .7 + pow(r2, 2.) * .5;
            float fall = exp(-d * 4.2);
            float core = exp(-d*d*220.) * .8 + exp(-d*d*28.) * .2;
            float flare = exp(-abs(p.y) * 70.) * exp(-abs(p.x) * 3.2) * .32;
            float edge = smoothstep(1., .55, d);
            vec3 warm = vec3(1., .74, .45), cold = vec3(.42, .78, 1.);
            vec3 col = mix(warm, cold, smoothstep(0., .38, d));
            float a = (rr * fall * .4 + core + flare) * edge * uOp;
            gl_FragColor = vec4(col, min(a, 1.));
          }
        `}
      />
    </mesh>
  );
};

/** particles spiralling into the portal; they scatter away from the cursor */
const Dust = ({
  opRef, count, mouse,
}: { opRef: OpRef; count: number; mouse: { x: number; z: number } }) => {
  const dpr = useThree((s) => s.viewport.dpr);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const seed = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      seed[i * 4] = Math.random();
      seed[i * 4 + 1] = Math.random() * TAU;
      seed[i * 4 + 2] = 0.5 + Math.random();
      seed[i * 4 + 3] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
    return g;
  }, [count]);
  const u = useMemo(
    () => ({ uTime: { value: 0 }, uOp: { value: 0 }, uDpr: { value: dpr }, uMouse: { value: new THREE.Vector2(99, 99) } }),
    [dpr],
  );
  useFrame(({ clock }) => {
    u.uTime.value = clock.elapsedTime;
    u.uOp.value = stage(opRef.current, 0.05);
    u.uMouse.value.set(mouse.x, mouse.z);
  });
  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial
        uniforms={u}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={/* glsl */ `
          attribute vec4 aSeed; uniform float uTime, uDpr; uniform vec2 uMouse;
          varying float vA; varying float vH;
          void main(){
            float prog = fract(aSeed.x + uTime * .016 * aSeed.z);
            float r = mix(7.5, .9, pow(prog, 1.15));
            float a = aSeed.y + prog * 2.6 + uTime * .025;
            vec3 p = vec3(cos(a) * r * 1.3, (aSeed.w - .5) * 1.6 * (.3 + r * .12), sin(a) * r);
            vec2 dm = p.xz - uMouse;
            float push = smoothstep(1.8, 0., length(dm));
            p.xz += normalize(dm + 1e-4) * push * .55;
            p.y += push * .25;
            vec4 mv = modelViewMatrix * vec4(p, 1.);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = clamp((1.3 + fract(aSeed.w * 13.7) * 2.4) * uDpr * (5. / max(-mv.z, .5)), 1., 11. * uDpr);
            vA = smoothstep(0., .15, prog) * smoothstep(1., .75, prog)
               * (.3 + .7 * fract(aSeed.w * 7.3)) * (.65 + .35 * sin(uTime * 1.8 + aSeed.y * 9.))
               + push * .6;
            vH = prog;
          }
        `}
        fragmentShader={/* glsl */ `
          uniform float uOp; varying float vA; varying float vH;
          void main(){
            float d = length(gl_PointCoord - .5);
            float a = smoothstep(.5, 0., d);
            vec3 col = mix(vec3(.6, .84, 1.), vec3(1., .78, .52), smoothstep(.5, 1., vH));
            gl_FragColor = vec4(col, a * vA * uOp * .85);
          }
        `}
      />
    </points>
  );
};

/** dotted instrument ring with a light wave travelling around it */
const DotRing = ({
  opRef, r, count, speed, size = 1, color = ICE, delay = 0.1,
}: { opRef: OpRef; r: number; count: number; speed: number; size?: number; color?: string; delay?: number }) => {
  const dpr = useThree((s) => s.viewport.dpr);
  const geo = useMemo(() => {
    const p = new Float32Array(count * 3);
    const a = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * TAU;
      p[i * 3] = Math.cos(ang) * r;
      p[i * 3 + 2] = Math.sin(ang) * r;
      a[i] = ang;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('aAng', new THREE.BufferAttribute(a, 1));
    return g;
  }, [count, r]);
  const u = useMemo(
    () => ({
      uTime: { value: 0 }, uOp: { value: 0 }, uDpr: { value: dpr },
      uSpeed: { value: speed }, uSize: { value: size }, uColor: { value: new THREE.Color(color) },
    }),
    [dpr, speed, size, color],
  );
  useFrame(({ clock }) => {
    u.uTime.value = clock.elapsedTime;
    u.uOp.value = stage(opRef.current, delay);
  });
  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial
        uniforms={u}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={/* glsl */ `
          attribute float aAng; uniform float uTime, uDpr, uSpeed, uSize; varying float vW;
          void main(){
            vW = pow(.5 + .5 * sin(aAng * 2. - uTime * uSpeed), 6.);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
            gl_PointSize = (1.5 + vW * 3.5) * uSize * uDpr;
          }
        `}
        fragmentShader={/* glsl */ `
          uniform float uOp; uniform vec3 uColor; varying float vW;
          void main(){
            float d = length(gl_PointCoord - .5);
            float a = smoothstep(.5, .15, d);
            gl_FragColor = vec4(uColor, a * (.2 + .8 * vW) * uOp);
          }
        `}
      />
    </points>
  );
};

/** comet with a tapering ribbon trail on a tilted 3D orbit */
const Comet = ({
  opRef, rx, rz, amp, speed, phase, color, width, trail = 1.35,
}: {
  opRef: OpRef; rx: number; rz: number; amp: number; speed: number;
  phase: number; color: string; width: number; trail?: number;
}) => {
  const N = 90;
  const head = useRef<THREE.Group>(null);
  const tmp = useMemo(() => new Float32Array(N * 3), []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3));
    const t = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) t[i * 2] = t[i * 2 + 1] = 1 - i / (N - 1);
    g.setAttribute('aT', new THREE.BufferAttribute(t, 1));
    const idx: number[] = [];
    for (let i = 0; i < N - 1; i++) {
      const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
      idx.push(a, b, c, b, d, c);
    }
    g.setIndex(idx);
    return g;
  }, []);
  const u = useMemo(() => ({ uOp: { value: 0 }, uColor: { value: new THREE.Color(color) } }), [color]);

  useFrame(({ clock }) => {
    const dir = Math.sign(speed) || 1;
    const t0 = clock.elapsedTime * speed + phase;
    const step = trail / N;
    for (let i = 0; i < N; i++) {
      const a = t0 - dir * i * step;
      tmp[i * 3] = Math.cos(a) * rx;
      tmp[i * 3 + 1] = Math.sin(a * 2 + phase) * amp;
      tmp[i * 3 + 2] = Math.sin(a) * rz;
    }
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < N; i++) {
      const j = Math.min(i + 1, N - 1);
      const k = Math.max(i - 1, 0);
      const tx = tmp[j * 3] - tmp[k * 3];
      const tz = tmp[j * 3 + 2] - tmp[k * 3 + 2];
      const len = Math.hypot(tx, tz) || 1;
      const nx = -tz / len, nz = tx / len;
      const w = width * 0.5 * (1 - i / (N - 1));
      const x = tmp[i * 3], y = tmp[i * 3 + 1], z = tmp[i * 3 + 2];
      pos.setXYZ(i * 2, x + nx * w, y, z + nz * w);
      pos.setXYZ(i * 2 + 1, x - nx * w, y, z - nz * w);
    }
    pos.needsUpdate = true;
    head.current?.position.set(tmp[0], tmp[1], tmp[2]);
    u.uOp.value = stage(opRef.current, 0.2);
  });

  return (
    <>
      <mesh geometry={geo} frustumCulled={false}>
        <shaderMaterial
          uniforms={u}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          vertexShader={/* glsl */ `
            attribute float aT; varying float vT;
            void main(){ vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }
          `}
          fragmentShader={/* glsl */ `
            uniform float uOp; uniform vec3 uColor; varying float vT;
            void main(){
              float a = pow(vT, 2.4);
              vec3 c = mix(uColor, vec3(1.), pow(vT, 5.));
              gl_FragColor = vec4(c, a * uOp * .95);
            }
          `}
        />
      </mesh>
      <group ref={head}>
        <Glow opRef={opRef} size={0.9} color={color} base={0.9} delay={0.25} tight={60} />
        <Glow opRef={opRef} size={0.26} color="#ffffff" base={1} delay={0.25} tight={120} />
      </group>
    </>
  );
};

/* ═══ TYPOGRAPHY ═══════════════════════════════════════════════════════════ */

/** hero word + outline echoes that recede down the Y axis toward the portal */
const Tunnel = ({ opRef, m }: { opRef: OpRef; m: boolean }) => {
  const L = m ? 5 : 7;
  return (
    <>
      {Array.from({ length: L }, (_, i) => {
        const k = i / (L - 1);
        return (
          <Billboard key={i} position={[0, -i * 0.16, i * (m ? 0.08 : 0.14)]} scale={1 - i * 0.075}>
            <FadeText
              font={SERIF}
              fontSize={m ? 0.28 : 0.5}
              letterSpacing={0.02}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              opRef={opRef}
              delay={0.04 + i * 0.05}
              base={i === 0 ? 0.98 : 0}
              stroke={i === 0 ? 0 : 0.5 * Math.pow(1 - k, 1.6) + 0.05}
              strokeWidth={i === 0 ? 0 : 0.004}
              strokeColor={ICE}
            >
              thecollab.
            </FadeText>
          </Billboard>
        );
      })}
    </>
  );
};

const Row = ({
  opRef, dir, y, step, label, value, delay, m,
}: {
  opRef: OpRef; dir: number; y: number; step: number; label: string; value: string; delay: number; m: boolean;
}) => {
  const g = useRef<THREE.Group>(null);
  const { h, bind, tick } = useHover(opRef);
  useFrame((_, dt) => {
    tick(dt);
    if (g.current) g.current.position.x = dir * 0.09 * h.current;
  });
  const anchor = dir < 0 ? 'right' : 'left';
  return (
    <group position={[0, y, 0]}>
      <group ref={g}>
        <FadeText
          font={SANS} fontSize={m ? 0.05 : 0.062} letterSpacing={0.18} color={ICE}
          anchorX={anchor} anchorY="middle" position={[dir * 0.16, step * 0.2, 0]}
          opRef={opRef} delay={delay} base={() => 0.78 + 0.22 * h.current}
        >
          {label}
        </FadeText>
        <FadeText
          font={SERIF} fontSize={m ? 0.1 : 0.15} color="#ffffff"
          anchorX={anchor} anchorY="middle" position={[dir * 0.16, -step * 0.12, 0]}
          opRef={opRef} delay={delay} base={() => 0.95 + 0.05 * h.current}
        >
          {value}
        </FadeText>
      </group>
      <Plate
        opRef={opRef} w={m ? 1.1 : 1.8} dir={dir} color={ICE} base={0.25} delay={delay}
        position={[0, -step * 0.5, 0]} scaleX={() => 0.45 + 0.55 * h.current}
      />
      <Plate
        opRef={opRef} w={0.05} h={0.05} dir={0} rot={Math.PI / 4} color={ICE}
        base={() => 0.35 + 0.65 * h.current} delay={delay}
      />
      <mesh position={[dir * 0.9, 0, 0]} {...bind}>
        <planeGeometry args={[1.8, step]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
};

const Block = ({
  opRef, side, x, title, rows, m,
}: {
  opRef: OpRef; side: 'left' | 'right'; x: number; title: string;
  rows: { label: string; value: string }[]; m: boolean;
}) => {
  const dir = side === 'left' ? -1 : 1;
  const anchor = side === 'left' ? 'right' : 'left';
  const step = m ? 0.24 : 0.36;
  const n = rows.length;
  return (
    <Billboard position={[x, 0, 0]}>
      <Plate opRef={opRef} w={(n + 1.4) * step} dir={0} rot={Math.PI / 2} color={ICE} base={0.4} h={0.005} />
      <FadeText
        font={SANS} fontSize={m ? 0.048 : 0.058} letterSpacing={0.28} color={ICE}
        anchorX={anchor} anchorY="middle" position={[dir * 0.16, (n / 2 + 0.55) * step, 0]}
        opRef={opRef} base={0.95} delay={0.05}
      >
        {title}
      </FadeText>
      {rows.map((r, i) => (
        <Row
          key={r.label} opRef={opRef} dir={dir} step={step} m={m}
          y={((n - 1) / 2 - i) * step} label={r.label} value={r.value} delay={0.1 + i * 0.09}
        />
      ))}
    </Billboard>
  );
};

/** chapter node: ghost numeral + word + caption. Hover ignites it. */
const Discipline = ({
  opRef, pos, dir, no, word, cap, delay, m,
}: {
  opRef: OpRef; pos: [number, number, number]; dir: 1 | -1;
  no: string; word: string; cap: string; delay: number; m: boolean;
}) => {
  const g = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null);
  const { h, bind, tick } = useHover(opRef);
  useFrame((_, dt) => {
    tick(dt);
    if (g.current) g.current.position.x = dir * 0.1 * h.current;
    if (ring.current) ring.current.scale.setScalar(1 + 1.1 * h.current);
    if (ringMat.current) ringMat.current.opacity = (0.75 - 0.4 * h.current) * stage(opRef.current, delay);
  });
  const anchor = dir > 0 ? 'left' : 'right';
  const tx = dir * (m ? 0.22 : 0.32);
  const wx = dir * (m ? 0.36 : 0.52);
  return (
    <group position={pos}>
      <Billboard>
        <mesh ref={ring}>
          <ringGeometry args={[0.085, 0.09, 48]} />
          <meshBasicMaterial ref={ringMat} color={ICE} transparent opacity={0} depthWrite={false} />
        </mesh>
        <Plate opRef={opRef} w={0.035} h={0.035} dir={0} rot={Math.PI / 4} color={WARM} base={0.95} delay={delay} />
        <group ref={g}>
          <FadeText
            font={SERIF} fontSize={m ? 0.5 : 0.9} color="#ffffff"
            anchorX={anchor} anchorY="middle" position={[tx, 0.02, -0.02]}
            opRef={opRef} delay={delay} base={() => 0.08 + 0.22 * h.current}
            stroke={() => 0.28 + 0.5 * h.current} strokeWidth={0.0035} strokeColor="#ffffff"
          >
            {no}
          </FadeText>
          <FadeText
            font={SERIF} fontSize={m ? 0.11 : 0.2} color="#ffffff"
            anchorX={anchor} anchorY="middle" position={[wx, 0.02, 0]}
            opRef={opRef} delay={delay} base={() => 0.96 + 0.04 * h.current}
          >
            {word}
          </FadeText>
          <FadeText
            font={SANS} fontSize={m ? 0.046 : 0.058} letterSpacing={0.18} color={ICE}
            anchorX={anchor} anchorY="middle" position={[wx, m ? -0.13 : -0.2, 0]}
            opRef={opRef} delay={delay} base={() => 0.88 + 0.12 * h.current}
          >
            {cap}
          </FadeText>
        </group>
        <mesh position={[dir * 0.95, 0, 0]} {...bind}>
          <planeGeometry args={[1.9, 0.7]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </Billboard>
    </group>
  );
};

/** scroll cue: a drop of light falling into the word */
const Cue = ({ opRef, len }: { opRef: OpRef; len: number }) => {
  const dot = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    const k = (clock.elapsedTime * 0.55) % 1;
    if (dot.current) dot.current.position.y = len * (1 - k);
    if (mat.current) mat.current.opacity = Math.sin(Math.PI * k) * stage(opRef.current, 0.4);
  });
  return (
    <group position={[0, 0.14, 0]}>
      <Plate opRef={opRef} w={len} dir={0} rot={Math.PI / 2} color={ICE} base={0.3} delay={0.4} position={[0, len / 2, 0]} />
      <mesh ref={dot} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[0.045, 0.045]} />
        <meshBasicMaterial ref={mat} color={WARM} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

/* ═══ MAIN ═════════════════════════════════════════════════════════════════ */

export const WindowDetails = () => {
  const shell = useRef<THREE.Group>(null);
  const rig = useRef<THREE.Group>(null);
  const cursor = useRef<THREE.Group>(null);
  const op = useRef(0);
  const mouse = useRef({ x: 99, z: 99 }).current;
  const rc = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const data = useScroll();
  const isMobile = useIsMobile();
  const m = isMobile;
  const f = m ? 0.55 : 1;

  // spatial system — world XZ plane, camera looks down onto it
  const lx = -4.5 * f, rx = 4.5 * f;
  const fz = -3.25 * f, bz = 3.25 * f;
  const cx = 3.25 * f, cz = 2.2 * f;
  const R1 = 1.25 * f, R2 = 3.05 * f;

  useFrame(({ pointer, camera }, dt) => {
    const enter = data.range(0.28, 0.12);
    const exit = data.range(0.57, 0.09);
    op.current = THREE.MathUtils.damp(op.current, Math.max(0, enter * (1 - exit)), 8, dt);
    const s = shell.current;
    if (!s) return;
    s.visible = op.current > 0.005;
    if (!s.visible) return;

    const r = rig.current;
    if (r) {
      r.scale.setScalar(0.94 + 0.06 * op.current);
      r.rotation.x = THREE.MathUtils.damp(r.rotation.x, -pointer.y * 0.06, 4, dt);
      r.rotation.z = THREE.MathUtils.damp(r.rotation.z, pointer.x * 0.05, 4, dt);
    }

    // project cursor onto the scene plane (feeds dust + reticle)
    if (pointer.lengthSq() > 0) {
      rc.setFromCamera(pointer, camera);
      if (rc.ray.intersectPlane(plane, hit)) {
        mouse.x = THREE.MathUtils.damp(mouse.x > 90 ? hit.x : mouse.x, hit.x, 7, dt);
        mouse.z = THREE.MathUtils.damp(mouse.z > 90 ? hit.z : mouse.z, hit.z, 7, dt);
      }
    }
    if (cursor.current) {
      cursor.current.visible = mouse.x < 90;
      cursor.current.position.set(mouse.x, 0.02, mouse.z);
    }
  });

  const leaderPts = useMemo(() => {
    const p: number[] = [];
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const vx = sx * cx, vz = sz * cz, l = Math.hypot(vx, vz);
      const ux = vx / l, uz = vz / l;
      p.push(ux * (l - 0.35 * f), 0, uz * (l - 0.35 * f), ux * R1 * 1.35, 0, uz * R1 * 1.35);
    }
    return p;
  }, [cx, cz, R1, f]);

  return (
    <group ref={shell}>
      {/* ── LIGHT + DEPTH ─────────────────────────────────── */}
      <Burst opRef={op} size={13 * f} />
      <Dust opRef={op} count={m ? 700 : 1800} mouse={mouse} />

      <group ref={rig}>
        {/* ── INSTRUMENTS ─────────────────────────────────── */}
        <DotRing opRef={op} r={R1} count={140} speed={0.9} size={0.9} delay={0.08} />
        <DotRing opRef={op} r={R2} count={260} speed={-0.6} size={1.1} color={SOFT} delay={0.14} />
        <Seg pts={leaderPts} opRef={op} base={0.14} delay={0.25} color={ICE} />

        <Comet opRef={op} rx={2.6 * f} rz={1.8 * f} amp={0.45} speed={0.28} phase={0.6} color={ICE} width={0.07 * f} />
        <Comet opRef={op} rx={1.7 * f} rz={2.5 * f} amp={0.4} speed={-0.2} phase={2.4} color={WARM} width={0.06 * f} trail={1.1} />

        {/* ── HEADLINE ────────────────────────────────────── */}
        <group position={[0, 0, fz]}>
          <Tunnel opRef={op} m={m} />
          <Billboard>
            <FadeText
              font={SANS} fontSize={m ? 0.065 : 0.08} letterSpacing={0.22} color={ICE}
              anchorX="center" anchorY="middle" position={[0, m ? -0.34 : -0.52, 0]}
              opRef={op} base={0.92} delay={0.14}
            >
              GROWTH STUDIO // EST. 2026
            </FadeText>
            <Plate opRef={op} w={m ? 0.4 : 0.7} dir={-1} color={ICE} base={0.5} delay={0.2} position={[m ? -0.8 : -1.3, m ? -0.34 : -0.52, 0]} />
            <Plate opRef={op} w={m ? 0.4 : 0.7} dir={1} color={ICE} base={0.5} delay={0.2} position={[m ? 0.8 : 1.3, m ? -0.34 : -0.52, 0]} />
          </Billboard>
        </group>

        {/* ── LEDGER BLOCKS ───────────────────────────────── */}
        <Block
          opRef={op} side="left" x={lx * 0.88} m={m} title="CAPABILITY // 04"
          rows={[
            { label: '01 // CRAFT', value: 'Digital Worlds.' },
            { label: '02 // SCOPE', value: 'Web + Brand.' },
            { label: '03 // STACK', value: 'Next.js · R3F.' },
            { label: '04 // SPEED', value: 'Rapid Build.' },
          ]}
        />
        <Block
          opRef={op} side="right" x={rx * 0.88} m={m} title="REACH // 04"
          rows={[
            { label: '05 // REACH', value: 'Creator Scale.' },
            { label: '06 // FORMAT', value: 'Reels + Hooks.' },
            { label: '07 // GROWTH', value: 'Organic → Rev.' },
            { label: '08 // RANGE', value: 'Local + Global.' },
          ]}
        />

        {/* ── CHAPTERS ────────────────────────────────────── */}
        <Discipline opRef={op} pos={[-cx, 0, -cz]} dir={1} no="I" word="Architecture." cap="SPATIAL WEB // 3D ENVS" delay={0.3} m={m} />
        <Discipline opRef={op} pos={[cx, 0, -cz]} dir={-1} no="II" word="Virality." cap="CREATOR COLLABS // REACH" delay={0.36} m={m} />
        <Discipline opRef={op} pos={[-cx, 0, cz]} dir={1} no="III" word="Brand." cap="IDENTITY // DIRECTION" delay={0.42} m={m} />
        <Discipline opRef={op} pos={[cx, 0, cz]} dir={-1} no="IV" word="Strategy." cap="CONVERT // SCALE" delay={0.48} m={m} />

        {/* ── CTA ─────────────────────────────────────────── */}
        <Billboard position={[0, 0, bz]}>
          <FadeText
            font={SANS} fontSize={m ? 0.075 : 0.092} letterSpacing={0.34} color={ICE}
            anchorX="center" anchorY="middle" opRef={op} base={0.95} delay={0.35}
          >
            SCROLL TO ENTER
          </FadeText>
          <Cue opRef={op} len={m ? 0.3 : 0.42} />
        </Billboard>
      </group>

      {/* ── CURSOR RETICLE + GLOW ─────────────────────────── */}
      <group ref={cursor} visible={false}>
        <Glow opRef={op} size={1.8} color={ICE} base={0.35} delay={0.3} tight={16} />
        <Billboard>
          <Circle r={0.11} plane="xy" seg={48} opRef={op} base={0.65} delay={0.3} color={ICE} spin={0.8} />
          <Seg pts={RETICLE_TICKS} opRef={op} base={0.55} delay={0.3} color="#ffffff" />
        </Billboard>
      </group>
    </group>
  );
};

export default WindowDetails;