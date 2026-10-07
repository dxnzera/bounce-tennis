'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { products, formatPrice, type Product } from '@/lib/products';
import { useInView, useReducedMotion, useResponsive } from '@/hooks/useExperience';
gsap.registerPlugin(ScrollTrigger);
const ProductCanvas = dynamic(() => import('./Scene3D').then(module => module.ProductCanvas), { ssr: false, loading: () => <div className="scene-loading"><span />Preparando sua raquete</div> });

function RacketChapter({ product, index, inactive, paused, onOpen }: { product: Product; index: number; inactive: boolean; paused: boolean; onOpen: (product: Product) => void }) {
  const { ref, near, visible } = useInView('250px');
  const [rotation, setRotation] = useState(0);
  return <article inert={inactive} className="racket-chapter" aria-labelledby={`title-${product.id}`}>
    <div className="product-art" ref={ref}>
      <span className="product-ghost" aria-hidden="true">{product.shortName.split(' ')[0]}</span>
      <div className="product-orbit" aria-hidden="true" />
      <div className="product-model" tabIndex={0} role="group" aria-label={`Modelo 3D de ${product.name}. Arraste ou use as setas esquerda e direita para girar; pressione Enter para abrir os detalhes.`} onKeyDown={event => { if (event.key === 'Enter') onOpen(product); if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); setRotation(previous => previous + (event.key === 'ArrowLeft' ? -0.2 : 0.2)); } }}>
        {near && <ProductCanvas product={product} visible={visible && !paused} rotationOffset={rotation} />}
      </div>
      <span className="model-hint"><span className="drag-icon" aria-hidden="true">↔</span> ARRASTE PARA EXPLORAR</span>
      <button className="model-expand" onClick={() => onOpen(product)} aria-label={`Expandir ${product.name}`}>+</button>
    </div>
    <div className="product-copy">
      <span className="eyebrow">{product.edition}</span>
      <span className="product-category">{product.category}</span>
      <h3 id={`title-${product.id}`}>{product.shortName.split(' ')[0]}<em>{product.shortName.split(' ').slice(1).join(' ') || 'Wilson.'}</em></h3>
      <p>{product.description}</p>
      <div className="product-price"><span>{formatPrice(product.price)}</span><small>DISPONIBILIDADE SOB CONSULTA</small></div>
      <button className="solid-button" onClick={() => onOpen(product)}>EXPLORE A RAQUETE <span>+</span></button>
      <div className="product-index"><span>{String(index + 1).padStart(2, '0')}</span><span>/</span><span>03</span></div>
    </div>
  </article>;
}

export default function RacketsExperience({ onOpen, paused = false }: { paused?: boolean; onOpen: (product: Product) => void }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const mobile = useResponsive();
  useEffect(() => {
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.to(track.current, { xPercent: -200 / 3, ease: 'none', scrollTrigger: {
          id: 'rackets-story', trigger: section.current, start: 'top top', end: '+=2400', pin: true, scrub: 0.7,
          invalidateOnRefresh: true, onUpdate: self => setActive(Math.min(2, Math.round(self.progress * 2))),
        } });
      });
    }, section);
    return () => { mm.revert(); ctx.revert(); };
  }, [reduced]);
  const navigate = (index: number) => {
    const trigger = ScrollTrigger.getById('rackets-story');
    if (trigger) window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * index / 2, behavior: reduced ? 'instant' : 'smooth' });
    else section.current?.querySelectorAll('.racket-chapter')[index]?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'center' });
  };
  return <section id="raquetes" className="rackets-section" ref={section}>
    <div className="rackets-heading"><div><span className="eyebrow">A SELEÇÃO BOUNCE</span><h2>ESCOLHA <em>SEU JOGO.</em></h2></div><p>Três personalidades.<br />Um mesmo espírito.</p></div>
    <div className="rackets-track" ref={track}>{products.map((product, index) => <RacketChapter key={product.id} product={product} index={index} inactive={!mobile && !reduced && active !== index} paused={paused} onOpen={onOpen} />)}</div>
    <nav className="product-navigation" aria-label="Navegar pela seleção de raquetes">{products.map((product, index) => <button key={product.id} className={active === index ? 'active' : ''} onClick={() => navigate(index)} aria-current={active === index ? 'step' : undefined}><span>0{index + 1}</span>{product.shortName}</button>)}<span className="collection-caption">SELECIONADAS PARA O SEU PRÓXIMO PONTO.</span></nav>
  </section>;
}
