'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { products, resolveProductVariant, type Product, type ProductView } from '@/lib/products';
import { ProductIdentity, ProductPrice, ProductVariants } from './ProductIdentity';
import { useInView, useReducedMotion, useResponsive } from '@/hooks/useExperience';
gsap.registerPlugin(ScrollTrigger);
const ProductCanvas = dynamic(() => import('./Scene3D').then(module => module.ProductCanvas), { ssr: false, loading: () => <div className="scene-loading"><span />Preparando sua raquete</div> });
type VariantSelectionProps = { variantSelections: Record<string, string | undefined>; onVariantChange: (product: ProductView) => void };

function RacketChapter({ product, count, stacked, inactive, paused, onOpen, variantSelections, onVariantChange }: { product: Product; count: number; stacked: boolean; inactive: boolean; paused: boolean; onOpen: (product: ProductView) => void } & VariantSelectionProps) {
  const { ref, near, visible } = useInView('250px');
  const [rotation, setRotation] = useState(0);
  const selected = resolveProductVariant(product, variantSelections[product.id]);
  const selectVariant = (id: string) => { setRotation(0); onVariantChange(resolveProductVariant(product, id)); };
  return <article inert={inactive} className="racket-chapter" style={{ width: stacked ? '100%' : `${100 / count}%` }} aria-labelledby={`title-${product.id}`}>
    <div className="product-art" ref={ref}>
      <span className="product-ghost" aria-hidden="true">{product.shortName.split(' ')[0]}</span>
      <div className="product-orbit" aria-hidden="true" />
      <div className="product-model" tabIndex={0} role="group" aria-label={`Modelo 3D de ${selected.name}. Arraste ou use as setas esquerda e direita para girar. No celular, use a pinça para ampliar. Pressione Enter para abrir os detalhes.`} onKeyDown={event => { if (event.key === 'Enter') onOpen(selected); if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); setRotation(previous => previous + (event.key === 'ArrowLeft' ? -0.2 : 0.2)); } }}>
        {near && <ProductCanvas key={selected.model} product={selected} visible={visible && !paused} rotationOffset={rotation} />}
      </div>
      <span className="model-hint"><span className="drag-icon" aria-hidden="true">↔</span> ARRASTE PARA EXPLORAR</span>
      <button className="model-expand" onClick={() => onOpen(selected)} aria-label={`Expandir ${selected.name}`}>+</button>
    </div>
    <div className="product-copy">
      <ProductIdentity product={selected} id={`title-${product.id}`} />
      <ProductVariants product={product} selectedId={selected.variantId} onSelect={selectVariant} />
      <p>{selected.description}</p>
      <ProductPrice product={selected} />
      <button className="solid-button" onClick={() => onOpen(selected)}>EXPLORE A RAQUETE <span>+</span></button>
    </div>
  </article>;
}

export default function RacketsExperience({ onOpen, paused = false, variantSelections, onVariantChange }: { paused?: boolean; onOpen: (product: ProductView) => void } & VariantSelectionProps) {
  const { ref: section, near: selectionNear } = useInView<HTMLElement>('500px');
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const mobile = useResponsive();
  const count = products.length;
  const stacked = mobile || reduced;
  useEffect(() => {
    if (!selectionNear) return;
    const paths = products.slice(active, active + 2).flatMap((product, index) =>
      index === 0 && product.variants ? product.variants.map(variant => variant.model) : [product.model]);
    let cancelled = false;
    import('./Scene3D').then(module => { if (!cancelled) module.preloadModels(paths); }).catch(() => {});
    return () => { cancelled = true; };
  }, [selectionNear, active]);
  useEffect(() => {
    if (count < 2) return;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const hold = 0.75;
        const transition = 1.4;
        let currentChapter = 0;
        gsap.set(track.current, { xPercent: 0 });
        setActive(0);
        const story = gsap.timeline({ onUpdate: () => {
          if (!track.current) return;
          const position = -Number(gsap.getProperty(track.current, 'xPercent')) * count / 100;
          const chapter = Math.max(0, Math.min(count - 1, Math.round(position)));
          if (chapter !== currentChapter) { currentChapter = chapter; setActive(chapter); }
        } });
        for (let index = 0; index < count; index++) {
          story.addLabel(`racket-${index}`, story.duration() + hold / 2);
          story.to(track.current, { xPercent: -100 * index / count, duration: hold, ease: 'none' });
          if (index < count - 1) story.to(track.current, { xPercent: -100 * (index + 1) / count, duration: transition, ease: 'sine.inOut' });
        }
        const centers = Array.from({ length: count }, (_, index) => story.labels[`racket-${index}`] / story.duration());
        const holds = centers.map(center => ({ start: center - hold / story.duration() / 2, end: center + hold / story.duration() / 2 }));
        ScrollTrigger.create({
          id: 'rackets-story', trigger: section.current, animation: story, start: 'top top',
          end: () => `+=${story.duration() * Math.max(800, window.innerHeight)}`,
          pin: true, scrub: 0.45, invalidateOnRefresh: true,
          snap: {
            snapTo: (progress: number, self?: ScrollTrigger) => {
              // Preserve wheel progress during each hold; settle only unfinished transitions.
              if (holds.some(range => progress >= range.start && progress <= range.end)) return progress;
              const next = holds.findIndex(range => progress < range.start);
              if (next < 1) return progress;
              return centers[self?.direction === -1 ? next - 1 : next];
            },
            inertia: false, directional: false, delay: 0.3,
            duration: { min: 0.45, max: 0.75 }, ease: 'power2.out',
          },
        });
      });
    }, section);
    return () => { mm.revert(); ctx.revert(); };
  }, [reduced, count]);
  const navigate = (index: number) => {
    const trigger = ScrollTrigger.getById('rackets-story');
    if (trigger && count > 1) {
      const snapping = trigger.getTween(true);
      if (snapping) snapping.kill();
      const story = trigger.animation as gsap.core.Timeline;
      const center = story.labels?.[`racket-${index}`];
      const progress = typeof center === 'number' ? center / story.duration() : index / (count - 1);
      window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * progress, behavior: reduced ? 'instant' : 'smooth' });
    }
    else section.current?.querySelectorAll('.racket-chapter')[index]?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'center' });
  };
  return <section id="raquetes" className="rackets-section" ref={section}>
    <div className="rackets-heading"><div><span className="eyebrow">A SELEÇÃO BOUNCE</span><h2>ESCOLHA <em>SEU JOGO.</em></h2></div></div>
    <div className="rackets-track" ref={track} style={{ width: `${(stacked ? 1 : count) * 100}%` }}>{products.map((product, index) => <RacketChapter key={product.id} product={product} count={count} stacked={stacked} inactive={!stacked && active !== index} paused={paused} onOpen={onOpen} variantSelections={variantSelections} onVariantChange={onVariantChange} />)}</div>
    <nav className="product-navigation" aria-label="Navegar pela seleção de raquetes">{products.map((product, index) => <button key={product.id} className={active === index ? 'active' : ''} onClick={() => navigate(index)} aria-current={active === index ? 'step' : undefined}><span>{String(index + 1).padStart(2, '0')}</span>{product.shortName}</button>)}<span className="collection-caption">SELECIONADAS PARA O SEU PRÓXIMO PONTO.</span></nav>
  </section>;
}
