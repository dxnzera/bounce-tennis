'use client';
import { useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { animateHero, initialHeroMotion } from '@/lib/animations/hero';
import { useReducedMotion } from '@/hooks/useExperience';

const HeroCanvas = dynamic(() => import('./Scene3D').then(module => module.HeroCanvas), { ssr: false, loading: () => <div className="scene-loading"><span />Preparando a quadra</div> });

export default function HeroExperience() {
  const ref = useRef<HTMLElement>(null);
  const motion = useRef(initialHeroMotion());
  const invalidate = useRef<() => void>(() => {});
  const reduced = useReducedMotion();
  const onReady = useCallback((callback: () => void) => { invalidate.current = callback; callback(); }, []);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      const cleanup = animateHero(ref.current!, motion.current, () => invalidate.current());
      return cleanup;
    }, ref);
    return () => ctx.revert();
  }, [reduced]);
  return <section className="hero-experience" id="inicio" ref={ref} aria-label="Introdução Bounce Tennis: role para acompanhar a rebatida">
    <div className="hero-court" aria-hidden="true"><div className="court-inner" /><div className="court-center" /><div className="court-service" /></div>
    <div className="hero-copy"><h1>PLAY IT<br /><em>DIFFERENT.</em></h1></div>
    <div className="hero-side"><span>BOUNCE TENNIS CLUB</span><span>EST. BRASIL</span><div className="mini-cross" aria-hidden="true">+</div></div>
    <div className="hero-scene" role="img" aria-label="Bola de tênis 3D e uma raquete; o scroll controla a trajetória e a rebatida"><HeroCanvas motion={motion.current} onReady={onReady} /></div>
    <div className="ball-ground" aria-hidden="true" />
    <div className="hero-bottom"><span>TÊNIS / ESTILO / PERFORMANCE</span><a href="#raquetes" className="scroll-cue"><span className="scroll-cue-dot" /><span>ROLE PARA ENTRAR NO JOGO</span></a></div>
    <div className="impact-flash" aria-hidden="true" />
  </section>;
}
