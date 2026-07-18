import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'employee';
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  active: boolean;
  created_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  features: string | null;
  sku: string | null;
  price: number;
  compare_price: number | null;
  stock: number;
  unit: string | null;
  category_id: string | null;
  brand_id: string | null;
  badges: string[];
  featured: boolean;
  active: boolean;
  rating: number;
  reviews_count: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  brand?: Brand | null;
  product_images?: ProductImage[];
};

export type ProductReview = {
  id: string;
  product_id: string;
  author: string;
  rating: number;
  comment: string | null;
  approved: boolean;
  created_at: string;
};

export type Promotion = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  badge: string | null;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
};

export type SiteConfig = {
  id: number;
  company_name: string;
  logo_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  instagram: string | null;
  facebook: string | null;
  hours: string | null;
  primary_color: string;
  accent_color: string;
  hero_title: string;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  promo_title: string | null;
  promo_subtitle: string | null;
  promo_image_url: string | null;
  promo_cta_text: string | null;
  promo_cta_link: string | null;
  footer_text: string | null;
  newsletter_title: string;
  free_shipping_threshold: string | null;
  updated_at: string;
};

export type OrderRequest = {
  id: string;
  nombre: string;
  telefono: string;
  calle: string | null;
  numeracion: string | null;
  piso: string | null;
  departamento: string | null;
  localidad: string | null;
  provincia: string | null;
  pedido: string;
  status: 'nuevo' | 'en_proceso' | 'completado' | 'cancelado';
  created_at: string;
};
