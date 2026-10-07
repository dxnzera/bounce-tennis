'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { X, Minus, Plus, ShoppingBag, Download, Check } from 'lucide-react';
import { type Product, formatPrice, products } from '@/lib/products';
import { useReducedMotion } from '@/hooks/useExperience';
export type BagItem = { id: string; quantity: number };
const ProductCanvas = dynamic(() => import('./Scene3D').then(module => module.ProductCanvas), { ssr: false });

export function useDialog(onClose: () => void) {
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
    dialog?.querySelector<HTMLElement>('button, a, [tabindex="0"]')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close.current();
      if (event.key !== 'Tab' || !dialog) return;
      const elements = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, [tabindex="0"]')).filter(element => element.offsetParent !== null);
      const first = elements[0]; const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { animation.revert(); document.body.style.overflow = previousOverflow; if (page) page.inert = false; document.removeEventListener('keydown', onKey); previousFocus?.focus(); };
  }, [reduced]);
  return ref;
}

export function ProductDetails({ product, onClose, onAdd, added, onBag }: { product: Product; onClose: () => void; onAdd: (id: string) => void; added: boolean; onBag: () => void }) {
  const ref = useDialog(onClose);
  const reduced = useReducedMotion();
  const [rotation, setRotation] = useState(0);
  useEffect(() => {
    if (reduced || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.detail-scene', { scale: 0.72, rotation: -7, duration: 0.85, ease: 'power3.out' });
      gsap.from('.detail-info > *', { y: 22, opacity: 0, stagger: 0.045, duration: 0.6, delay: 0.15, ease: 'power2.out' });
    }, ref);
    return () => ctx.revert();
  }, [reduced, ref]);
  return <div className="modal-backdrop" onClick={onClose}><div className="product-detail" ref={ref} role="dialog" aria-modal="true" aria-labelledby="detail-title" onClick={event => event.stopPropagation()}>
    <div className="detail-top"><span className="eyebrow">BOUNCE / THE SELECTION</span><button className="icon-button" onClick={onClose} aria-label="Fechar detalhes"><X size={22} /></button></div>
    <div className="detail-scene" role="group" tabIndex={0} aria-label="Visualização 3D. Arraste ou use as setas esquerda e direita para girar." onKeyDown={event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); setRotation(previous => previous + (event.key === 'ArrowLeft' ? -0.2 : 0.2)); } }}><span className="detail-ghost" aria-hidden="true">{product.brand}</span><ProductCanvas product={product} rotationOffset={rotation} /><span className="model-hint">ARRASTE PARA EXPLORAR EM 360°</span></div>
    <div className="detail-info"><span className="eyebrow">{product.category} / {product.brand}</span><h2 id="detail-title">{product.shortName}</h2><div className="detail-price">{formatPrice(product.price)}</div><p>{product.description}</p><dl className="product-specs">{product.specs.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
      <button className="solid-button" onClick={() => added ? onBag() : onAdd(product.id)}>{added ? 'VER SACOLA' : 'ADICIONAR À SACOLA'}{added ? <Check size={18} /> : <Plus size={18} />}</button><small className="detail-note">Sua seleção fica salva neste dispositivo. Valores e especificações serão confirmados pela Bounce.</small>
    </div>
  </div></div>;
}

export function BagDrawer({ items, onClose, onChange, onContact }: { items: BagItem[]; onClose: () => void; onChange: (id: string, delta: number) => void; onContact: () => void }) {
  const ref = useDialog(onClose);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return <div className="modal-backdrop bag-backdrop" onClick={onClose}><div className="bag-drawer" role="dialog" aria-modal="true" aria-labelledby="bag-title" ref={ref} onClick={event => event.stopPropagation()}>
    <div className="bag-top"><span className="eyebrow">SEU PRÓXIMO JOGO</span><button className="icon-button" onClick={onClose} aria-label="Fechar sacola"><X size={22} /></button></div><h2 id="bag-title">Sua sacola.<span>({count.toString().padStart(2, '0')})</span></h2>
    {items.length ? <><div className="bag-items">{items.map(item => {
      const product = products.find(product => product.id === item.id)!;
      return <article className="bag-item" key={item.id}><div className="bag-item-number">0{products.indexOf(product) + 1}</div><div className="bag-item-info"><span className="eyebrow">{product.category}</span><h3>{product.name}</h3><p>{formatPrice(product.price)}</p><div className="quantity-control"><button aria-label={`Diminuir quantidade de ${product.name}`} onClick={() => onChange(item.id, -1)}><Minus size={14} /></button><span aria-label={`Quantidade: ${item.quantity}`}>{item.quantity}</span><button aria-label={`Aumentar quantidade de ${product.name}`} onClick={() => onChange(item.id, 1)} disabled={item.quantity >= 20}><Plus size={14} /></button><button className="remove-item" onClick={() => onChange(item.id, -item.quantity)}>REMOVER</button></div></div></article>;
    })}</div><div className="bag-summary"><span>{count} {count === 1 ? 'item selecionado' : 'itens selecionados'}</span><strong>Valores sob consulta</strong></div><button className="solid-button" onClick={onContact}>CONSULTAR MINHA SELEÇÃO</button><p className="bag-note">A sacola reúne seus favoritos. Nenhuma cobrança ou pedido é realizado nesta etapa.</p></> : <div className="bag-empty"><ShoppingBag size={40} strokeWidth={1} /><h3>Seu jogo ainda vai começar.</h3><p>Explore as raquetes e encontre a sua próxima companheira de quadra.</p><button className="solid-button" onClick={onClose}>CONTINUAR EXPLORANDO</button></div>}
    <span className="bag-bottom">PLAY IT DIFFERENT.</span>
  </div></div>;
}

export function ContactDialog({ items, onClose, instagram = false }: { items: BagItem[]; onClose: () => void; instagram?: boolean }) {
  const ref = useDialog(onClose);
  const download = () => {
    const lines = ['BOUNCE TENNIS — MINHA SELEÇÃO', '', ...items.map(item => `${products.find(product => product.id === item.id)?.name} — ${item.quantity} unidade(s)`), '', 'Preços, disponibilidade e especificações sob consulta.'];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'minha-selecao-bounce.txt'; link.click(); URL.revokeObjectURL(url);
  };
  return <div className="modal-backdrop" onClick={onClose}><div className="contact-dialog" role="dialog" aria-modal="true" aria-labelledby="contact-title" ref={ref} onClick={event => event.stopPropagation()}><button className="icon-button contact-close" onClick={onClose} aria-label="Fechar contato"><X size={22} /></button><span className="eyebrow">NOS VEMOS NA QUADRA</span><h2 id="contact-title">{instagram ? 'O jogo continua.' : 'Vamos falar de jogo.'}</h2><p>{instagram ? 'O perfil oficial da Bounce será anunciado em breve.' : 'O canal de atendimento da Bounce será anunciado em breve. Preços e disponibilidade ainda serão confirmados.'}</p>{items.length > 0 && <><p>Salve sua seleção para consultar a equipe assim que o atendimento estiver disponível.</p><button className="solid-button" onClick={download}>SALVAR MINHA SELEÇÃO <Download size={17} /></button></>}<button className="text-link" onClick={onClose}>VOLTAR À EXPERIÊNCIA</button></div></div>;
}
