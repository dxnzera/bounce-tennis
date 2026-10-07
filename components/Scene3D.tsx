'use client';
import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls, useGLTF } from '@react-three/drei';
import { Box3, Group, Mesh, Vector3, SRGBColorSpace } from 'three';
import type { Product } from '@/lib/products';
import type { HeroMotion } from '@/lib/animations/hero';
import { useReducedMotion, useResponsive, useRenderBudget } from '@/hooks/useExperience';

function useNormalizedGLB(path: string, rotation: [number, number, number], size: number) {
  const { scene } = useGLTF(path);
  return useMemo(() => {
    const clone = scene.clone(true);
    const oriented = new Group();
    oriented.add(clone); oriented.rotation.set(...rotation); oriented.updateMatrixWorld(true);
    const box = new Box3().setFromObject(oriented);
    const center = box.getCenter(new Vector3());
    const dimensions = box.getSize(new Vector3());
    const container = new Group(); container.add(oriented);
    oriented.position.sub(center);
    container.scale.setScalar(size / Math.max(dimensions.x, dimensions.y, dimensions.z));
    clone.traverse(child => { if (child instanceof Mesh) { child.castShadow = true; child.receiveShadow = true; } });
    return container;
  }, [scene, path, rotation[0], rotation[1], rotation[2], size]);
}

function GLB({ path, rotation = [0, 0, 0], size = 1 }: { path: string; rotation?: [number, number, number]; size?: number }) {
  const model = useNormalizedGLB(path, rotation, size);
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => { invalidate(); const frame = requestAnimationFrame(() => invalidate()); return () => cancelAnimationFrame(frame); }, [model, invalidate]);
  return <primitive object={model} dispose={null} />;
}

class SceneBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback ?? null : this.props.children; }
}

function Lighting() {
  return <>
    <ambientLight intensity={1.4} />
    <directionalLight position={[3, 6, 7]} intensity={3.1} color="#fff9eb" />
    <directionalLight position={[-4, 1, 3]} intensity={1.5} color="#e5f0e7" />
    <spotLight position={[0, 5, -3]} intensity={18} angle={0.8} penumbra={1} />
  </>;
}

function HeroObjects({ motion, loadRacket, onReady }: { motion: HeroMotion; loadRacket: boolean; onReady: (invalidate: () => void) => void }) {
  const ball = useRef<Group>(null);
  const racket = useRef<Group>(null);
  const { camera, invalidate } = useThree();
  useEffect(() => { onReady(invalidate); invalidate(); }, [onReady, invalidate]);
  useFrame(() => {
    if (ball.current) {
      ball.current.position.set(motion.ballX, motion.ballY, motion.ballZ);
      ball.current.scale.setScalar(motion.ballScale);
      ball.current.rotation.set(motion.spin * 0.42, motion.spin, 0.35 + motion.spin * 0.2);
    }
    if (racket.current) {
      racket.current.position.set(motion.racketX, motion.racketY, motion.racketZ);
      racket.current.rotation.set(0.1, -0.22, motion.racketRotation);
    }
    camera.position.z = motion.cameraZ;
    camera.position.x = Math.sin(motion.progress * 160) * motion.shake;
    camera.position.y = Math.cos(motion.progress * 160) * motion.shake;
  });
  return <>
    <Lighting />
    <Suspense fallback={null}><group ref={ball}><GLB path="/models/tennis-ball.glb" size={1.65} /></group></Suspense>
    {loadRacket && <Suspense fallback={null}><group ref={racket}><GLB path="/models/wilson-blade-team.glb" rotation={[Math.PI / 2, 0, 0]} size={3.3} /></group></Suspense>}
  </>;
}

export function HeroCanvas({ motion, loadRacket, onReady }: { motion: HeroMotion; loadRacket: boolean; onReady: (invalidate: () => void) => void }) {
  const mobile = useResponsive();
  const budget = useRenderBudget();
  return <SceneBoundary fallback={<div className="scene-error">Explore a seleção Bounce abaixo.</div>}>
    <Canvas camera={{ position: [0, 0, 7.5], fov: mobile ? 48 : 36 }} dpr={[1, budget]} frameloop="demand" gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }} onCreated={({ gl }) => { gl.outputColorSpace = SRGBColorSpace; }}>
      <HeroObjects motion={motion} loadRacket={loadRacket} onReady={onReady} />
    </Canvas>
  </SceneBoundary>;
}

function ProductObject({ product, reduced, visible, rotationOffset }: { product: Product; reduced: boolean; visible: boolean; rotationOffset: number }) {
  const model = useRef<Group>(null);
  const { pointer } = useThree();
  useFrame((_, delta) => {
    if (model.current && !reduced && visible) {
      model.current.rotation.y = rotationOffset - 0.17 + Math.sin(_.clock.elapsedTime * 0.28) * 0.06;
      model.current.rotation.x += (pointer.y * 0.09 - model.current.rotation.x) * Math.min(delta * 3, 1);
      model.current.rotation.z += (-0.12 + pointer.x * 0.08 - model.current.rotation.z) * Math.min(delta * 3, 1);
    }
  });
  return <group ref={model} rotation={[0, rotationOffset - 0.17, -0.12]}><GLB path={product.model} rotation={product.rotation} size={4.1} /></group>;
}

export function ProductCanvas({ product, visible = true, rotationOffset = 0 }: { product: Product; visible?: boolean; rotationOffset?: number }) {
  const budget = useRenderBudget();
  const reduced = useReducedMotion();
  return <SceneBoundary fallback={<p className="scene-error">A visualização 3D não está disponível neste dispositivo. As informações do produto continuam acessíveis.</p>}>
    <Canvas camera={{ position: [0, 0, 8.4], fov: 34 }} dpr={[1, budget]} frameloop={!visible ? 'never' : reduced ? 'demand' : 'always'} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}>
      <Lighting />
      <Suspense fallback={null}><ProductObject product={product} reduced={reduced} visible={visible} rotationOffset={rotationOffset} /><ContactShadows position={[0, -2.25, 0]} opacity={0.16} scale={8} blur={2.8} far={5} resolution={128} frames={1} color="#183C32" /></Suspense>
      <OrbitControls makeDefault enableZoom={false} enablePan={false} enableDamping dampingFactor={0.09} rotateSpeed={0.65} minPolarAngle={0.55} maxPolarAngle={Math.PI - 0.55} />
    </Canvas>
  </SceneBoundary>;
}

function FinalBall({ visible, reduced }: { visible: boolean; reduced: boolean }) {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (group.current && visible && !reduced) {
      group.current.rotation.y = clock.elapsedTime * 0.14;
      const section = document.getElementById('contato');
      const progress = section ? Math.max(0, Math.min(1, 1 - section.getBoundingClientRect().top / window.innerHeight)) : 0;
      group.current.position.y = progress * 0.38;
      group.current.rotation.z = progress * 0.45;
    }
  });
  return <group ref={group} rotation={[0.2, 0, 0.4]}><GLB path="/models/tennis-ball.glb" size={3.3} /></group>;
}
export function FinalCanvas({ visible }: { visible: boolean }) {
  const reduced = useReducedMotion();
  return <SceneBoundary><Canvas camera={{ position: [0, 0, 7], fov: 35 }} dpr={[1, 1.3]} frameloop={!visible ? 'never' : reduced ? 'demand' : 'always'} gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}><Lighting /><Suspense fallback={null}><FinalBall visible={visible} reduced={reduced} /></Suspense></Canvas></SceneBoundary>;
}
