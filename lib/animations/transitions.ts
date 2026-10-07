import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export function animatePage(root: HTMLElement) {
  const mm = gsap.matchMedia();
  const context = gsap.context(() => {
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(element => {
        gsap.from(element, { y: 45, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 91%', once: true } });
      });
      gsap.to('.about-photo img', { yPercent: 9, ease: 'none', scrollTrigger: { trigger: '.about-section', start: 'top bottom', end: 'bottom top', scrub: 0.7 } });
      gsap.from('.about-court-line', { scaleX: 0, transformOrigin: 'left', ease: 'none', scrollTrigger: { trigger: '.about-section', start: 'top 80%', end: 'top 20%', scrub: true } });
      gsap.to('.footer-wordmark', { yPercent: -13, ease: 'none', scrollTrigger: { trigger: '.final-section', start: 'top bottom', end: 'bottom bottom', scrub: true } });
    });
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => {
      document.documentElement.style.setProperty('--page-progress', `${self.progress * 100}%`);
      document.documentElement.dataset.scrolled = self.scroll() > 80 ? 'true' : 'false';
    } });
  }, root);
  return () => { mm.revert(); context.revert(); };
}
