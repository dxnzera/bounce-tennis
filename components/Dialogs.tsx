'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { X, Minus, Plus, ShoppingBag, Download, Check, ZoomIn, ZoomOut, RotateCcw, ArrowUpRight } from 'lucide-react';
import { type ProductView, formatPrice, products, resolveProductVariant } from '@/lib/products';
import { bagItemKey, type BagItem } from '@/lib/bag';
import { ProductIdentity, ProductPrice, ProductVariants } from './ProductIdentity';
import type { SceneCommand } from './Scene3D';
import { useReducedMotion, useResponsive } from '@/hooks/useExperience';
const ProductCanvas = dynamic(() => import('./Scene3D').then(module => module.ProductCanvas), { ssr: false });

function useDialog(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const close = useRef(onClose); close.current = onClose;
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const page = document.getElementById('page-content');
    if (page) page.inert = true;
    const dialog = ref.current;
    const animation = gsap.context(() => {
      if (reduced) gsap.set(dialog, { opacity: 1, y: 0 });
      else gsap.fromTo(dialog, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
    }, ref);
    dialog?.querySelector<HTMLElement>('button, a, summary, [tabindex="0"]')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close.current();
      if (event.key !== 'Tab' || !dialog) return;
      const elements = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, summary, [tabindex="0"]')).filter(element => element.checkVisibility());
      const first = elements[0]; const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { animation.revert(); document.body.style.overflow = previousOverflow; if (page) page.inert = false; document.removeEventListener('keydown', onKey); previousFocus?.focus(); };
  }, [reduced]);
  return ref;
}

export function ProductDetails({ product, onVariantChange, onClose, onAdd, added, onBag }: { product: ProductView; onVariantChange: (product: ProductView) => void; onClose: () => void; onAdd: (product: ProductView) => void; added: boolean; onBag: () => void }) {
  const ref = useDialog(onClose);
  const reduced = useReducedMotion();
  const mobile = useResponsive();
  const [rotation, setRotation] = useState(0);
  const [command, setCommand] = useState<SceneCommand>();
  const changeView = (action: SceneCommand['action']) => {
    if (action === 'reset') setRotation(0);
    setCommand(previous => ({ id: (previous?.id ?? 0) + 1, action }));
  };
  const selectVariant = (id: string) => {
    setRotation(0);
    setCommand(undefined);
    const references = ref.current?.querySelector<HTMLDetailsElement>('.product-references-popover');
    if (references) references.open = false;
    onVariantChange(resolveProductVariant(product, id));
  };
  useEffect(() => {
    if (reduced || !ref.current) return;
    const ctx = gsap.context(() => {
      const mobileScene = window.matchMedia('(max-width: 767px)').matches;
      gsap.from('.detail-scene', mobileScene
        ? { y: 14, opacity: 0, duration: 0.6, ease: 'power3.out' }
        : { scale: 0.72, rotation: -7, duration: 0.85, ease: 'power3.out' });
      gsap.fromTo('.detail-info > *', { y: 22, opacity: 0 }, { y: 0, opacity: 1, clearProps: 'transform,opacity', stagger: 0.045, duration: 0.6, delay: 0.15, ease: 'power2.out' });
    }, ref);
    return () => ctx.revert();
  }, [reduced, ref]);
  return <div className="modal-backdrop" onClick={onClose}><div className="product-detail" ref={ref} role="dialog" aria-modal="true" aria-labelledby="detail-title" onClick={event => event.stopPropagation()}>
    <div className="detail-top"><span className="eyebrow">BOUNCE / THE SELECTION</span><button className="icon-button" onClick={onClose} aria-label="Fechar detalhes"><X size={22} /></button></div>
    <div className="detail-body">
    <div className="detail-scene" role="group" tabIndex={0} aria-label="Visualização 3D. Arraste ou use as setas para girar. Use mais e menos para zoom e zero para restaurar." onKeyDown={event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); setRotation(previous => previous + (event.key === 'ArrowLeft' ? -0.2 : 0.2)); }
      if (['+', '=', '-', '0'].includes(event.key)) { event.preventDefault(); changeView(event.key === '0' ? 'reset' : event.key === '-' ? 'zoom-out' : 'zoom-in'); }
    }}>
      <span className="detail-ghost" aria-hidden="true">{product.shortName.split(' ')[0]}</span><div className="detail-orbit" aria-hidden="true" />
      <div className="detail-model"><ProductCanvas key={product.model} product={product} rotationOffset={rotation} interactive centered={mobile} command={command} /></div>
      <div className="model-controls" role="group" aria-label="Controles da visualização">
        <button className="model-zoom-button" onClick={() => changeView('zoom-out')} aria-label="Afastar raquete" title="Afastar (−)"><ZoomOut size={18} strokeWidth={1.5} /></button>
        <button onClick={() => changeView('reset')} aria-label="Restaurar posição da raquete" title="Restaurar (0)"><RotateCcw size={17} strokeWidth={1.5} /></button>
        <button className="model-zoom-button" onClick={() => changeView('zoom-in')} aria-label="Aproximar raquete" title="Aproximar (+)"><ZoomIn size={18} strokeWidth={1.5} /></button>
      </div>
      <span className="model-hint">ARRASTE · ROLE OU PINCE PARA ZOOM</span>
    </div>
    <div className="detail-info"><ProductIdentity product={product} as="h2" id="detail-title" /><p>{product.description}</p><ProductVariants product={product} selectedId={product.variantId} onSelect={selectVariant} /><ProductPrice product={product} /><ProductSpecs product={product} className="desktop-product-specs" />
      <details className="product-references-popover"><summary>FONTES<Plus size={14} aria-hidden="true" /></summary><div className="reference-content"><p>{product.referenceNote}</p>{product.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label}<ArrowUpRight size={14} aria-hidden="true" /></a>)}</div></details>
      <button className="solid-button" onClick={() => added ? onBag() : onAdd(product)}>{added ? 'VER SACOLA' : 'ADICIONAR À SACOLA'}{added ? <Check size={18} /> : <Plus size={18} />}</button><small className="detail-note">Sua seleção fica salva neste dispositivo.</small>
      <details className="mobile-product-details"><summary>Detalhes técnicos<Plus size={16} aria-hidden="true" /></summary><ProductSpecs product={product} /><div className="mobile-product-sources"><p>{product.referenceNote}</p>{product.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label}<ArrowUpRight size={14} aria-hidden="true" /></a>)}</div></details>
    </div>
    </div>
    <button className="mobile-bag-action" onClick={() => added ? onBag() : onAdd(product)} aria-label={added ? `Ver sacola com ${product.name}` : `Adicionar ${product.name} à sacola`}><ShoppingBag size={25} strokeWidth={1.6} aria-hidden="true" /><span aria-hidden="true">{added ? <Check size={12} strokeWidth={2.4} /> : <Plus size={12} strokeWidth={2.4} />}</span></button>
  </div></div>;
}

