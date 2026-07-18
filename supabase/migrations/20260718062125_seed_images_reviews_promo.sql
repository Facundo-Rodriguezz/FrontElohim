/*
# Seed: product_images, reviews, promotion

## Overview
Images for each product (with fallback alternates), a few sample approved reviews,
and one default promotional banner. Idempotent via ON CONFLICT / NOT EXISTS guards.
*/

INSERT INTO public.product_images (product_id, url, alt, sort_order)
SELECT p.id, '/images/vasos termicos.png', 'Vasos térmicos', 0
FROM public.products p WHERE p.slug='vasos-termicos-pack-x25'
AND NOT EXISTS (SELECT 1 FROM public.product_images pi WHERE pi.product_id=p.id AND pi.url='/images/vasos termicos.png');

INSERT INTO public.product_images (product_id, url, alt, sort_order)
SELECT p.id, '/images/bandejas-termicas.jpg', 'Vasos térmicos alternativo', 1
FROM public.products p WHERE p.slug='vasos-termicos-pack-x25'
AND NOT EXISTS (SELECT 1 FROM public.product_images pi WHERE pi.product_id=p.id AND pi.url='/images/bandejas-termicas.jpg');

INSERT INTO public.product_images (product_id, url, alt, sort_order)
SELECT p.id, '/images/camiseta.png', 'Bolsas camiseta', 0
FROM public.products p WHERE p.slug='bolsas-camiseta-x100'
AND NOT EXISTS (SELECT 1 FROM public.product_images pi WHERE pi.product_id=p.id AND pi.url='/images/camiseta.png');

INSERT INTO public.product_images (product_id, url, alt, sort_order)
SELECT p.id, '/images/bolsas-residuos.jpg', 'Bolsas alternativo', 1
FROM public.products p WHERE p.slug='bolsas-camiseta-x100'
AND NOT EXISTS (SELECT 1 FROM public.product_images pi WHERE pi.product_id=p.id AND pi.url='/images/bolsas-residuos.jpg');

INSERT INTO public.product_images (product_id, url, alt, sort_order)
SELECT p.id, '/images/cubiertos.png', 'Cubiertos descartables', 0
FROM public.products p WHERE p.slug='cubiertos-descartables-x50'
AND NOT EXISTS (SELECT 1 FROM public.product_images pi WHERE pi.product_id=p.id AND pi.url='/images/cubiertos.png');

INSERT INTO public.product_images (product_id, url, alt, sort_order)
SELECT p.id, '/images/cubiertos-descartables.jpg', 'Cubiertos alternativo', 1
FROM public.products p WHERE p.slug='cubiertos-descartables-x50'
AND NOT EXISTS (SELECT 1 FROM public.product_images pi WHERE pi.product_id=p.id AND pi.url='/images/cubiertos-descartables.jpg');

INSERT INTO public.product_images (product_id, url, alt, sort_order)
SELECT p.id, '/images/caja rotiseria.png', 'Cajas gastronomía', 0
FROM public.products p WHERE p.slug='cajas-para-gastronomia'
AND NOT EXISTS (SELECT 1 FROM public.product_images pi WHERE pi.product_id=p.id AND pi.url='/images/caja rotiseria.png');

INSERT INTO public.product_images (product_id, url, alt, sort_order)
SELECT p.id, '/images/bandejas para micro.png', 'Bandejas microondas', 0
FROM public.products p WHERE p.slug='bandejas-para-microondas'
AND NOT EXISTS (SELECT 1 FROM public.product_images pi WHERE pi.product_id=p.id AND pi.url='/images/bandejas para micro.png');

INSERT INTO public.product_images (product_id, url, alt, sort_order)
SELECT p.id, '/images/servilletas.png', 'Servilletas', 0
FROM public.products p WHERE p.slug='servilletas-estampadas-x100'
AND NOT EXISTS (SELECT 1 FROM public.product_images pi WHERE pi.product_id=p.id AND pi.url='/images/servilletas.png');

INSERT INTO public.product_images (product_id, url, alt, sort_order)
SELECT p.id, '/images/servilletas.jpg', 'Servilletas alternativo', 1
FROM public.products p WHERE p.slug='servilletas-estampadas-x100'
AND NOT EXISTS (SELECT 1 FROM public.product_images pi WHERE pi.product_id=p.id AND pi.url='/images/servilletas.jpg');

-- reviews
INSERT INTO public.product_reviews (product_id, author, rating, comment, approved)
SELECT p.id, 'Carla M.', 5, 'Excelente calidad, llegaron rápido. Súper recomendables.', true
FROM public.products p WHERE p.slug='vasos-termicos-pack-x25'
AND NOT EXISTS (SELECT 1 FROM public.product_reviews r WHERE r.product_id=p.id AND r.author='Carla M.');

INSERT INTO public.product_reviews (product_id, author, rating, comment, approved)
SELECT p.id, 'Jorge R.', 4, 'Muy buenos, aunque el envío tardó un poco.', true
FROM public.products p WHERE p.slug='cajas-para-gastronomia'
AND NOT EXISTS (SELECT 1 FROM public.product_reviews r WHERE r.product_id=p.id AND r.author='Jorge R.');

INSERT INTO public.product_reviews (product_id, author, rating, comment, approved)
SELECT p.id, 'Lucía P.', 5, 'Perfectas para el local, compramos cada mes.', true
FROM public.products p WHERE p.slug='servilletas-estampadas-x100'
AND NOT EXISTS (SELECT 1 FROM public.product_reviews r WHERE r.product_id=p.id AND r.author='Lucía P.');

-- promotion
INSERT INTO public.promotions (title, subtitle, image_url, cta_text, cta_link, badge, active, sort_order)
VALUES (
  'Envío gratis en pedidos mayoristas',
  'Combiná productos y aprovechá nuestro envío a todo Córdoba Capital',
  '/images/bandejas-termicas.jpg',
  'Ver productos', '/catalogo', 'Promo', true, 10
)
ON CONFLICT DO NOTHING;
