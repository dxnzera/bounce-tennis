import { products, resolveProductVariant } from './products';

export type BagItem = { id: string; variantId?: string; quantity: number };
export const bagItemKey = (item: { id: string; variantId?: string }) => `${item.id}:${item.variantId ?? ''}`;

export function restoreBag(saved: unknown): BagItem[] {
  if (!Array.isArray(saved)) return [];
  const result: BagItem[] = [];
  for (const item of saved) {
    if (!item || typeof item.id !== 'string' || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) continue;
    const id = item.id === 'blade-team' ? 'blade-98' : item.id === 'magnum' ? 'head-ti-s6' : item.id;
    const product = products.find(product => product.id === id);
    if (!product) continue;
    const variantId = item.variantId ?? (item.id === 'blade-team' ? 'silver-lime' : item.id === 'blade-98' ? 'black-forest' : undefined);
    if (variantId && !product.variants?.some(variant => variant.id === variantId)) continue;
    const view = resolveProductVariant(product, variantId);
    const entry = { id, variantId: view.variantId, quantity: item.quantity };
    const previous = result.find(existing => bagItemKey(existing) === bagItemKey(entry));
    if (previous) previous.quantity = Math.min(20, previous.quantity + entry.quantity);
    else result.push(entry);
  }
  return result;
}
