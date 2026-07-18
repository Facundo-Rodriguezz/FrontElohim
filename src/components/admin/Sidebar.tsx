import type { ReactNode } from 'react';
import { classNames } from '../../lib/utils';
import type { Session } from '../../lib/auth';

interface TabDef { id: string; label: string; icon: ReactNode; }
interface Props {
  tabs: TabDef[];
  tab: string;
  setTab: (t: any) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  session: Session;
  onSignOut: () => Promise<void>;
}

export default function Sidebar({ tabs, tab, setTab, open, setOpen, session, onSignOut }: Props) {
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-ink-950/60 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={classNames(
        'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-ink-200 bg-white transition-transform dark:border-ink-800 dark:bg-ink-900 lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex h-16 items-center gap-2 border-b border-ink-200 px-5 dark:border-ink-800">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-700 text-white font-bold text-sm">ED</span>
          <div>
            <p className="font-display text-sm font-bold text-ink-900 dark:text-white leading-tight">Elohim</p>
            <p className="text-xs text-ink-500">Admin Panel</p>
          </div>
          <button onClick={() => setOpen(false)} className="ml-auto lg:hidden text-ink-500" aria-label="Cerrar">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setOpen(false); }}
              className={classNames(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                tab === t.id
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                  : 'text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800'
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        <div className="absolute inset-x-0 bottom-0 border-t border-ink-200 p-3 dark:border-ink-800">
          <button
            onClick={() => onSignOut().then(() => window.location.reload())}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
