import { useEffect, useMemo, useState } from 'react';
import type { Product, Category, Brand } from '../lib/supabase';
import { formatPrice, discountPercent, classNames } from '../lib/utils';

interface Props {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  initialCategorySlug?: string;
  initialSearch?: string;
}

type SortKey = 'relevance' | 'price-asc' | 'price-desc' | 'name' | 'newest';
type View = 'grid' | 'list';

const PAGE_SIZE = 12;

export default function CatalogBrowser({ products, categories, brands, initialCategorySlug, initialSearch }: Props) {
  const [search, setSearch] = useState(initialSearch ?? '');
  const [categorySlug, setCategorySlug] = useState<string | null>(initialCategorySlug ?? null);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [onlyStock, setOnlyStock] = useState(false);
  const [sort, setSort] = useState<SortKey>('relevance');
  const [view, setView] = useState<View>('grid');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [search, categorySlug, brandId, onlyOffers, onlyNew, onlyStock, sort]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = products.filter((p) => {
      if (q) {
        const hay = (p.name + ' ' + (p.description ?? '') + ' ' + (p.sku ?? '') + ' ' + (p.category?.name ?? '') + ' ' + (p.brand?.name ?? '')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (categorySlug && p.category?.slug !== categorySlug) return false;
      if (brandId && p.brand_id !== brandId) return false;
      if (onlyOffers && !(p.badges.includes('oferta') || (p.compare_price && p.compare_price > p.price))) return false;
      if (onlyNew && !p.badges.includes('nuevo')) return false;
      if (onlyStock && p.stock <= 0) return false;
      return true;
    });
    list = [...list];
    switch (sort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'name': list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'newest': list.sort((a, b) => b.created_at.localeCompare(a.created_at)); break;
      default:
        list.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);
    }
    return list;
  }, [products, search, categorySlug, brandId, onlyOffers, onlyNew, onlyStock, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCat = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      {/* Filters */}
      <aside className="hidden lg:block sticky top-24 self-start">
        <div className="card p-5 space-y-6">
          <div>
            <p className="text-sm font-semibold text-ink-900 dark:text-white mb-2">Categorías</p>
            <ul className="space-y-1">
              <li>
                <button onClick={() => setCategorySlug(null)} className={classNames('w-full text-left rounded-md px-2.5 py-1.5 text-sm', !categorySlug ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800')}>
                  Todas
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <button onClick={() => setCategorySlug(c.slug)} className={classNames('w-full text-left rounded-md px-2.5 py-1.5 text-sm', categorySlug === c.slug ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800')}>
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink-900 dark:text-white mb-2">Marcas</p>
            <ul className="space-y-1">
              <li>
                <button onClick={() => setBrandId(null)} className={classNames('w-full text-left rounded-md px-2.5 py-1.5 text-sm', !brandId ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800')}>
                  Todas
                </button>
              </li>
              {brands.map((b) => (
                <li key={b.id}>
                  <button onClick={() => setBrandId(b.id)} className={classNames('w-full text-left rounded-md px-2.5 py-1.5 text-sm', brandId === b.id ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800')}>
                    {b.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink-900 dark:text-white mb-2">Filtros</p>
            <div className="space-y-2">
              <CheckRow label="En oferta" checked={onlyOffers} onChange={setOnlyOffers} />
              <CheckRow label="Nuevos" checked={onlyNew} onChange={setOnlyNew} />
              <CheckRow label="Con stock" checked={onlyStock} onChange={setOnlyStock} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div>
        {/* Toolbar */}
        <div className="card mb-5 flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.3-4.3M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/></svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos, categorías, marcas..."
              aria-label="Buscar"
              className="input !pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Ordenar" className="input !w-auto">
              <option value="relevance">Relevancia</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="name">Nombre</option>
              <option value="newest">Más nuevos</option>
            </select>
            <div className="hidden sm:flex rounded-lg border border-ink-200 dark:border-ink-700 overflow-hidden">
              <button onClick={() => setView('grid')} aria-label="Vista grilla" className={classNames('p-2.5', view === 'grid' ? 'bg-brand-600 text-white' : 'bg-white text-ink-600 dark:bg-ink-900 dark:text-ink-300')}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg>
              </button>
              <button onClick={() => setView('list')} aria-label="Vista lista" className={classNames('p-2.5', view === 'list' ? 'bg-brand-600 text-white' : 'bg-white text-ink-600 dark:bg-ink-900 dark:text-ink-300')}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile filter chips */}
        <div className="lg:hidden mb-4 flex gap-2 overflow-x-auto pb-2">
          <Chip active={!categorySlug} onClick={() => setCategorySlug(null)}>Todas</Chip>
          {categories.map((c) => (
            <Chip key={c.id} active={categorySlug === c.slug} onClick={() => setCategorySlug(c.slug)}>{c.name}</Chip>
          ))}
        </div>

        <p className="mb-4 text-sm text-ink-500 dark:text-ink-400">
          {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
          {activeCat && <> en <span className="font-semibold text-brand-700 dark:text-brand-300">{activeCat.name}</span></>}
        </p>

        {pageItems.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-ink-500">No se encontraron productos con esos filtros.</p>
            <button onClick={() => { setSearch(''); setCategorySlug(null); setBrandId(null); setOnlyOffers(false); setOnlyNew(false); setOnlyStock(false); }} className="btn-outline mt-4">
              Limpiar filtros
            </button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {pageItems.map((p) => <GridCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {pageItems.map((p) => <ListCard key={p.id} product={p} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-1">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn-ghost !px-3" aria-label="Anterior">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)} className={classNames('rounded-md px-3 py-1.5 text-sm font-medium', n === page ? 'bg-brand-600 text-white' : 'text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800')}>
                {n}
              </button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="btn-ghost !px-3" aria-label="Siguiente">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-200 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
      {label}
    </label>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={classNames('chip whitespace-nowrap', active && 'chip-active')}>{children}</button>
  );
}

function GridCard({ product }: { product: Product }) {
  const img = product.product_images?.[0]?.url ?? '/images/bandejas-termicas.jpg';
  const alt = product.product_images?.[0]?.alt ?? product.name;
  const discount = discountPercent(product.price, product.compare_price);
  const out = product.stock <= 0;
  return (
    <a href={`/producto/${product.slug}`} className="card group block overflow-hidden transition-all hover:-translate-y-1 hover:shadow-card-hover">
      <div className="relative aspect-square overflow-hidden bg-ink-100 dark:bg-ink-800">
        <img src={img} alt={alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          {product.badges.includes('nuevo') && <span className="badge-new">Nuevo</span>}
          {discount > 0 && <span className="badge-sale">-{discount}%</span>}
        </div>
        {out && <div className="absolute inset-0 grid place-items-center bg-white/60 dark:bg-ink-950/60"><span className="badge-out !text-sm !px-3">Sin stock</span></div>}
      </div>
      <div className="p-4">
        {product.category?.name && <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{product.category.name}</p>}
        <h3 className="mt-1 line-clamp-2 font-semibold text-ink-900 group-hover:text-brand-700 dark:text-white" title={product.name}>{product.name}</h3>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-brand-700 dark:text-brand-300">{formatPrice(product.price)}</span>
          {product.compare_price && product.compare_price > product.price && <span className="text-sm text-ink-400 line-through">{formatPrice(product.compare_price)}</span>}
        </div>
      </div>
    </a>
  );
}

function ListCard({ product }: { product: Product }) {
  const img = product.product_images?.[0]?.url ?? '/images/bandejas-termicas.jpg';
  const discount = discountPercent(product.price, product.compare_price);
  const out = product.stock <= 0;
  return (
    <a href={`/producto/${product.slug}`} className="card group flex gap-4 overflow-hidden p-3 transition hover:shadow-card-hover">
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-ink-100 dark:bg-ink-800">
        <img src={img} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
        {discount > 0 && <span className="badge-sale absolute left-1 top-1">-{discount}%</span>}
      </div>
      <div className="flex flex-1 flex-col">
        {product.category?.name && <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{product.category.name}</p>}
        <h3 className="font-semibold text-ink-900 group-hover:text-brand-700 dark:text-white">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-500 dark:text-ink-400">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-brand-700 dark:text-brand-300">{formatPrice(product.price)}</span>
            {product.compare_price && product.compare_price > product.price && <span className="text-sm text-ink-400 line-through">{formatPrice(product.compare_price)}</span>}
          </div>
          <span className={classNames('text-xs', out ? 'text-ink-400' : 'text-emerald-600 dark:text-emerald-400')}>{out ? 'Sin stock' : 'En stock'}</span>
        </div>
      </div>
    </a>
  );
}
