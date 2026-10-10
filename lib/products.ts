type ProductSource = { label: string; url: string };
export type ProductColorway = { label: string; colors: [string, string] };
type ProductVariant = {
  id: string; label: string; colors: [string, string];
  model: string; rotation: [number, number, number];
  price: number | null; specs: [string, string][];
  referenceNote: string; sources: ProductSource[];
};
export type Product = {
  id: string; name: string; shortName: string; brand: string;
  description: string; colorway: ProductColorway; model: string;
  rotation: [number, number, number]; price: number | null; specs: [string, string][];
  referenceNote: string; sources: ProductSource[]; variants?: ProductVariant[];
};
export type ProductView = Product & { variantId?: string };

const bladeSources = [{ label: 'Wilson · catálogo de raquetes', url: 'https://coachsteveclarkphd.com/wp-content/uploads/2018/12/SS19_Tennis_Catalog.pdf#page=7' }];
const bladeV7Sources = [{ label: 'Blade 98S v7 · ficha WR013811U', url: 'https://www.hobispor.com/urun/blade-98s-v-7-0' }];
const bladeV7Specs: [string, string][] = [['Peso sem cordas', '295 g'], ['Balanço sem cordas', '325 mm'], ['Cabeça', '98 in² / 632 cm²'], ['Padrão de corda', '18 × 16'], ['Comprimento', '27 in / 68,6 cm'], ['Tecnologias', 'FeelFlex / Spin Effect']];
const bladeSpecs: [string, string][] = [['Peso sem cordas', '294 g'], ['Balanço sem cordas', '330 mm'], ['Cabeça', '98 in² / 632 cm²'], ['Padrão de corda', '18 × 16'], ['Comprimento', '27 in / 68,6 cm'], ['Perfil', '20,6 mm']];

export const products: Product[] = [
  {
    id: 'blade-98', name: 'Wilson Blade 98s', shortName: 'Blade 98s', brand: 'Wilson',
    description: 'Controle e spin em cada ponto. Cabeça de 98 in² e padrão aberto 18 × 16.',
    colorway: { label: 'Cinza / verde claro', colors: ['#87989B', '#A4D46D'] }, model: '/models/wilson-blade-team.glb', rotation: [Math.PI / 2, 0, 0], price: 1399,
    specs: bladeV7Specs, referenceNote: 'A ficha acompanha a edição selecionada. As duas opções usam os modelos fornecidos, identificados como Blade 98s nas texturas. Valores de venda e disponibilidade são confirmados pela Bounce.', sources: bladeSources,
    variants: [
      { id: 'silver-lime', label: 'Cinza / verde claro', colors: ['#87989B', '#A4D46D'], model: '/models/wilson-blade-team.glb', rotation: [Math.PI / 2, 0, 0], price: 1399, specs: bladeV7Specs, referenceNote: 'Ficha da Blade 98s v7, código WR013811U: 295 g sem cordas, balanço de 325 mm e tecnologias FeelFlex e Spin Effect. Valores de venda e disponibilidade são confirmados pela Bounce.', sources: bladeV7Sources },
      { id: 'black-forest', label: 'Preto / verde folha', colors: ['#202823', '#4E8C31'], model: '/models/wilson-blade-98.glb', rotation: [0, 0, Math.PI / 2], price: 1319, specs: bladeSpecs, referenceNote: 'Ficha da Blade 98s Countervail, edição v6, publicada no catálogo Wilson SS19. Valores de venda e disponibilidade são confirmados pela Bounce.', sources: bladeSources },
    ],
  },
  {
    id: 'head-ti-s6', name: 'HEAD Titanium Ti.S6', shortName: 'Titanium Ti.S6', brand: 'Head',
    description: 'Leve e potente. Uma cabeça ampla de 115 in² para jogar com conforto e confiança.',
    colorway: { label: 'Azul / preto', colors: ['#244D87', '#171917'] }, model: '/models/tails-magnum-mg05.glb', rotation: [0.501175567, -0.035397855, -0.724895927], price: 1239,
    specs: [['Peso sem cordas', '225 g'], ['Balanço sem cordas', '380 mm · cabeça pesada'], ['Cabeça', '115 in²'], ['Padrão de corda', '16 × 19'], ['Comprimento', '70,3 cm'], ['Composição', 'Carbono / titânio']],
    referenceNote: 'Ficha da HEAD Titanium Ti.S6. O preço anunciado pela HEAD Brasil em 08/10/2026 é R$ 1.399,00; condições e disponibilidade de venda na Bounce são confirmadas pela equipe. A visualização usa o modelo fornecido, inspirado na Ti.S6.',
    sources: [{ label: 'HEAD Brasil · Titanium Ti.S6', url: 'https://headbrasil.com.br/raquete-de-tenis-head-ti-s6' }, { label: 'HEAD Sport AG · materiais e peso da Ti.S6', url: 'https://www.researchgate.net/publication/283140872_Materials_and_tennis_rackets' }, { label: 'Ti.S6 · ficha do código 236005', url: 'https://sportco.co.nz/product/head-ti-s6-original-tennis-racquet/' }],
  },
  {
    id: 'code-six-one-95', name: 'Wilson Code Six One 95', shortName: 'Code Six One 95', brand: 'Wilson',
    description: 'Precisão e estabilidade. Cabeça de 95 in² e estrutura nCode em grafite e Kevlar.',
    colorway: { label: 'Vermelho / branco', colors: ['#C92F37', '#F8F7F3'] },
    model: '/models/wilson-code-six-one-95.glb', rotation: [Math.PI / 2, 0, 0], price: 539,
    specs: [['Peso sem cordas', '333 g'], ['Balanço sem cordas', '305 mm · cabeça leve'], ['Cabeça', '95 in² / 613 cm²'], ['Padrões da linha', '16 × 18 / 18 × 20'], ['Comprimento', '27 in / 68,6 cm'], ['Composição', 'Grafite / Hyper Carbon / Kevlar']],
    referenceNote: 'Ficha da Wilson nCode Six-One 95 de 333 g. A linha possui versões 16 × 18 e 18 × 20; o padrão da unidade é confirmado pela Bounce. A visualização 3D é ilustrativa. Valor de venda informado pela marca.',
    sources: [{ label: 'Wilson · história da nSix.One 95', url: 'https://www.wilson.com/es-es/blog/tennis/wilson-pro-staff-history' }, { label: 'Wilson · padrões de encordoamento, página 8', url: 'https://contents.raku-uru.jp/01/23935/446/WilsonTennisStringingPatterns_1698223470006.pdf#page=8' }, { label: 'Tennis Warehouse · teste da nSix-One 95', url: 'https://www.tennis-warehouse.com/learning_center/racquet_reviews/WN6195review.html' }, { label: 'ProStockTennis · ficha de 333 g sem cordas', url: 'https://www.prostocktennis.com/products/wilson-ncode-nsix-one-95-16x18' }],
  },
];

export function resolveProductVariant(product: Product, variantId?: string): ProductView {
  const variant = product.variants?.find(item => item.id === variantId) ?? product.variants?.[0];
  if (!variant) return product;
  return { ...product, variantId: variant.id, colorway: { label: variant.label, colors: variant.colors }, model: variant.model, rotation: variant.rotation, price: variant.price, specs: variant.specs, referenceNote: variant.referenceNote, sources: variant.sources };
}
export const formatPrice = (value: number | null) => value === null ? 'Preço sob consulta' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
