# Bounce Tennis

Criei este site para a Bounce Tennis, com foco nas raquetes, na identidade da marca e na interação com os modelos 3D. Usei Next.js, TypeScript, React Three Fiber e GSAP.

## O que implementei

- Catálogo com Wilson Blade 98s, HEAD Titanium Ti.S6 e Wilson Code Six One 95.
- Modelos 3D com rotação, zoom e troca de acabamento na Blade. Todas as cores têm nomes visíveis e acessíveis a leitores de tela.
- Abertura com bola e raquete animadas conforme a rolagem.
- Layout para desktop e celular, navegação por teclado e suporte a movimento reduzido.
- Sacola salva no navegador, com ajuste de quantidade, remoção e exportação da seleção em `.txt`.
- Otimização dos modelos e texturas, com carregamento sob demanda e renderização suspensa fora de vista.

A sacola serve para montar uma seleção. Ainda não integrei pagamento ou envio de pedidos.

## Rodar localmente

Na pasta `bounce-tennis`:

```sh
npm ci
npm run dev
```

Acesso pelo endereço <http://127.0.0.1:3000>.

## Gerar a versão de produção

```sh
npm run build
```

Os arquivos ficam em `out/`. Vou fazer a publicação separadamente; o projeto não tem publicação automática.

## Onde ajusto o conteúdo

- `lib/products.ts`: modelos, descrições, especificações, preços e cores.
- `lib/brand.ts`: e-mail e Instagram, que ainda preciso preencher.
- `app/globals.css`: estilos do site.

Mantive os modelos originais em `assets/source/` e as versões usadas pelo site em `public/`.
