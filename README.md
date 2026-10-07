# Bounce Tennis

Experiência editorial em português construída com Next.js 16, TypeScript, React 19, React Three Fiber, Three.js, Drei, GSAP/ScrollTrigger, Tailwind CSS e Lucide. Exportação estática, sem serviço externo necessário para renderizar os modelos.

## Executar

```sh
npm ci
npm run dev
```

Acesse `http://127.0.0.1:3000`. Para verificar e gerar a versão de produção:

```sh
npm run typecheck
npm run build
```

O resultado fica em `out/` e pode ser servido por qualquer hospedagem estática.

## Experiência

- Introdução com bola GLB, rebatida, câmera, impacto e revelação sincronizados com o scroll; scrub reversível e pin com GSAP.
- Seleção em três capítulos horizontais no desktop e exploração vertical com toque no mobile.
- Cada modelo normalizado após uma rotação individual, com materiais originais e enquadramento próprio.
- Arraste para explorar em 360°. No modelo focalizado, as setas esquerda/direita também giram o objeto. Enter abre seus detalhes.
- Expansão do produto, especificações, sacola com quantidade/remoção e exportação da seleção em `.txt`.
- Sacola salva apenas no dispositivo via localStorage. Não cria pedidos, não cobra e não transmite dados.
- Modais com Escape, foco contido e conteúdo de fundo inerte. Navegação por teclado, foco visível e versão com movimento reduzido.
- Modelos carregados sob demanda, renderização suspensa fora de vista e abaixo dos modais, DPR limitado e reduzido em dispositivos com pouca memória/processadores.

## Dados comerciais pendentes

Edite `lib/products.ts` para preencher preço, estoque e ficha técnica oficiais. Os arquivos fornecidos não determinam peso, balanço, nível ou disponibilidade; esses campos estão explicitamente sob consulta. O segundo arquivo permite identificar a família Wilson Blade, mas não confirmar a edição. A Tails Magnum Mg.05 é apresentada como raquete de tênis: a validação visual confirmou cabeça encordoada. Sua ficha técnica permanece pendente.

Configure e-mail e URL de Instagram em `lib/brand.ts`. Até esses canais serem informados, o site mostra seu estado de disponibilidade e permite salvar a seleção, sem enviar mensagens a destinos inventados. Um fluxo real de pagamento/pedido exige a integração com os serviços comerciais da marca.

## Assets

Os quatro GLBs e os logos fornecidos pelo usuário foram preservados na pasta original, um nível acima deste projeto. As cópias de produção estão em `public/models` e `public/brand`.

| Modelo | Arquivo | Tamanho aproximado |
| --- | --- | --- |
| Bola | `public/models/tennis-ball.glb` | 0,27 MiB |
| Wilson Blade Team | `public/models/wilson-blade-team.glb` | 0,85 MiB |
| Wilson Blade | `public/models/wilson-blade-98.glb` | 1,05 MiB |
| Tails Magnum Mg.05 | `public/models/tails-magnum-mg05.glb` | 0,50 MiB |

As texturas foram redimensionadas e convertidas para WebP. As geometrias e os materiais originais foram mantidos. As atribuições e licenças presentes nos GLBs continuam em seus metadados.

As fontes DM Sans são servidas localmente em `public/fonts`.

## Organização

- `components/`: navegação, capítulos, modais e cenas 3D.
- `lib/animations/`: introdução, transições e navegação compatível com pin.
- `hooks/`: visibilidade, viewport, movimento reduzido e orçamento de renderização.
- `lib/products.ts` e `lib/brand.ts`: configurações comerciais.

O site detecta WebMCP e disponibiliza a leitura da seleção e a adição de produtos à sacola pelo mesmo estado usado na interface. A integração nativa WebMCP não pôde ser validada no navegador integrado deste ambiente; em navegadores sem suporte, a experiência visual continua funcionando normalmente.
