/*
# Seed: site_config + categories + brands

## Overview
Initial site_config single row, six categories, and three brands for the catalog.
Idempotent via ON CONFLICT DO NOTHING.
*/

INSERT INTO public.site_config (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.categories (name, slug, icon, sort_order, description) VALUES
('Vasos Térmicos', 'vasos-termicos', 'cup', 10, 'Vasos térmicos de distintas medidas, ideales para bebidas calientes y frías.'),
('Bolsas', 'bolsas', 'shopping-bag', 20, 'Bolsas camiseta, arranque, polipropileno y de baja densidad.'),
('Cubiertos', 'cubiertos', 'utensils', 30, 'Tenedores, cucharas, cuchillos descartables y más.'),
('Gastronomía', 'gastronomia', 'package', 40, 'Cajas y envases para rotiserías y food delivery.'),
('Bandejas', 'bandejas', 'tray', 50, 'Bandejas para microondas en distintas medidas.'),
('Servilletas', 'servilletas', 'napkin', 60, 'Servilletas de distintos tamaños y diseños.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.brands (name, slug, description) VALUES
('Elohim', 'elohim', 'Marca propia de Elohim Descartables.'),
('Genérico', 'generico', 'Productos de uso general sin marca específica.'),
('Premium', 'premium', 'Línea premium de mayor durabilidad y presentación.')
ON CONFLICT (slug) DO NOTHING;
