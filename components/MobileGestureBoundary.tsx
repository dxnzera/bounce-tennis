'use client';

import { useEffect } from 'react';

function racketViewer(target: EventTarget) {
  if (!(target instanceof Element)) return null;
  const canvas = target.closest('canvas');
  return canvas?.closest('.product-model, .detail-model') ?? null;
}

export default function MobileGestureBoundary() {
  useEffect(() => {
    const mobileTouch = window.matchMedia('(max-width: 767px) and (any-pointer: coarse)');
    const options: AddEventListenerOptions = { capture: true, passive: false };

    const preventPagePinch = (event: TouchEvent) => {
      if (!mobileTouch.matches || event.touches.length < 2 || !event.cancelable) return;
      const viewers = Array.from(event.touches, touch => racketViewer(touch.target));
      const viewer = viewers[0];
      // OrbitControls owns pinching inside a single racket canvas. Single
      // touches elsewhere stay available for scrolling, links and controls.
      if (!viewer || viewers.some(target => target !== viewer)) event.preventDefault();
    };

    // WebKit also emits native GestureEvents. Prevent their page zoom while
    // leaving the viewers' independent PointerEvents and camera zoom intact.
    const preventNativeGesture = (event: Event) => {
      if (mobileTouch.matches && event.cancelable) event.preventDefault();
    };

    document.addEventListener('touchstart', preventPagePinch, options);
    document.addEventListener('touchmove', preventPagePinch, options);
    document.addEventListener('gesturestart', preventNativeGesture, options);
    document.addEventListener('gesturechange', preventNativeGesture, options);
    return () => {
      document.removeEventListener('touchstart', preventPagePinch, options);
      document.removeEventListener('touchmove', preventPagePinch, options);
      document.removeEventListener('gesturestart', preventNativeGesture, options);
      document.removeEventListener('gesturechange', preventNativeGesture, options);
    };
  }, []);

  return null;
}
