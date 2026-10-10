import { Euler, Vector3 } from 'three';
import { HERO_SUPPORT_POINTS } from './hero-support';

export const HERO_RACKET_SIZE = 4.9;
export const HERO_BALL_SIZE = 1.65 * HERO_RACKET_SIZE / 4.1;
export const HERO_INITIAL_Y = -0.65;
const HERO_CONTACT_Y = -0.35;
export const HERO_READY_ANGLE = 70 * Math.PI / 180;

export type HeroFraming = {
  scale: number; initialX: number; windupX: number; hitX: number; followX: number;
  initialY: number; contactY: number;
  clampX: (x: number, angle: number, cameraZ?: number) => number;
};

export function fitHeroFrame(rect: Pick<DOMRect, 'left' | 'right' | 'width' | 'height'>, viewportWidth: number, mobile: boolean): HeroFraming {
  const padding = mobile ? 14 : 16;
  const halfY = Math.tan((mobile ? 48 : 36) * Math.PI / 360);
  const halfX = halfY * rect.width / rect.height;
  // Keep the mobile racket below the heading when its canvas fills the hero.
  const initialY = mobile ? -1.28 : HERO_INITIAL_Y;
  const contactY = mobile ? -1.08 : HERO_CONTACT_Y;
  const left = 2 * (Math.max(0, rect.left) + padding - rect.left) / rect.width - 1;
  const right = 2 * (Math.min(viewportWidth, rect.right) - padding - rect.left) / rect.width - 1;
  const poses = Array.from({ length: 21 }, (_, index) => {
    const angle = (45 + index * 2.5) * Math.PI / 180;
    return { angle, y: angle < HERO_READY_ANGLE ? contactY : initialY,
      points: HERO_SUPPORT_POINTS.map(point => new Vector3(...point).applyEuler(new Euler(0.1, -0.22, angle))) };
  });
  function limits(points: Vector3[], scale: number, y = initialY, cameraZ = 7.5) {
    const size = HERO_RACKET_SIZE * scale;
    const tolerance = 0.003 * size;
    let min = -Infinity, max = Infinity, vertical = true;
    for (const point of points) {
      const depth = cameraZ + 0.5 - point.z * size;
      min = Math.max(min, left * depth * halfX - point.x * size + tolerance);
      max = Math.min(max, right * depth * halfX - point.x * size - tolerance);
      if (Math.abs(point.y * size + y) + tolerance > depth * halfY) vertical = false;
    }
    return { min, max, vertical };
  }
  const fits = (scale: number) => poses.every(pose => {
    const bounds = limits(pose.points, scale, pose.y);
    return bounds.min <= bounds.max && bounds.vertical;
  });
  let scale = 1;
  if (!fits(scale)) {
    let low = 0, high = 1;
    for (let index = 0; index < 18; index++) {
      const middle = (low + high) / 2;
      if (fits(middle)) low = middle; else high = middle;
    }
    scale = low;
  }
  const at = (angle: number, cameraZ = 7.5) => limits(HERO_SUPPORT_POINTS.map(point => new Vector3(...point).applyEuler(new Euler(0.1, -0.22, angle))), scale, contactY, cameraZ);
  const clampX = (x: number, angle: number, cameraZ = 7.5) => {
    const bounds = at(angle, cameraZ);
    return Math.max(bounds.min, Math.min(bounds.max, x));
  };
  const initialX = at(HERO_READY_ANGLE).max;
  const hitX = clampX(initialX - 0.3 * scale, HERO_READY_ANGLE);
  return { scale, initialX, initialY, contactY, windupX: at(95 * Math.PI / 180).max, hitX,
    followX: clampX(hitX - 0.1 * scale, Math.PI / 4), clampX };
}
