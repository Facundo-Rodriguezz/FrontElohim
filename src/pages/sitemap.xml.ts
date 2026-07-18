import type { APIRoute } from 'astro';
import { getAllProducts, getCategories } from '../lib/queries';

export const GET: APIRoute = async ({ site }) => {
  const origin = site?.origin ?? 'https://elohimdescartabless.netlify.app';
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);
  const staticUrls = ['/', '/catalogo', '/admin'];
  const catUrls = categories.map((c) => `/catalogo?cat=${c.slug}`);
  const productUrls = products.map((p) => `/producto/${p.slug}`);

  const urls = [...staticUrls, ...catUrls, ...productUrls];
  const lastmod = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => {
    const clean = u.split('?')[0];
    return `  <url><loc>${new URL(u, origin).toString()}</loc><lastmod>${lastmod}</lastmod>${u.includes('?') ? '' : `<changefreq>weekly</changefreq><priority>${u === '/' ? '1.0' : '0.7'}</priority>`}</url>`;
  })
  .filter((u, i, arr) => arr.findIndex((x) => x.includes('<loc>') && u.includes('<loc>') && x.split('<loc>')[1] === u.split('<loc>')[1]) === i)
  .join('\n')}
</urlset>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
