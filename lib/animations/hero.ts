import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Euler, Vector3 } from 'three';
import { fitHeroFrame, HERO_BALL_SIZE, HERO_INITIAL_Y, HERO_RACKET_SIZE, HERO_READY_ANGLE, type HeroFraming } from './hero-framing';
gsap.registerPlugin(ScrollTrigger);

const HERO_CONTACT_TIME = 0.37;
const HERO_DURATION = 0.64;
const contactDiameter = 0.4 * HERO_RACKET_SIZE / 4.1;

export type HeroMotion = {
  ballX: number; ballY: number; ballZ: number; ballScale: number; spin: number;
  racketX: number; racketY: number; racketZ: number; racketRotation: number; racketScale: number;
  cameraZ: number; shake: number; progress: number;
};
export function initialHeroMotion(narrow = false, framing?: HeroFraming, mobile = narrow): HeroMotion {
  const scale = framing?.scale ?? 1;
  const racketX = framing?.initialX ?? (narrow ? 1.1 : 2.4);
  const racketY = framing?.initialY ?? HERO_INITIAL_Y;
  const center = stringCenter(racketX, racketY, scale);
  return {
    ballX: center.x + (narrow ? 0.8 : -0.35) * scale, ballY: mobile ? 0.05 : 1.5,
    ballZ: 0.25, ballScale: 0.75 * scale, spin: 0,
    racketX, racketY, racketZ: -0.5, racketRotation: HERO_READY_ANGLE, racketScale: scale,
    cameraZ: 7.5, shake: 0, progress: 0,
  };
}

function stringCenter(x: number, y: number, scale: number) {
  // Center of Object_5 (strings), measured in the centered, unit-height GLB.
  return new Vector3(0, 1.01315 / 4.1, -0.0000733 / 4.1).multiplyScalar(HERO_RACKET_SIZE * scale)
    .applyEuler(new Euler(0.1, -0.22, HERO_READY_ANGLE)).add(new Vector3(x, y, -0.5));
}

function contactPoint(framing: HeroFraming) {
  const normal = new Vector3(0, 0, 1).applyEuler(new Euler(0.1, -0.22, HERO_READY_ANGLE));
  return stringCenter(framing.hitX, framing.contactY, framing.scale).addScaledVector(normal, contactDiameter * framing.scale / 2);
}

export function animateHero(element: HTMLElement, motion: HeroMotion, invalidate: () => void) {
  const mm = gsap.matchMedia();
  mm.add({ desktop: '(min-width: 768px)', mobile: '(max-width: 767px)', compact: '(min-width: 768px) and (max-width: 1100px)', reduce: '(prefers-reduced-motion: reduce)' }, context => {
    const { mobile, compact, reduce } = context.conditions!;
    const narrow = !!(mobile || compact);
    const measure = () => fitHeroFrame(element.querySelector<HTMLElement>('.hero-scene')!.getBoundingClientRect(), window.innerWidth, !!mobile);
    let framing = measure();
    const initial = () => initialHeroMotion(narrow, framing, !!mobile);
    const hit = () => contactPoint(framing);
    Object.assign(motion, initial());
    invalidate();
    if (reduce) {
      const update = () => { framing = measure(); Object.assign(motion, initial()); invalidate(); };
      if (mobile) {
        const observer = new ResizeObserver(update);
        observer.observe(element.querySelector<HTMLElement>('.hero-scene')!);
        return () => observer.disconnect();
      }
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    let timeline: gsap.core.Timeline | undefined;
    timeline = gsap.timeline({ scrollTrigger: {
      id: 'hero-intro', trigger: element, start: 'top top', end: `+=${mobile ? 950 : 1400}`, pin: true,
      scrub: 0.4, invalidateOnRefresh: true,
      onRefreshInit: () => { framing = measure(); },
      onRefresh: self => {
        framing = measure();
        timeline?.invalidate().totalProgress(self.progress, true);
        invalidate();
      },
      onUpdate: self => { motion.progress = self.progress; invalidate(); },
    }, defaults: { ease: 'none' }, onUpdate: () => {
      motion.racketX = framing.clampX(motion.racketX, motion.racketRotation, motion.cameraZ);
      invalidate();
    } });
    timeline
      .fromTo(motion, { ballX: () => initial().ballX, ballY: () => initial().ballY, ballZ: () => initial().ballZ, ballScale: () => initial().ballScale, spin: 0 },
        { ballX: () => hit().x, ballY: () => hit().y, ballZ: () => hit().z, ballScale: () => contactDiameter * framing.scale / HERO_BALL_SIZE,
          spin: 5, duration: HERO_CONTACT_TIME, ease: 'power1.in' }, 0)
      .fromTo(motion, { racketX: () => framing.initialX, racketY: () => framing.initialY, racketRotation: HERO_READY_ANGLE, racketScale: () => framing.scale },
        { racketX: () => framing.windupX, racketRotation: 95 * Math.PI / 180, racketScale: () => framing.scale, duration: 0.19, ease: 'power2.inOut' }, 0)
      .to(motion, { racketX: () => framing.hitX, racketY: () => framing.contactY, racketRotation: HERO_READY_ANGLE, duration: 0.13, ease: 'power2.in' }, HERO_CONTACT_TIME - 0.13)
      .to(motion, { shake: 0.02, duration: 0.02 }, HERO_CONTACT_TIME)
      .to(motion, { shake: 0, racketRotation: 45 * Math.PI / 180, racketX: () => framing.followX, duration: 0.13, ease: 'power2.out' }, HERO_CONTACT_TIME + 0.02)
      .fromTo(motion, { cameraZ: 7.5 }, { ballX: mobile ? 0.15 : narrow ? 1.2 : -0.3, ballY: 0.1, ballZ: 5.5, ballScale: () => 1.65 * framing.scale,
        spin: 9, cameraZ: 7.8, duration: 0.19, ease: 'power2.in', immediateRender: false }, HERO_CONTACT_TIME)
      .to(motion, { ballZ: 10, ballScale: () => 3.8 * framing.scale, spin: 12, duration: HERO_DURATION - 0.56 }, 0.56)
      // Refreshes can occur below the hero while these elements are hidden.
      .fromTo('.hero-copy, .hero-side, .hero-bottom, .ball-ground', { opacity: 1, y: 0 },
        { opacity: 0, y: -25, duration: 0.15 }, 0.08)
      .to('.impact-flash', { opacity: 0.13, duration: 0.02 }, HERO_CONTACT_TIME)
      .to('.impact-flash', { opacity: 0, duration: 0.055 }, HERO_CONTACT_TIME + 0.02);
    if (mobile) {
      let resizeFrame = 0;
      const resize = () => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
      };
      window.addEventListener('resize', resize);
      return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(resizeFrame); };
    }
  });
  return () => mm.revert();
}
