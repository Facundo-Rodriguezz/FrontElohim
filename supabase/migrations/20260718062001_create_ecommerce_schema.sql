/*
# Elohim Descartables - E-commerce schema

## Overview
Complete e-commerce backend for a disposable-products store with a public catalog
and an authenticated admin panel. Public visitors (anon role) can read catalog
data; only authenticated admins/employees can write/manage data.

## Tables created
1. `profiles` - extends auth.users with a role (admin | employee)
2. `categories` - product categories (name, slug, icon, sort order, active)
3. `brands` - product brands (name, slug, logo, description, active)
4. `products` - catalog items (name, slug, description, features, price, compare_price, stock, sku, badges, category, brand, featured, active, rating)
5. `product_images` - multiple images per product (url, alt, sort order)
6. `product_reviews` - customer reviews (rating, comment, author, product)
7. `promotions` - promotional banners (title, subtitle, image, cta, active, dates)
8. `site_config` - single-row site settings (company name, logo, contact, theme, home texts, footer)
9. `order_requests` - orders submitted via WhatsApp form (customer + detail)

## Security
- RLS enabled on every table.
- Public (anon, authenticated) READ on all catalog/config tables.
- WRITE restricted to authenticated staff (admin/employee) via `is_staff()`.
- Profiles: a user can read/update only their own profile row.
- Reviews and order_requests: anyone (anon) can INSERT; staff can read/manage.
*/

-- ============================================================
-- profiles (created FIRST so is_staff() can reference it)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper: is_staff() -> true if current user is admin/employee
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'employee')
  );
$$;

-- ============================================================
-- categories
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- brands
-- ============================================================
CREATE TABLE IF NOT EXISTS public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  logo_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- products
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  features text,
  sku text,
  price numeric(12,2) NOT NULL DEFAULT 0,
  compare_price numeric(12,2),
  stock int NOT NULL DEFAULT 0,
  unit text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  badges text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  rating numeric(2,1) NOT NULL DEFAULT 0,
  reviews_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS products_category_id_idx ON public.products(category_id);
CREATE INDEX IF NOT EXISTS products_brand_id_idx ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS products_featured_idx ON public.products(featured);
CREATE INDEX IF NOT EXISTS products_active_idx ON public.products(active);
CREATE INDEX IF NOT EXISTS products_slug_idx ON public.products(slug);

-- ============================================================
-- product_images
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS product_images_product_id_idx ON public.product_images(product_id);

-- ============================================================
-- product_reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  author text NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS product_reviews_product_id_idx ON public.product_reviews(product_id);

-- ============================================================
-- promotions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text,
  cta_text text,
  cta_link text,
  badge text,
  active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- site_config (single row)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_config (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  company_name text NOT NULL DEFAULT 'Elohim Descartables',
  logo_url text,
  phone text,
  whatsapp text,
  email text,
  address text,
  instagram text,
  facebook text,
  hours text,
  primary_color text NOT NULL DEFAULT '#800020',
  accent_color text NOT NULL DEFAULT '#a3324d',
  hero_title text NOT NULL DEFAULT 'Productos descartables al por mayor y menor',
  hero_subtitle text,
  hero_image_url text,
  promo_title text,
  promo_subtitle text,
  promo_image_url text,
  promo_cta_text text,
  promo_cta_link text,
  footer_text text,
  newsletter_title text NOT NULL DEFAULT 'Suscribite y recibí ofertas exclusivas',
  free_shipping_threshold text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- order_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  telefono text NOT NULL,
  calle text,
  numeracion text,
  piso text,
  departamento text,
  localidad text,
  provincia text,
  pedido text NOT NULL,
  status text NOT NULL DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'en_proceso', 'completado', 'cancelado')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.order_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS order_requests_status_idx ON public.order_requests(status);
CREATE INDEX IF NOT EXISTS order_requests_created_at_idx ON public.order_requests(created_at DESC);

-- ============================================================
-- POLICIES (all together after tables exist)
-- ============================================================

-- profiles
DROP POLICY IF EXISTS "profiles_select_own_or_staff" ON public.profiles;
CREATE POLICY "profiles_select_own_or_staff" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_staff());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_staff_all" ON public.profiles;
CREATE POLICY "profiles_staff_all" ON public.profiles
  FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- categories
DROP POLICY IF EXISTS "categories_read_public" ON public.categories;
CREATE POLICY "categories_read_public" ON public.categories
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "categories_write_staff" ON public.categories;
CREATE POLICY "categories_write_staff" ON public.categories
  FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- brands
DROP POLICY IF EXISTS "brands_read_public" ON public.brands;
CREATE POLICY "brands_read_public" ON public.brands
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "brands_write_staff" ON public.brands;
CREATE POLICY "brands_write_staff" ON public.brands
  FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- products
DROP POLICY IF EXISTS "products_read_public" ON public.products;
CREATE POLICY "products_read_public" ON public.products
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "products_write_staff" ON public.products;
CREATE POLICY "products_write_staff" ON public.products
  FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- product_images
DROP POLICY IF EXISTS "product_images_read_public" ON public.product_images;
CREATE POLICY "product_images_read_public" ON public.product_images
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "product_images_write_staff" ON public.product_images;
CREATE POLICY "product_images_write_staff" ON public.product_images
  FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- product_reviews
DROP POLICY IF EXISTS "reviews_read_public" ON public.product_reviews;
CREATE POLICY "reviews_read_public" ON public.product_reviews
  FOR SELECT TO anon, authenticated USING (approved = true OR public.is_staff());

DROP POLICY IF EXISTS "reviews_insert_public" ON public.product_reviews;
CREATE POLICY "reviews_insert_public" ON public.product_reviews
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "reviews_write_staff" ON public.product_reviews;
CREATE POLICY "reviews_write_staff" ON public.product_reviews
  FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- promotions
DROP POLICY IF EXISTS "promotions_read_public" ON public.promotions;
CREATE POLICY "promotions_read_public" ON public.promotions
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "promotions_write_staff" ON public.promotions;
CREATE POLICY "promotions_write_staff" ON public.promotions
  FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- site_config
DROP POLICY IF EXISTS "site_config_read_public" ON public.site_config;
CREATE POLICY "site_config_read_public" ON public.site_config
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "site_config_write_staff" ON public.site_config;
CREATE POLICY "site_config_write_staff" ON public.site_config
  FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- order_requests
DROP POLICY IF EXISTS "orders_insert_public" ON public.order_requests;
CREATE POLICY "orders_insert_public" ON public.order_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "orders_read_staff" ON public.order_requests;
CREATE POLICY "orders_read_staff" ON public.order_requests
  FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "orders_manage_staff" ON public.order_requests;
CREATE POLICY "orders_manage_staff" ON public.order_requests
  FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ============================================================
-- Trigger: auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'employee')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Trigger: keep updated_at fresh
-- ============================================================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  new.updated_at := now();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS products_touch_updated_at ON public.products;
CREATE TRIGGER products_touch_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS site_config_touch_updated_at ON public.site_config;
CREATE TRIGGER site_config_touch_updated_at
  BEFORE UPDATE ON public.site_config
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
