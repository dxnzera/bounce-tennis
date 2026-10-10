import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

function animateViewportPresence(trigger: HTMLElement, targets: HTMLElement[], distance: number) {
  if (!targets.length) return;
  const timeline = gsap.timeline();
  const entrance = gsap.fromTo(targets, { opacity: 0, y: distance }, {
    opacity: 1, y: 0, duration: 0.15, ease: 'power1.out',
  });
  const exit = gsap.to(targets, {
    opacity: 0, y: -distance * 0.65, duration: 0.1, ease: 'power1.in', immediateRender: false,
  });
  timeline.add(entrance, 0).add(exit, 0.9);
  ScrollTrigger.create({
    trigger, animation: timeline, start: 'top bottom', end: 'clamp(bottom top)', scrub: 0.35,
    invalidateOnRefresh: true,
    onRefresh: self => {
      const travel = Math.max(1, self.end - self.start);
      // Keep the content fully visible while it crosses the reading area.
      // Pixel-based edge lengths stay consistent when the layout or viewport changes.
      const entranceRange = Math.min(0.25, window.innerHeight * 0.2 / travel);
      const exitRange = Math.min(0.2, window.innerHeight * 0.14 / travel);
      entrance.duration(entranceRange);
      exit.duration(exitRange).startTime(1 - exitRange);
      timeline.totalProgress(self.progress);
    },
  });
}

export function animatePage(root: HTMLElement) {
  const mm = gsap.matchMedia();
  const context = gsap.context(() => {
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(element => {
        gsap.from(element, { y: 45, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 91%', once: true } });
      });
      gsap.to('.about-photo > img', { yPercent: 9, ease: 'none', scrollTrigger: { trigger: '.about-section', start: 'top bottom', end: 'bottom top', scrub: 0.7 } });
      root.querySelectorAll<HTMLElement>('.about-photo').forEach(photo => {
        animateViewportPresence(photo, [photo], 24);
        const caption = photo.querySelector<HTMLElement>('figcaption');
        if (caption) animateViewportPresence(caption, Array.from(caption.querySelectorAll<HTMLElement>('span, .about-caption-logo')), 12);
      });
      gsap.from('.about-court-line', { scaleX: 0, transformOrigin: 'left', ease: 'none', scrollTrigger: { trigger: '.about-section', start: 'top 80%', end: 'top 20%', scrub: true } });
    });
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => {
      document.documentElement.style.setProperty('--page-progress', `${self.progress * 100}%`);
      document.documentElement.dataset.scrolled = self.scroll() > 80 ? 'true' : 'false';
    } });
  }, root);
  return () => { mm.revert(); context.revert(); };
}
