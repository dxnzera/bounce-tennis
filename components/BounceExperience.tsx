'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Menu, X, ShoppingBag } from 'lucide-react';
import HeroExperience from './HeroExperience';
import RacketsExperience from './RacketsExperience';
import { BagDrawer, ContactDialog, ProductDetails, type BagItem } from './Dialogs';
import { products, type Product } from '@/lib/products';
import { brand } from '@/lib/brand';
import { scrollToSection } from '@/lib/animations/navigation';
import CustomCursor from './CustomCursor';
import { animatePage } from '@/lib/animations/transitions';
import { useInView } from '@/hooks/useExperience';
const FinalCanvas = dynamic(() => import('./Scene3D').then(module => module.FinalCanvas), { ssr: false });

type AgentTool = { name: string; description: string; inputSchema: object; execute: (input: unknown) => unknown; annotations: { readOnlyHint: boolean; untrustedContentHint: boolean } };
type ModelContext = { registerTool: (tool: AgentTool, options: { signal: AbortSignal }) => void | Promise<void> };

export default function BounceExperience() {
  const root = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [bag, setBag] = useState<BagItem[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [contact, setContact] = useState<'contact' | 'instagram' | null>(null);
  const [notice, setNotice] = useState('');
  const { ref: finalRef, near: finalNear, visible: finalVisible } = useInView();
  const bagRef = useRef(bag); bagRef.current = bag;
  const count = bag.reduce((sum, item) => sum + item.quantity, 0);
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem('bounce-bag-v1') || '[]');
      if (Array.isArray(saved)) setBag(saved.filter((item): item is BagItem => !!item && typeof item.id === 'string' && products.some(product => product.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 20));
    } catch { }
    setStorageReady(true);
  }, []);
  useEffect(() => { if (storageReady) { try { localStorage.setItem('bounce-bag-v1', JSON.stringify(bag)); } catch { } } }, [bag, storageReady]);
  useEffect(() => { if (!root.current) return; return animatePage(root.current); }, []);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 3500); return () => clearTimeout(timer); }, [notice]);
  const add = useCallback((id: string) => {
    const product = products.find(product => product.id === id);
    if (!product) throw new Error('Produto desconhecido.');
    setBag(previous => previous.some(item => item.id === id) ? previous.map(item => item.id === id ? { ...item, quantity: Math.min(20, item.quantity + 1) } : item) : [...previous, { id, quantity: 1 }]);
    setNotice(`${product.name} adicionada à sacola.`);
  }, []);
  const change = (id: string, delta: number) => setBag(previous => previous.map(item => item.id === id ? { ...item, quantity: Math.min(20, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = (tool: AgentTool) => { try { void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {}); } catch { } };
    register({ name: 'read_bounce_selection', description: 'Leia os produtos e a seleção atual da sacola Bounce; preços e disponibilidade estão sob consulta.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false }, execute: () => ({ products: products.map(({ id, name, category, price }) => ({ id, name, category, price })), bag: bagRef.current }) });
    register({ name: 'add_bounce_product_to_bag', description: 'Adicione uma raquete à seleção local da sacola. Não realiza pedido nem cobrança.', inputSchema: { type: 'object', properties: { productId: { type: 'string', enum: products.map(product => product.id) } }, required: ['productId'], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute: async input => {
      if (!input || typeof input !== 'object' || !('productId' in input) || typeof input.productId !== 'string') throw new Error('Informe productId.');
      const id = input.productId; add(id); setSelected(null); setContact(null); setBagOpen(true);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return { status: 'added_to_local_bag', bag: bagRef.current };
    } });
    return () => lifecycle.abort();
  }, [add]);
  const closeAll = () => { setSelected(null); setBagOpen(false); setContact(null); };
  const openContact = () => { closeAll(); setContact('contact'); };
  return <div ref={root}>
    <CustomCursor /><div id="page-content" onClick={event => { const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]'); if (anchor) { event.preventDefault(); scrollToSection(anchor.hash.slice(1)); } }}>
      <a className="skip-link" href="#raquetes">Ir para as raquetes</a>
      <header className="site-header"><a className="brand-logo" href="#inicio" aria-label="Bounce Tennis — início"><img src="/brand/bounce-dark.svg" alt="Bounce" width="132" height="24" /><span>TENNIS</span></a><nav className={`main-nav ${menu ? 'menu-open' : ''}`} aria-label="Menu principal"><a href="#raquetes" onClick={() => setMenu(false)}>RAQUETES</a><a href="#sobre" onClick={() => setMenu(false)}>SOBRE</a><a href="#contato" onClick={() => setMenu(false)}>CONTATO</a></nav><div className="header-actions"><button className="bag-button" onClick={() => { closeAll(); setBagOpen(true); }} aria-label={`Abrir sacola, ${count} itens`}><span>SACOLA</span><ShoppingBag size={17} strokeWidth={1.4} /><span className="bag-count">{count.toString().padStart(2, '0')}</span></button><button className="menu-button icon-button" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label={menu ? 'Fechar menu' : 'Abrir menu'}>{menu ? <X size={22} /> : <Menu size={22} />}</button></div></header>
      <main><HeroExperience /><RacketsExperience paused={!!(selected || bagOpen || contact)} onOpen={product => { closeAll(); setSelected(product); }} />
        <section id="sobre" className="about-section"><div className="about-top"><span className="eyebrow">NOSSO JEITO DE JOGAR</span><span>02 / THE CLUB</span></div><div className="about-layout"><div className="about-copy"><h2 data-reveal>MAIS QUE<br />UMA LOJA<br /><em>de tênis.</em></h2><div className="about-court-line" aria-hidden="true" /><p data-reveal>Um ponto de encontro para quem vive o esporte.</p><p className="about-description" data-reveal>Selecionamos equipamentos para quem leva o jogo para além da quadra. Performance, personalidade e a vontade de jogar mais um set.</p><span className="about-signature">É SOBRE COMO VOCÊ VIVE O JOGO.</span></div><figure className="about-photo"><img src="/images/clay-court.webp" alt="Quadra de saibro em um clube de tênis, com rede, linhas brancas e árvores sob a luz da tarde" width="1536" height="1024" loading="lazy" /><figcaption><span>ON COURT. OFF COURT.</span><span>BOUNCE TENNIS</span></figcaption></figure></div><div className="about-baseline"><span>O ESPORTE NOS MOVE.</span><span>O ESTILO NOS ENCONTRA.</span><span>O JOGO NOS CONECTA.</span></div></section>
        <section id="contato" className="final-section"><div className="final-top"><span className="eyebrow light">O PRÓXIMO PONTO É SEU.</span><span>03 / SEE YOU ON COURT</span></div><div className="final-layout"><div className="final-copy"><h2 data-reveal>READY TO<br /><em>BOUNCE?</em></h2><button className="light-button" onClick={() => scrollToSection('raquetes')}>ENCONTRE SEU JOGO <span>03</span></button></div><div className="final-scene" ref={finalRef} role="img" aria-label="Bola de tênis 3D na identidade Bounce">{finalNear && <FinalCanvas visible={finalVisible && !(selected || bagOpen || contact)} />}<span className="final-ball-caption">KEEP THE BALL IN PLAY.</span></div></div>
          <footer><div className="footer-main"><a className="brand-logo footer-logo" href="#inicio" aria-label="Bounce Tennis — início"><img src="/brand/bounce-light.svg" alt="Bounce" width="142" height="26" /><span>TENNIS</span></a><p>Tênis. Estilo. Performance.<br />Dentro e fora da quadra.</p><nav aria-label="Links do rodapé"><a href="#raquetes">RAQUETES</a><a href="#sobre">SOBRE</a>{brand.email ? <a href={`mailto:${brand.email}`}>CONTATO</a> : <button onClick={openContact}>CONTATO</button>}{brand.instagram ? <a href={brand.instagram} target="_blank" rel="noopener noreferrer">INSTAGRAM</a> : <button onClick={() => setContact('instagram')}>INSTAGRAM</button>}</nav></div><div className="footer-wordmark" aria-hidden="true"><img src="/brand/bounce-light.svg" alt="" width="1400" height="219" /></div><div className="footer-bottom"><span>© {new Date().getFullYear()} BOUNCE TENNIS</span><span>FEITO PARA QUEM VIVE O JOGO.</span><button onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>VOLTAR AO TOPO</button></div></footer>
        </section>
      </main>
      <div className="page-progress" aria-hidden="true" />
    </div>
    {selected && <ProductDetails product={selected} onClose={() => setSelected(null)} onAdd={add} added={bag.some(item => item.id === selected.id)} onBag={() => { setSelected(null); setBagOpen(true); }} />}
    {bagOpen && <BagDrawer items={bag} onClose={() => setBagOpen(false)} onChange={change} onContact={openContact} />}
    {contact && <ContactDialog items={bag} onClose={() => setContact(null)} instagram={contact === 'instagram'} />}
    <div className={`toast ${notice ? 'visible' : ''}`} role="status" aria-live="polite">{notice}</div>
  </div>;
}
