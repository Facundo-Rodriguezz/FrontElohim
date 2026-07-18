/*
# Seed: products

## Overview
Six initial products covering all categories. Idempotent via ON CONFLICT (slug).
*/

INSERT INTO public.products (name, slug, description, features, sku, price, compare_price, stock, unit, category_id, brand_id, badges, featured, active, rating, reviews_count) VALUES
(
  'Vasos Térmicos Pack x25',
  'vasos-termicos-pack-x25',
  'Pack de 25 vasos térmicos de distintas medidas, ideales para café, té y bebidas calientes. Mantienen la temperatura y no se deforman.',
  'Material: cartón doble capa|Capacidad: 200/250/300 ml|Pack: 25 unidades|Apto para bebidas calientes y frías|Tapa compatible (no incluida)',
  'VAS-TERM-25', 3500, 4200, 120, 'pack',
  (SELECT id FROM public.categories WHERE slug='vasos-termicos'),
  (SELECT id FROM public.brands WHERE slug='elohim'),
  ARRAY['nuevo', 'oferta'], true, true, 4.5, 8
),
(
  'Bolsas Camiseta x100',
  'bolsas-camiseta-x100',
  'Bolsas camiseta, arranque, polipropileno y de baja densidad. Ideales para comercios y retail.',
  'Material: polipropileno|Pack: 100 unidades|Alta resistencia|Disponibles en varios tamaños',
  'BOL-CAM-100', 2800, NULL, 250, 'pack',
  (SELECT id FROM public.categories WHERE slug='bolsas'),
  (SELECT id FROM public.brands WHERE slug='generico'),
  ARRAY['destacado'], true, true, 4.2, 5
),
(
  'Cubiertos Descartables x50',
  'cubiertos-descartables-x50',
  'Tenedores, cucharas y cuchillos descartables. Prácticos para eventos, delivery y uso cotidiano.',
  'Material: plástico resistente|Pack: 50 unidades (mixto)|Higiénico|Apto para eventos',
  'CUB-DES-50', 1900, 2400, 80, 'pack',
  (SELECT id FROM public.categories WHERE slug='cubiertos'),
  (SELECT id FROM public.brands WHERE slug='elohim'),
  ARRAY['oferta'], true, true, 4.0, 3
),
(
  'Cajas para Gastronomía',
  'cajas-para-gastronomia',
  'Cajas de distintos tipos para rotiserías: autoarmables, con ventana y biodegradables.',
  'Material: cartón kraft|Varios tamaños|Autoarmables|Apto contacto alimentario',
  'CAJ-GAST-001', 3200, NULL, 60, 'unidad',
  (SELECT id FROM public.categories WHERE slug='gastronomia'),
  (SELECT id FROM public.brands WHERE slug='premium'),
  ARRAY['destacado'], true, true, 4.7, 11
),
(
  'Bandejas para Microondas',
  'bandejas-para-microondas',
  'Bandejas 102, 103, 105 y 107 aptas para microondas. Resisten altas temperaturas.',
  'Modelos: 102, 103, 105, 107|Apto microondas|Material: CPET|Resistente hasta 220°C',
  'BAN-MIC-102', 2600, NULL, 0, 'pack',
  (SELECT id FROM public.categories WHERE slug='bandejas'),
  (SELECT id FROM public.brands WHERE slug='elohim'),
  ARRAY['nuevo'], false, true, 0, 0
),
(
  'Servilletas Estampadas x100',
  'servilletas-estampadas-x100',
  'Servilletas de distintos tamaños y diseños. Suaves y absorbentes.',
  'Material: papel 1/2 capa|Pack: 100 unidades|Varios diseños|Doble capa disponible',
  'SER-EST-100', 1500, 1900, 200, 'pack',
  (SELECT id FROM public.categories WHERE slug='servilletas'),
  (SELECT id FROM public.brands WHERE slug='generico'),
  ARRAY['oferta', 'destacado'], true, true, 4.3, 7
)
ON CONFLICT (slug) DO NOTHING;
