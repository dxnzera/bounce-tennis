import { ScrollTrigger } from 'gsap/ScrollTrigger';
export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  const trigger = ScrollTrigger.getById(id === 'inicio' ? 'hero-intro' : id === 'raquetes' ? 'rackets-story' : '');
  const top = id === 'inicio' ? 0 : trigger ? trigger.start : target ? target.getBoundingClientRect().top + window.scrollY - 76 : 0;
  window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}
