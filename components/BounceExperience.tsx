'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowUpRight, Menu, X, ShoppingBag } from 'lucide-react';
import HeroExperience from './HeroExperience';
import RacketsExperience from './RacketsExperience';
import { BagDrawer, ContactDialog, ProductDetails } from './Dialogs';
import { products, resolveProductVariant, type ProductView } from '@/lib/products';
import { bagItemKey, restoreBag, type BagItem } from '@/lib/bag';
import { brand } from '@/lib/brand';
import { scrollToSection } from '@/lib/animations/navigation';
import CustomCursor from './CustomCursor';
import MobileGestureBoundary from './MobileGestureBoundary';
import { animatePage } from '@/lib/animations/transitions';
import { useInView } from '@/hooks/useExperience';
const FinalCanvas = dynamic(() => import('./Scene3D').then(module => module.FinalCanvas), { ssr: false });

export default function BounceExperience() {
  const root = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState(false);
  const [selected, setSelected] = useState<ProductView | null>(null);
  const [variantSelections, setVariantSelections] = useState<Record<string, string | undefined>>({});
  const [bag, setBag] = useState<BagItem[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [contact, setContact] = useState<'contact' | 'instagram' | null>(null);
  const [notice, setNotice] = useState('');
  const { ref: finalRef, near: finalNear, visible: finalVisible } = useInView();
  const count = bag.reduce((sum, item) => sum + item.quantity, 0);
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem('bounce-bag-v2') ?? localStorage.getItem('bounce-bag-v1') ?? '[]');
      setBag(restoreBag(saved));
    } catch { }
    setStorageReady(true);
  }, []);
  useEffect(() => { if (storageReady) { try { localStorage.setItem('bounce-bag-v2', JSON.stringify(bag)); } catch { } } }, [bag, storageReady]);
  useEffect(() => { if (!root.current) return; return animatePage(root.current); }, []);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 3500); return () => clearTimeout(timer); }, [notice]);
  const add = useCallback((selection: ProductView) => {
    const product = products.find(product => product.id === selection.id);
    if (!product) throw new Error('Produto desconhecido.');
    const view = resolveProductVariant(product, selection.variantId);
    const key = bagItemKey(view);
    setBag(previous => previous.some(item => bagItemKey(item) === key) ? previous.map(item => bagItemKey(item) === key ? { ...item, quantity: Math.min(20, item.quantity + 1) } : item) : [...previous, { id: view.id, variantId: view.variantId, quantity: 1 }]);
    setNotice(`${product.name} adicionada à sacola.`);
  }, []);
  const change = (key: string, delta: number) => setBag(previous => previous.map(item => bagItemKey(item) === key ? { ...item, quantity: Math.min(20, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  const closeAll = () => { setSelected(null); setBagOpen(false); setContact(null); };
  const selectVariant = (product: ProductView) => setVariantSelections(previous => ({ ...previous, [product.id]: product.variantId }));
  const changeDetailVariant = (product: ProductView) => { selectVariant(product); setSelected(product); };
  const openContact = () => { closeAll(); setContact('contact'); };
  return <div ref={root}>
    <MobileGestureBoundary />
    <CustomCursor /><div id="page-content" onClick={event => { const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]'); if (anchor) { event.preventDefault(); scrollToSection(anchor.hash.slice(1)); } }}>
      <a className="skip-link" href="#raquetes">Ir para as raquetes</a>
      <header className="site-header"><a className="brand-logo" href="#inicio" aria-label="Bounce Tennis — início"><img src="/brand/bounce-green.svg" alt="Bounce" width="132" height="24" /></a><nav className={`main-nav ${menu ? 'menu-open' : ''}`} aria-label="Menu principal"><a href="#raquetes" onClick={() => setMenu(false)}>RAQUETES</a><a href="#sobre" onClick={() => setMenu(false)}>SOBRE</a><a href="#contato" onClick={() => setMenu(false)}>CONTATO</a></nav><div className="header-actions"><button className="bag-button" onClick={() => { closeAll(); setBagOpen(true); }} aria-label={`Abrir sacola, ${count} itens`}><ShoppingBag size={17} strokeWidth={1.4} /><span className="bag-count">{count.toString().padStart(2, '0')}</span></button><button className="menu-button icon-button" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label={menu ? 'Fechar menu' : 'Abrir menu'}>{menu ? <X size={22} /> : <Menu size={22} />}</button></div></header>
      <main><HeroExperience /><RacketsExperience variantSelections={variantSelections} onVariantChange={selectVariant} paused={!!(selected || bagOpen || contact)} onOpen={product => { closeAll(); setSelected(product); }} />
        <section id="sobre" className="about-section">
          <div className="about-court-geometry" aria-hidden="true"><div className="about-court-doubles" /><div className="about-court-net" /><div className="about-court-service" /></div>
          <div className="about-layout"><div className="about-copy"><h2 data-reveal>MAIS QUE<br />UMA LOJA<br /><em>DE TÊNIS.</em></h2><div className="about-court-line" aria-hidden="true" /><p data-reveal>Um ponto de encontro para quem vive o esporte.</p><p className="about-description" data-reveal>Selecionamos equipamentos para quem leva o jogo para além da quadra. Performance, personalidade e a vontade de jogar mais um set.</p><span className="about-signature">É SOBRE COMO VOCÊ VIVE O JOGO.</span></div><figure className="about-photo"><img src="/images/clay-court.webp" alt="Quadra de saibro em um clube de tênis, com rede, linhas brancas e árvores sob a luz da tarde" width="1536" height="1024" loading="lazy" /><figcaption><span>ON COURT. OFF COURT.</span><img className="about-caption-logo" src="/brand/bounce-light.svg" alt="Bounce Tennis" width="120" height="19" loading="lazy" /></figcaption></figure></div><div className="about-baseline"><span>O ESPORTE NOS MOVE.</span><span>O ESTILO NOS ENCONTRA.</span><span>O JOGO NOS CONECTA.</span></div>
        </section>
        <section id="contato" className="final-section"><div className="final-layout"><div className="final-copy"><h2 data-reveal>READY TO<br /><em>BOUNCE?</em></h2><button className="light-button" onClick={() => scrollToSection('raquetes')}>ENCONTRE SEU JOGO</button></div><div className="final-scene" ref={finalRef} role="img" aria-label="Bola de tênis 3D na identidade Bounce">{finalNear && <FinalCanvas visible={finalVisible && !(selected || bagOpen || contact)} />}<span className="final-ball-caption">KEEP THE BALL IN PLAY.</span></div></div>
          <footer><div className="footer-main"><a className="brand-logo footer-logo" href="#inicio" aria-label="Bounce Tennis — início"><img src="/brand/bounce-light.svg" alt="Bounce" width="142" height="26" /></a><nav aria-label="Links do rodapé"><a href="#raquetes">RAQUETES</a>{brand.email ? <a href={`mailto:${brand.email}`}>CONTATO</a> : <button onClick={openContact}>CONTATO</button>}<a href="#sobre">SOBRE</a>{brand.instagram ? <a href={brand.instagram} target="_blank" rel="noopener noreferrer">INSTAGRAM</a> : <button onClick={() => setContact('instagram')}>INSTAGRAM</button>}</nav></div><div className="footer-bottom"><span>© {new Date().getFullYear()} BOUNCE TENNIS</span><button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>VOLTAR AO TOPO<ArrowUpRight size={18} strokeWidth={1.4} aria-hidden="true" /></button></div></footer>
        </section>
      </main>
      <div className="page-progress" aria-hidden="true" />
    </div>
    {selected && <ProductDetails product={selected} onVariantChange={changeDetailVariant} onClose={() => setSelected(null)} onAdd={add} added={bag.some(item => bagItemKey(item) === bagItemKey(selected))} onBag={() => { setSelected(null); setBagOpen(true); }} />}
    {bagOpen && <BagDrawer items={bag} onClose={() => setBagOpen(false)} onChange={change} onContact={openContact} />}
    {contact && <ContactDialog items={bag} onClose={() => setContact(null)} instagram={contact === 'instagram'} />}
    <div className={`toast ${notice ? 'visible' : ''}`} role="status" aria-live="polite">{notice}</div>
  </div>;
}
