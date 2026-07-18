import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Product, Category, Brand } from '../../lib/supabase';
import type { Session } from '../../lib/auth';
import { formatPrice, discountPercent, slugify, classNames } from '../../lib/utils';
import Modal from './Modal';
import ImageUploader from './ImageUploader';

interface Props { session: Session; }

type Draft = Partial<Product> & { badges?: string[] };

const EMPTY: Draft = {
  name: '', slug: '', description: '', features: '', sku: '', price: 0, compare_price: null,
  stock: 0, unit: 'pack', category_id: null, brand_id: null, badges: [], featured: false, active: true,
};

export default function ProductsAdmin({ session }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = session.profile?.role === 'admin';

  async function load() {
    setLoading(true);
    const [p, c, b] = await Promise.all([
      supabase.from('products').select('*, category:categories(*), brand:brands(*), product_images(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
      supabase.from('brands').select('*').order('name'),
    ]);
    setProducts((p.data ?? []) as Product[]);
    setCategories((c.data ?? []) as Category[]);
    setBrands((b.data ?? []) as Brand[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => (p.name + ' ' + (p.sku ?? '') + ' ' + (p.category?.name ?? '')).toLowerCase().includes(q));
  }, [products, search]);

  function openCreate() { setDraft(EMPTY); setCreating(true); setError(null); }
  function openEdit(p: Product) { setEditing(p); setDraft({ ...p, badges: p.badges ?? [] }); setError(null); }

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload: Draft = { ...draft };
      if (!payload.name?.trim()) throw new Error('El nombre es obligatorio');
      if (!payload.slug) payload.slug = slugify(payload.name);
      payload.price = Number(payload.price) || 0;
      payload.compare_price = payload.compare_price ? Number(payload.compare_price) : null;
      payload.stock = Number(payload.stock) || 0;

      if (editing) {
        const { id, ...rest } = payload;
        const { error } = await supabase.from('products').update(rest).eq('id', editing.id);
        if (error) throw error;
        setEditing(null);
      } else {
        const { data, error } = await supabase.from('products').insert(payload).select().maybeSingle();
        if (error) throw error;
        if (data) setEditing(data as Product);
        setCreating(false);
        setEditing(data as Product);
      }
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }

  async function toggle(p: Product, field: 'active' | 'featured') {
    const { error } = await supabase.from('products').update({ [field]: !p[field] }).eq('id', p.id);
    if (!error) load();
  }

  async function remove(p: Product) {
    if (!confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`)) return;
    const { error } = await supabase.from('products').delete().eq('id', p.id);
    if (error) { alert(error.message); return; }
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.3-4.3M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" /></svg>
          <input className="input !pl-9" placeholder="Buscar productos…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button onClick={openCreate} className="btn-primary">+ Nuevo producto</button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-ink-500">Cargando…</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-ink-500">No hay productos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500 dark:bg-ink-800/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Producto</th>
                  <th className="px-4 py-3 font-medium">Categoría</th>
                  <th className="px-4 py-3 font-medium">Precio</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-ink-50 dark:hover:bg-ink-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.product_images?.[0]?.url ?? '/images/bandejas-termicas.jpg'} alt="" className="h-10 w-10 rounded object-cover" />
                        <div>
                          <p className="font-medium text-ink-900 dark:text-white">{p.name}</p>
                          <p className="text-xs text-ink-500">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{p.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 font-medium text-ink-900 dark:text-white">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={classNames('badge', p.stock === 0 ? 'badge-out' : p.stock <= 10 ? 'badge-sale' : 'badge-stock')}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <button onClick={() => toggle(p, 'active')} className={classNames('badge', p.active ? 'badge-stock' : 'badge-out')}>{p.active ? 'Activo' : 'Inactivo'}</button>
                        {p.featured && <span className="badge-feat">Destacado</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => openEdit(p)} className="btn-ghost !px-2 !py-1.5" aria-label="Editar">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.41-9.59a2 2 0 112.83 2.83L11.83 15H9v-2.83l8.59-8.59z" /></svg>
                        </button>
                        <button onClick={() => remove(p)} className="btn-ghost !px-2 !py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" aria-label="Eliminar">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.87 12.14A2 2 0 0116.13 21H7.87a2 2 0 01-1.99-1.86L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(creating || editing) && (
        <Modal open onClose={() => { setCreating(false); setEditing(null); }} title={editing ? `Editar: ${editing.name}` : 'Nuevo producto'} size="lg">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Nombre *</label>
                <input className="input" value={draft.name ?? ''} onChange={(e) => { update('name', e.target.value); if (!editing) update('slug', slugify(e.target.value)); }} />
              </div>
              <div>
                <label className="label">Slug</label>
                <input className="input" value={draft.slug ?? ''} onChange={(e) => update('slug', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Descripción</label>
              <textarea className="input" rows={3} value={draft.description ?? ''} onChange={(e) => update('description', e.target.value)} />
            </div>

            <div>
              <label className="label">Características (separadas por |)</label>
              <input className="input" value={draft.features ?? ''} onChange={(e) => update('features', e.target.value)} placeholder="Material: cartón|Pack: 25 unidades|..." />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">Precio *</label>
                <input type="number" className="input" value={draft.price ?? 0} onChange={(e) => update('price', Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Precio anterior</label>
                <input type="number" className="input" value={draft.compare_price ?? ''} onChange={(e) => update('compare_price', e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div>
                <label className="label">Stock</label>
                <input type="number" className="input" value={draft.stock ?? 0} onChange={(e) => update('stock', Number(e.target.value))} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">SKU</label>
                <input className="input" value={draft.sku ?? ''} onChange={(e) => update('sku', e.target.value)} />
              </div>
              <div>
                <label className="label">Categoría</label>
                <select className="input" value={draft.category_id ?? ''} onChange={(e) => update('category_id', e.target.value || null)}>
                  <option value="">— Sin categoría —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Marca</label>
                <select className="input" value={draft.brand_id ?? ''} onChange={(e) => update('brand_id', e.target.value || null)}>
                  <option value="">— Sin marca —</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Etiquetas (separadas por coma)</label>
              <input className="input" value={(draft.badges ?? []).join(', ')} onChange={(e) => update('badges', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} placeholder="nuevo, oferta, destacado" />
              <p className="text-xs text-ink-500 mt-1">Valores sugeridos: nuevo, oferta, destacado</p>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-200">
                <input type="checkbox" checked={draft.featured ?? false} onChange={(e) => update('featured', e.target.checked)} className="h-4 w-4 rounded border-ink-300 text-brand-600" />
                Producto destacado
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-200">
                <input type="checkbox" checked={draft.active ?? true} onChange={(e) => update('active', e.target.checked)} className="h-4 w-4 rounded border-ink-300 text-brand-600" />
                Activo (visible en el sitio)
              </label>
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</p>}

            <div className="flex justify-end gap-2 border-t border-ink-200 pt-4 dark:border-ink-800">
              <button onClick={() => { setCreating(false); setEditing(null); }} className="btn-secondary">Cancelar</button>
              <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Guardando…' : 'Guardar'}</button>
            </div>

            {editing && (
              <div className="border-t border-ink-200 pt-4 dark:border-ink-800">
                <h4 className="font-semibold text-ink-900 dark:text-white mb-3">Imágenes del producto</h4>
                <ImageUploader productId={editing.id} images={editing.product_images ?? []} onChange={load} />
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
