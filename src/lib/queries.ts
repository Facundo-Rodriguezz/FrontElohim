import { supabase, type Category, type Brand, type SiteConfig, type Promotion } from './supabase';

export async function getSiteConfig(): Promise<SiteConfig | null> {
  const { data } = await supabase.from('site_config').select('*').eq('id', 1).maybeSingle();
  return data as SiteConfig | null;
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  return (data ?? []) as Category[];
}

export async function getBrands(): Promise<Brand[]> {
  const { data } = await supabase
    .from('brands')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true });
  return (data ?? []) as Brand[];
}

export async function getPromotions(): Promise<Promotion[]> {
  const { data } = await supabase
    .from('promotions')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });
  return (data ?? []) as Promotion[];
}

export async function getFeaturedProducts(limit = 8) {
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*), brand:brands(*), product_images(*)')
    .eq('active', true)
    .eq('featured', true)
    .order('updated_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getProductBySlug(slug: string) {
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*), brand:brands(*), product_images(*)')
    .eq('slug', slug)
    .maybeSingle();
  return data;
}

export async function getProductReviews(productId: string) {
  const { data } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('approved', true)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function getRelatedProducts(product: { category_id: string | null; id: string }, limit = 4) {
  if (!product.category_id) return [];
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*), brand:brands(*), product_images(*)')
    .eq('active', true)
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .limit(limit);
  return data ?? [];
}

export async function getAllProducts() {
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*), brand:brands(*), product_images(*)')
    .eq('active', true)
    .order('created_at', { ascending: false });
  return data ?? [];
}