function ProductSpecs({ product, className = '' }: { product: ProductView; className?: string }) {
  return <dl className={`product-specs ${className}`}>{product.specs.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>;
}

export function BagDrawer({ items, onClose, onChange, onContact }: { items: BagItem[]; onClose: () => void; onChange: (id: string, delta: number) => void; onContact: () => void }) {
  const ref = useDialog(onClose);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return <div className="modal-backdrop bag-backdrop" onClick={onClose}><div className="bag-drawer" role="dialog" aria-modal="true" aria-labelledby="bag-title" ref={ref} onClick={event => event.stopPropagation()}>
    <div className="bag-top"><span className="eyebrow">SEU PRÓXIMO JOGO</span><button className="icon-button" onClick={onClose} aria-label="Fechar sacola"><X size={22} /></button></div><h2 id="bag-title">Sua sacola.<span>({count.toString().padStart(2, '0')})</span></h2>
    {items.length ? <><div className="bag-items">{items.map(item => {
      const product = resolveProductVariant(products.find(product => product.id === item.id)!, item.variantId);
      const key = bagItemKey(item);
      const label = `${product.name} · ${product.colorway.label}`;
      return <article className="bag-item" key={key}><div className="bag-item-number">0{products.findIndex(base => base.id === item.id) + 1}</div><div className="bag-item-info"><span className="eyebrow">{product.brand}</span><h3>{product.shortName}</h3><p>{product.colorway.label}</p><p>{formatPrice(product.price)}</p><div className="quantity-control"><button aria-label={`Diminuir quantidade de ${label}`} onClick={() => onChange(key, -1)}><Minus size={14} /></button><span aria-label={`Quantidade: ${item.quantity}`}>{item.quantity}</span><button aria-label={`Aumentar quantidade de ${label}`} onClick={() => onChange(key, 1)} disabled={item.quantity >= 20}><Plus size={14} /></button><button className="remove-item" onClick={() => onChange(key, -item.quantity)}>REMOVER</button></div></div></article>;
    })}</div><div className="bag-summary"><span>{count} {count === 1 ? 'item selecionado' : 'itens selecionados'}</span><strong>Valores sob consulta</strong></div><button className="solid-button" onClick={onContact}>CONSULTAR MINHA SELEÇÃO</button><p className="bag-note">A sacola reúne seus favoritos. Nenhuma cobrança ou pedido é realizado nesta etapa.</p></> : <div className="bag-empty"><ShoppingBag size={40} strokeWidth={1} /><h3>Seu jogo ainda vai começar.</h3><p>Explore as raquetes e encontre a sua próxima companheira de quadra.</p><button className="solid-button" onClick={onClose}>CONTINUAR EXPLORANDO</button></div>}
    <span className="bag-bottom">PLAY IT DIFFERENT.</span>
  </div></div>;
}

export function ContactDialog({ items, onClose, instagram = false }: { items: BagItem[]; onClose: () => void; instagram?: boolean }) {
  const ref = useDialog(onClose);
  const download = () => {
    const lines = ['BOUNCE TENNIS — MINHA SELEÇÃO', '', ...items.map(item => { const product = resolveProductVariant(products.find(product => product.id === item.id)!, item.variantId); return `${product.name} (${product.colorway.label}) — ${item.quantity} unidade(s)`; }), '', 'Preços, disponibilidade e especificações sob consulta.'];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'minha-selecao-bounce.txt'; link.click(); URL.revokeObjectURL(url);
  };
  return <div className="modal-backdrop" onClick={onClose}><div className="contact-dialog" role="dialog" aria-modal="true" aria-labelledby="contact-title" ref={ref} onClick={event => event.stopPropagation()}><button className="icon-button contact-close" onClick={onClose} aria-label="Fechar contato"><X size={22} /></button><span className="eyebrow">NOS VEMOS NA QUADRA</span><h2 id="contact-title">{instagram ? 'O jogo continua.' : 'Vamos falar de jogo.'}</h2><p>{instagram ? 'O perfil oficial da Bounce será anunciado em breve.' : 'O canal de atendimento da Bounce será anunciado em breve. Preços e disponibilidade ainda serão confirmados.'}</p>{items.length > 0 && <><p>Salve sua seleção para consultar a equipe assim que o atendimento estiver disponível.</p><button className="solid-button" onClick={download}>SALVAR MINHA SELEÇÃO <Download size={17} /></button></>}<button className="text-link" onClick={onClose}>VOLTAR À EXPERIÊNCIA</button></div></div>;
}
