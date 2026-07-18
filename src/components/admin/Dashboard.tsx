import { useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../../lib/supabase';
import { formatPrice, formatDate } from '../../lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    brands: 0,
    outOfStock: 0,
    featured: 0,
    orders: 0,
    newOrders: 0,
  });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [p, c, b, o, fe, ords] = await Promise.all([
        supabase.from('products').select('id, stock, featured', { count: 'exact', head: false }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('brands').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('id').eq('stock', 0),
        supabase.from('products').select('id').eq('featured', true),
        supabase.from('order_requests').select('*').order('created_at', { ascending: false }).limit(5),
      ]);
      const products = (p.data ?? []) as any[];
      setStats({
        products: products.length,
        categories: c.count ?? 0,
        brands: b.count ?? 0,
        outOfStock: products.filter((x) => x.stock === 0).length,
        featured: products.filter((x) => x.featured).length,
        orders: ords.data?.length ?? 0,
        newOrders: (ords.data ?? []).filter((x) => x.status === 'nuevo').length,
      });
      setRecent((ords.data ?? []) as any[]);
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: 'Productos', value: stats.products, color: 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300', icon: 'box' },
    { label: 'Categorías', value: stats.categories, color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: 'tag' },
    { label: 'Marcas', value: stats.brands, color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', icon: 'star' },
    { label: 'Sin stock', value: stats.outOfStock, color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: 'alert' },
    { label: 'Destacados', value: stats.featured, color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', icon: 'check' },
    { label: 'Pedidos nuevos', value: stats.newOrders, color: 'bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300', icon: 'cart' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-500">{c.label}</p>
                <p className="mt-1 text-3xl font-bold text-ink-900 dark:text-white">{loading ? '–' : c.value}</p>
              </div>
              <div className={`grid h-12 w-12 place-items-center rounded-xl ${c.color}`}>
                <Icon name={c.icon} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-ink-900 dark:text-white mb-4">Pedidos recientes</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-ink-500">Aún no hay pedidos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200 text-left text-xs uppercase tracking-wide text-ink-500 dark:border-ink-800">
                  <th className="pb-2 pr-4 font-medium">Cliente</th>
                  <th className="pb-2 pr-4 font-medium">Teléfono</th>
                  <th className="pb-2 pr-4 font-medium">Pedido</th>
                  <th className="pb-2 pr-4 font-medium">Estado</th>
                  <th className="pb-2 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-b border-ink-100 dark:border-ink-800">
                    <td className="py-3 pr-4 font-medium text-ink-900 dark:text-white">{o.nombre}</td>
                    <td className="py-3 pr-4 text-ink-600 dark:text-ink-300">{o.telefono}</td>
                    <td className="py-3 pr-4 text-ink-600 dark:text-ink-300 max-w-xs truncate">{o.pedido}</td>
                    <td className="py-3 pr-4"><StatusPill status={o.status} /></td>
                    <td className="py-3 text-ink-500">{formatDate(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-ink-900 dark:text-white mb-4">Stock bajo</h2>
        <LowStockList />
      </div>
    </div>
  );
}

function LowStockList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('products').select('name, slug, stock, price').lte('stock', 10).order('stock', { ascending: true }).limit(8);
      setItems((data ?? []) as any[]);
      setLoading(false);
    })();
  }, []);
  if (loading) return <p className="text-sm text-ink-500">Cargando…</p>;
  if (items.length === 0) return <p className="text-sm text-ink-500">Todos los productos tienen buen stock.</p>;
  return (
    <ul className="divide-y divide-ink-100 dark:divide-ink-800">
      {items.map((it) => (
        <li key={it.slug} className="flex items-center justify-between py-3">
          <a href={`/producto/${it.slug}`} target="_blank" className="font-medium text-ink-900 dark:text-white hover:text-brand-700">{it.name}</a>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink-500">{formatPrice(it.price)}</span>
            <span className={it.stock === 0 ? 'badge-out' : 'badge-sale'}>{it.stock} u.</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    nuevo: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    en_proceso: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300',
    completado: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    cancelado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };
  const labels: Record<string, string> = { nuevo: 'Nuevo', en_proceso: 'En proceso', completado: 'Completado', cancelado: 'Cancelado' };
  return <span className={`badge ${map[status]}`}>{labels[status]}</span>;
}

function Icon({ name }: { name: string }) {
  const common = 'h-6 w-6';
  const paths: Record<string, ReactNode> = {
    box: <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />,
    tag: <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01" />,
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    alert: <><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></>,
    check: <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    cart: <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" /></>,
  };
  return (
    <svg className={common} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}
