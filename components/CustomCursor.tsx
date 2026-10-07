'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
export default function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const x = gsap.quickTo(ref.current, 'x', { duration: 0.25, ease: 'power3.out' });
      const y = gsap.quickTo(ref.current, 'y', { duration: 0.25, ease: 'power3.out' });
      const move = (event: PointerEvent) => { x(event.clientX); y(event.clientY); gsap.set(ref.current, { opacity: 0.75 }); };
      const leave = () => gsap.set(ref.current, { opacity: 0 });
      window.addEventListener('pointermove', move); document.addEventListener('pointerleave', leave);
      return () => { window.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', leave); };
    });
    return () => mm.revert();
  }, []);
  return <div className="custom-cursor" aria-hidden="true" ref={ref} />;
}
