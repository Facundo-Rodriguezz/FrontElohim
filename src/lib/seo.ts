import type { Product } from './supabase';
import { parseFeatures } from './utils';

export type ProductSchema = {
  '@type': string;
  name: string;
  description: string;
  sku?: string;
  brand?: { '@type': string; name: string };
  category?: string;
  image?: string[];
  offers: {
    '@type': string;
    price: string;
    priceCurrency: string;
    availability: string;
    url: string;
  };
  aggregateRating?: {
    '@type': string;
    ratingValue: string;
    reviewCount: string;
  };
};

export function productJsonLd(p: Product, origin: string): ProductSchema {
  const images = (p.product_images ?? []).map((i) => i.url).filter(Boolean);
  const offers = {
    '@type': 'Offer',
    price: String(p.price),
    priceCurrency: 'ARS',
    availability: p.stock > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    url: `${origin}/producto/${p.slug}`,
  };
  const schema: ProductSchema = {
    '@type': 'Product',
    name: p.name,
    description: p.description ?? '',
    offers,
  };
  if (p.sku) schema.sku = p.sku;
  if (p.brand?.name) schema.brand = { '@type': 'Brand', name: p.brand.name };
  if (p.category?.name) schema.category = p.category.name;
  if (images.length) schema.image = images;
  if (p.reviews_count > 0 && p.rating > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(p.rating),
      reviewCount: String(p.reviews_count),
    };
  }
  return schema;
}

export function orgJsonLd(opts: { name: string; url: string; logo?: string | null; phone?: string | null; address?: string | null }) {
  return {
    '@type': 'Store',
    name: opts.name,
    url: opts.url,
    ...(opts.logo ? { logo: opts.logo } : {}),
    ...(opts.phone ? { telephone: opts.phone } : {}),
    ...(opts.address ? { address: { '@type': 'PostalAddress', streetAddress: opts.address } } : {}),
  };
}

export function parseProductFeatures(p: Product): string[] {
  return parseFeatures(p.features);
}
