import { useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentSession, signOut, type Session } from '../lib/auth';
import { classNames } from '../lib/utils';
import Login from './admin/Login';
import Sidebar from './admin/Sidebar';
import Dashboard from './admin/Dashboard';
import ProductsAdmin from './admin/ProductsAdmin';
import CategoriesAdmin from './admin/CategoriesAdmin';
import BrandsAdmin from './admin/BrandsAdmin';
import PromotionsAdmin from './admin/PromotionsAdmin';
import OrdersAdmin from './admin/OrdersAdmin';
import SiteConfigAdmin from './admin/SiteConfigAdmin';

type Tab = 'dashboard' | 'products' | 'categories' | 'brands' | 'promotions' | 'orders' | 'config';

export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const s = await getCurrentSession();
      if (mounted) { setSession(s); setLoading(false); }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      (async () => {
        const s = await getCurrentSession();
        if (mounted) setSession(s);
      })();
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-ink-50 dark:bg-ink-950">
        <div className="flex items-center gap-3 text-ink-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          Cargando panel…
        </div>
      </div>
    );
  }

  if (!session) return <Login onLoggedIn={() => setLoading(true)} />;

  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Icon name="grid" /> },
    { id: 'products', label: 'Productos', icon: <Icon name="box" /> },
    { id: 'categories', label: 'Categorías', icon: <Icon name="tag" /> },
    { id: 'brands', label: 'Marcas', icon: <Icon name="star" /> },
    { id: 'promotions', label: 'Promociones', icon: <Icon name="gift" /> },
    { id: 'orders', label: 'Pedidos', icon: <Icon name="cart" /> },
    { id: 'config', label: 'Configuración', icon: <Icon name="settings" /> },
  ];

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      <Sidebar tabs={tabs} tab={tab} setTab={setTab} open={sidebarOpen} setOpen={setSidebarOpen} session={session} onSignOut={signOut} />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-200 bg-white/90 px-4 backdrop-blur dark:border-ink-800 dark:bg-ink-950/85">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-ghost !px-2 !py-2" aria-label="Abrir menú">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="font-display text-lg font-bold text-ink-900 dark:text-white">
            {tabs.find((t) => t.id === tab)?.label}
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <a href="/" target="_blank" className="btn-ghost !px-3 !py-2 text-sm">Ver sitio</a>
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-700 text-sm font-bold">
                {session.profile?.full_name?.slice(0, 1) ?? session.user.email.slice(0, 1).toUpperCase()}
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-ink-900 dark:text-white leading-tight">{session.profile?.full_name ?? session.user.email}</p>
                <p className="text-xs text-ink-500 capitalize">{session.profile?.role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {tab === 'dashboard' && <Dashboard />}
          {tab === 'products' && <ProductsAdmin session={session} />}
          {tab === 'categories' && <CategoriesAdmin session={session} />}
          {tab === 'brands' && <BrandsAdmin session={session} />}
          {tab === 'promotions' && <PromotionsAdmin session={session} />}
          {tab === 'orders' && <OrdersAdmin />}
          {tab === 'config' && <SiteConfigAdmin session={session} />}
        </main>
      </div>
    </div>
  );
}

function Icon({ name }: { name: string }) {
  const common = 'h-5 w-5';
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
    box: <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />,
    tag: <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01" />,
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    gift: <path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />,
    cart: <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></>,
  };
  return (
    <svg className={common} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}
