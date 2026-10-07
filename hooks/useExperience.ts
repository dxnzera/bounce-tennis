'use client';
import { useEffect, useRef, useState } from 'react';

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

export function useResponsive() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setMobile(query.matches);
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return mobile;
}

export function useInView(margin = '300px') {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const preload = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNear(true); preload.disconnect(); }
    }, { rootMargin: margin });
    const visibility = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    preload.observe(element); visibility.observe(element);
    return () => { preload.disconnect(); visibility.disconnect(); };
  }, [margin]);
  return { ref, near, visible };
}

export function useRenderBudget() {
  const mobile = useResponsive();
  const [weak, setWeak] = useState(false);
  useEffect(() => {
    const device = navigator as Navigator & { deviceMemory?: number };
    setWeak((device.hardwareConcurrency || 8) <= 4 || (device.deviceMemory || 8) <= 4);
  }, []);
  return weak ? 1 : mobile ? 1.25 : 1.6;
}
