/**
 * Catalog API client.
 * Data sourced from the backend's /web/api/catalog — which reads directly
 * from src/config/catalog.ts (single source of truth). Do not duplicate
 * catalog data in this repo.
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// 'composite' = a single photo printed N-up on a sheet (wallet ×4, mini ×8).
export type ProductType = 'photo_print' | 'poster' | 'composite';
export type Finish = 'glossy' | 'lustre';

export interface CatalogProduct {
  sizeCode: string;
  productType: ProductType;
  labelInches: string;
  labelCm: string;
  displayLabel: string;
  unitPriceUsd: number;
  finish: Finish;
  requiresManualReview: boolean;
  minResolution: { width: number; height: number };
  recommendedResolution: { width: number; height: number };
}

export async function getCatalog(): Promise<CatalogProduct[]> {
  const res = await fetch(`${API}/web/api/catalog`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch catalog');
  return res.json();
}

export async function getProduct(sizeCode: string): Promise<CatalogProduct | undefined> {
  const catalog = await getCatalog();
  return catalog.find((p) => p.sizeCode === sizeCode);
}

/** USD formatted */
export function formatPrice(usd: number): string {
  return `USD ${usd.toFixed(2)}`;
}
