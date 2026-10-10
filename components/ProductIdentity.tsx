import { type Product, type ProductColorway, formatPrice } from '@/lib/products';

export function ProductIdentity({ product, as: Heading = 'h3', id }: { product: Product; as?: 'h2' | 'h3'; id?: string }) {
  return <div className="product-identity"><Heading id={id} aria-label={product.name}>{product.brand}<em>{product.shortName}</em></Heading></div>;
}

export function ProductPrice({ product }: { product: Product }) {
  return <div className="product-price"><span>{formatPrice(product.price)}</span></div>;
}

export function ProductVariants({ product, selectedId, onSelect }: { product: Product; selectedId?: string; onSelect: (id: string) => void }) {
  if (!product.variants?.length) return <div className="product-variants" role="group" aria-label={`Cor de ${product.name}`}><span className="variant-label">{product.colorway.label}</span><span className="variant-swatch" aria-hidden="true"><SwatchFill colorway={product.colorway} /></span></div>;
  const selected = product.variants.find(variant => variant.id === selectedId) ?? product.variants[0];
  return <div className="product-variants"><span className="variant-label">{selected.label}</span><div className="variant-swatches" role="group" aria-label={`Cores de ${product.name}`}>
    {product.variants.map(variant => <button key={variant.id} type="button" className="variant-swatch" aria-label={variant.label} aria-pressed={variant.id === selected.id} title={variant.label} onClick={() => onSelect(variant.id)}><SwatchFill colorway={variant} /></button>)}
  </div></div>;
}

function SwatchFill({ colorway }: { colorway: ProductColorway }) {
  return <span className="variant-swatch-fill" aria-hidden="true"><span style={{ backgroundColor: colorway.colors[0] }} /><span style={{ backgroundColor: colorway.colors[1] }} /></span>;
}
