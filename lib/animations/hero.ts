import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export type HeroMotion = {
  ballX: number; ballY: number; ballZ: number; ballScale: number; spin: number;
  racketX: number; racketY: number; racketZ: number; racketRotation: number;
  cameraZ: number; shake: number; progress: number;
};
export const initialHeroMotion = (): HeroMotion => ({
  ballX: 1.65, ballY: 0.1, ballZ: -1, ballScale: 0.85, spin: 0,
  racketX: 5, racketY: -1.6, racketZ: -0.5, racketRotation: -0.75,
  cameraZ: 7.5, shake: 0, progress: 0,
});

export function animateHero(element: HTMLElement, motion: HeroMotion, invalidate: () => void, loadRacket: () => void) {
  const mm = gsap.matchMedia();
  mm.add({ desktop: '(min-width: 768px)', mobile: '(max-width: 767px)', reduce: '(prefers-reduced-motion: reduce)' }, context => {
    const { mobile, reduce } = context.conditions!;
    if (reduce) return;
    const timeline = gsap.timeline({ scrollTrigger: {
      id: 'hero-intro', trigger: element, start: 'top top', end: `+=${mobile ? 1600 : 2300}`, pin: true,
      scrub: 0.6, invalidateOnRefresh: true,
      onUpdate: self => { motion.progress = self.progress; if (self.progress > 0.12) loadRacket(); invalidate(); },
    }, defaults: { ease: 'none' }, onUpdate: invalidate });
    timeline
      .to(motion, { ballX: -0.45, ballY: 0.7, ballZ: -0.4, ballScale: 1.05, spin: 2.8, duration: 0.28 }, 0)
      .to(motion, { racketX: 1.85, racketY: -0.95, racketRotation: -0.45, duration: 0.24 }, 0.2)
      .to(motion, { ballX: 1.45, ballY: -0.08, ballZ: 0, ballScale: 0.9, spin: 6, duration: 0.22 }, 0.28)
      .to(motion, { racketRotation: 0.7, racketX: 1.4, duration: 0.06 }, 0.48)
      .to(motion, { shake: 0.035, duration: 0.025 }, 0.5)
      .to(motion, { shake: 0, racketRotation: 0.5, duration: 0.07 }, 0.54)
      .to(motion, { ballX: mobile ? 0 : -0.3, ballY: 0.05, ballZ: 5.5, ballScale: 2.6, spin: 10, cameraZ: 7.8, duration: 0.23 }, 0.5)
      .to(motion, { ballZ: 10, ballScale: 4.8, spin: 13, duration: 0.11 }, 0.73)
      .to('.hero-copy, .hero-side, .hero-bottom, .ball-ground', { opacity: 0, y: -25, duration: 0.18 }, 0.12)
      .to('.impact-flash', { opacity: 0.18, duration: 0.025 }, 0.5)
      .to('.impact-flash', { opacity: 0, duration: 0.07 }, 0.525)
      .fromTo('.hero-reveal', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 0.22 }, 0.75)
      .fromTo('.hero-reveal-content > *', { opacity: 0, y: 45 }, { opacity: 1, y: 0, stagger: 0.04, duration: 0.15 }, 0.83);
  });
  return () => mm.revert();
}
