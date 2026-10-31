// Pinned subject: "Verrucci Maison", a fictional Geneva-style luxury watch house.
// Design plan: obsidian + champagne gold. One real 3D reference watch floats fixed on the right,
// it spins with scroll, tilts with the pointer, keeps real time, and its tourbillon keeps turning.
// Colours morph between references. Typography: Cormorant Garamond display, Inter for UI.
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    return () => {
      scene.environment = null;
      envTex.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Watch({ config }) {
  const outer = useRef();
  const tourbillon = useRef();
  const hourHand = useRef();
  const minuteHand = useRef();
  const secondHand = useRef();
  const pointer = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);

  const mats = useMemo(() => {
    const c = (hex) => new THREE.Color(hex);
    return {
      case: new THREE.MeshPhysicalMaterial({ color: c(config.caseHex), metalness: 1, roughness: 0.2, clearcoat: 0.4, clearcoatRoughness: 0.1, side: THREE.DoubleSide }),
      bezel: new THREE.MeshPhysicalMaterial({ color: c(config.bezelHex), metalness: 0.9, roughness: 0.25, clearcoat: 0.6 }),
      dial: new THREE.MeshStandardMaterial({ color: c(config.dialHex), metalness: 0.15, roughness: 0.42 }),
      marker: new THREE.MeshStandardMaterial({ color: c(config.markerHex), metalness: 0.9, roughness: 0.3 }),
      hand: new THREE.MeshStandardMaterial({ color: c(config.handHex), metalness: 1, roughness: 0.22 }),
      strap: new THREE.MeshPhysicalMaterial({ color: c(config.strapHex), roughness: 0.6, sheen: 0.4, sheenRoughness: 0.5 }),
      sec: new THREE.MeshStandardMaterial({ color: "#c2322b", metalness: 0.2, roughness: 0.4 }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#ffffff", transparent: true, opacity: 0.06, roughness: 0.02, metalness: 0, clearcoat: 1 }),
      window: new THREE.MeshStandardMaterial({ color: "#050608", roughness: 0.8, metalness: 0 }),
      gold: new THREE.MeshPhysicalMaterial({ color: c("#d9b06a"), metalness: 1, roughness: 0.3 }),
    };
  }, []);

  const target = useRef({
    case: new THREE.Color(config.caseHex),
    bezel: new THREE.Color(config.bezelHex),
    dial: new THREE.Color(config.dialHex),
    marker: new THREE.Color(config.markerHex),
    hand: new THREE.Color(config.handHex),
    strap: new THREE.Color(config.strapHex),
  });

  useEffect(() => {
    target.current = {
      case: new THREE.Color(config.caseHex),
      bezel: new THREE.Color(config.bezelHex),
      dial: new THREE.Color(config.dialHex),
      marker: new THREE.Color(config.markerHex),
      hand: new THREE.Color(config.handHex),
      strap: new THREE.Color(config.strapHex),
    };
  }, [config]);

  useEffect(() => {
    const onMove = (e) => {
      pointer.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 };
    };
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scroll.current = window.scrollY / max;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const geo = useMemo(() => {
    const profile = [
      new THREE.Vector2(0.0, -0.2),
      new THREE.Vector2(0.86, -0.2),
      new THREE.Vector2(0.98, -0.16),
      new THREE.Vector2(1.04, -0.08),
      new THREE.Vector2(1.06, 0.06),
      new THREE.Vector2(1.02, 0.14),
      new THREE.Vector2(0.0, 0.14),
    ];
    const caseG = new THREE.LatheGeometry(profile, 64);
    const bezelG = new THREE.TorusGeometry(1.0, 0.06, 16, 96);
    const dialG = new THREE.CircleGeometry(0.96, 128);
    const glassG = new THREE.CircleGeometry(1.0, 128);
    const windowG = new THREE.CircleGeometry(0.2, 64);
    const hourG = new THREE.BoxGeometry(0.07, 0.02, 0.5).translate(0, 0, -0.25);
    const minG = new THREE.BoxGeometry(0.045, 0.02, 0.8).translate(0, 0, -0.4);
    const secG = new THREE.BoxGeometry(0.014, 0.025, 0.9).translate(0, 0, -0.32);
    const tipG = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 24);
    const crownG = new THREE.CylinderGeometry(0.07, 0.07, 0.2, 24).rotateZ(Math.PI / 2);
    const lugG = new THREE.BoxGeometry(0.3, 0.12, 0.3);
    const strapCurve = (sign) =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(0, 0, sign * 1.2),
          new THREE.Vector3(0, 0.02, sign * 1.9),
          new THREE.Vector3(0, -0.25, sign * 2.6),
          new THREE.Vector3(0, -0.85, sign * 2.95),
          new THREE.Vector3(0, -1.6, sign * 2.75),
        ],
        false,
        "catmullrom",
        0.5
      );
    const strapG = (sign) => new THREE.TubeGeometry(strapCurve(sign), 60, 0.13, 12);
    return { caseG, bezelG, dialG, glassG, windowG, hourG, minG, secG, tipG, crownG, lugG, strap: [strapG(1), strapG(-1)] };
  }, []);

  const markers = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      const long = i % 3 === 0;
      arr.push({ key: `m${i}`, pos: [Math.sin(a) * 0.8, 0.14, -Math.cos(a) * 0.8], rotY: -a, len: long ? 0.2 : 0.12, w: long ? 0.07 : 0.045 });
    }
    return arr;
  }, []);

  const minuteTicks = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue;
      const a = (i * Math.PI) / 30;
      arr.push({ key: `t${i}`, pos: [Math.sin(a) * 0.88, 0.135, -Math.cos(a) * 0.88], rotY: -a });
    }
    return arr;
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const g = outer.current;
    if (!g) return;
    const wide = window.innerWidth > 900;
    const vw = state.viewport.width;
    const k = 1 - Math.exp(-dt * 4);

    const targetX = wide ? vw * 0.24 : 0;
    const targetY = wide ? 0 : vw * 0.02;
    g.position.x = THREE.MathUtils.lerp(g.position.x, targetX, k);
    g.position.y = THREE.MathUtils.lerp(g.position.y, targetY, k);
    const s = wide ? 1 : 0.7;
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, s, k));

    const p = pointer.current;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, p.y * 0.35 + Math.sin(t * 0.6) * 0.04, k);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, scroll.current * Math.PI * 1.4 + p.x * 0.5 + Math.sin(t * 0.4) * 0.12, k);

    const now = new Date();
    const sec = now.getSeconds() + now.getMilliseconds() / 1000;
    const min = now.getMinutes() + sec / 60;
    const hr = (now.getHours() % 12) + min / 60;
    if (secondHand.current) secondHand.current.rotation.y = -(sec / 60) * Math.PI * 2;
    if (minuteHand.current) minuteHand.current.rotation.y = -(min / 60) * Math.PI * 2;
    if (hourHand.current) hourHand.current.rotation.y = -(hr / 12) * Math.PI * 2;
    if (tourbillon.current) tourbillon.current.rotation.y = t * 1.8;

    const tg = target.current;
    mats.case.color.lerp(tg.case, k);
    mats.bezel.color.lerp(tg.bezel, k);
    mats.dial.color.lerp(tg.dial, k);
    mats.marker.color.lerp(tg.marker, k);
    mats.hand.color.lerp(tg.hand, k);
    mats.strap.color.lerp(tg.strap, k);
  });

  const { caseG, bezelG, dialG, glassG, windowG, hourG, minG, secG, tipG, crownG, lugG, strap } = geo;

  return (
    <group ref={outer}>
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh geometry={caseG} material={mats.case} />
        <mesh geometry={bezelG} material={mats.bezel} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.14, 0]} />
        <mesh geometry={dialG} material={mats.dial} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.125, 0]} />
        <mesh geometry={glassG} material={mats.glass} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]} />

        {markers.map((m) => (
          <mesh key={m.key} position={m.pos} rotation={[0, m.rotY, 0]} material={mats.marker}>
            <boxGeometry args={[m.w, 0.02, m.len]} />
          </mesh>
        ))}
        {minuteTicks.map((m) => (
          <mesh key={m.key} position={m.pos} rotation={[0, m.rotY, 0]} material={mats.marker}>
            <boxGeometry args={[0.012, 0.01, 0.04]} />
          </mesh>
        ))}

        <group position={[0, 0.15, 0.45]}>
          <mesh geometry={windowG} material={mats.window} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} />
          <group ref={tourbillon}>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={mats.gold}>
              <torusGeometry args={[0.16, 0.012, 12, 72]} />
            </mesh>
            {[0, 1, 2].map((i) => (
              <mesh key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]} position={[0, 0.01, 0]} material={mats.gold}>
                <boxGeometry args={[0.01, 0.01, 0.32]} />
              </mesh>
            ))}
            <mesh position={[0, 0.02, 0]} material={mats.gold}>
              <sphereGeometry args={[0.03, 16, 16]} />
            </mesh>
          </group>
        </group>

        <group ref={hourHand} position={[0, 0.16, 0]}>
          <mesh geometry={hourG} material={mats.hand} />
        </group>
        <group ref={minuteHand} position={[0, 0.17, 0]}>
          <mesh geometry={minG} material={mats.hand} />
        </group>
        <group ref={secondHand} position={[0, 0.18, 0]}>
          <mesh geometry={secG} material={mats.sec} />
        </group>
        <mesh geometry={tipG} material={mats.hand} position={[0, 0.19, 0]} />

        {[[0.5, -1.0], [-0.5, -1.0], [0.5, 1.0], [-0.5, 1.0]].map(([x, z], i) => (
          <mesh key={i} geometry={lugG} material={mats.case} position={[x, -0.02, z]} />
        ))}

        <mesh geometry={strap[0]} material={mats.strap} scale={[2.4, 1, 1]} />
        <mesh geometry={strap[1]} material={mats.strap} scale={[2.4, 1, 1]} />

        <mesh geometry={crownG} material={mats.case} position={[1.1, 0.02, 0]} />
      </group>
    </group>
  );
}

export default function WatchScene({ config }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const go = () => setTimeout(() => setReady(true), 400);
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
  }, []);
  if (!ready) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-100 max-md:opacity-20">
      <Canvas
        dpr={1}
        camera={{ position: [0, 0, 7], fov: 28 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Environment />
        <ambientLight intensity={0.25} />
        <directionalLight position={[3, 4, 5]} intensity={1.6} />
        <directionalLight position={[-4, -2, -3]} intensity={0.9} color="#f3d9a0" />
        <pointLight position={[0, 0, 3]} intensity={0.6} />
        <Watch config={config} />
      </Canvas>
    </div>
  );
}
