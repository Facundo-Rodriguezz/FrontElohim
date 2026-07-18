import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const origin = site?.origin ?? 'https://elohimdescartabless.netlify.app';
  const body = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${new URL('/sitemap.xml', origin).toString()}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
