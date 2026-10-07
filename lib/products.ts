export type Product = {
  id: string; name: string; shortName: string; brand: string; category: string;
  edition: string; description: string; color: string; model: string;
  rotation: [number, number, number]; price: number | null; specs: [string, string][];
};

export const products: Product[] = [
  {
    id: 'blade-team', name: 'Wilson Blade Team', shortName: 'Blade Team', brand: 'Wilson',
    category: 'Tênis', edition: '01 / PRECISÃO EM MOVIMENTO',
    description: 'Encontre seu ritmo. Uma raquete para explorar cada ângulo do seu jogo, do primeiro saque ao último ponto.',
    color: '#183C32', model: '/models/wilson-blade-team.glb', rotation: [Math.PI / 2, 0, 0], price: null,
    specs: [['Marca', 'Wilson'], ['Modalidade', 'Tênis'], ['Peso', 'A confirmar'], ['Balanço', 'A confirmar'], ['Cabeça', 'A confirmar'], ['Padrão de corda', 'A confirmar'], ['Nível', 'A confirmar'], ['Indicação', 'A confirmar'], ['Estoque', 'Sob consulta']],
  },
  {
    id: 'blade-98', name: 'Wilson Blade', shortName: 'Blade', brand: 'Wilson',
    category: 'Tênis', edition: '02 / O JOGO É SEU',
    description: 'Intenção em cada movimento. Explore de perto os detalhes de uma das silhuetas mais reconhecidas das quadras.',
    color: '#8F4535', model: '/models/wilson-blade-98.glb', rotation: [0, 0, Math.PI / 2], price: null,
    specs: [['Marca', 'Wilson'], ['Modalidade', 'Tênis'], ['Peso', 'A confirmar'], ['Balanço', 'A confirmar'], ['Cabeça', 'A confirmar'], ['Padrão de corda', 'A confirmar'], ['Nível', 'A confirmar'], ['Indicação', 'A confirmar'], ['Estoque', 'Sob consulta']],
  },
  {
    id: 'magnum', name: 'Tails Magnum Mg.05', shortName: 'Magnum Mg.05', brand: 'Tails',
    category: 'Tênis', edition: '03 / SUA PRÓXIMA JOGADA',
    description: 'Personalidade em cada ponto. Explore o design da Magnum Mg.05 e encontre uma nova maneira de expressar seu jogo.',
    color: '#C96B4B', model: '/models/tails-magnum-mg05.glb', rotation: [0.501175567, -0.035397855, -0.724895927], price: null,
    specs: [['Marca', 'Tails'], ['Modalidade', 'Tênis'], ['Peso', 'A confirmar'], ['Balanço', 'A confirmar'], ['Cabeça', 'A confirmar'], ['Padrão de corda', 'A confirmar'], ['Nível', 'A confirmar'], ['Indicação', 'A confirmar'], ['Estoque', 'Sob consulta']],
  },
];
export const formatPrice = (value: number | null) => value === null ? 'Preço sob consulta' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
