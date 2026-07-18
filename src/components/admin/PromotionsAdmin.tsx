import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Promotion } from '../../lib/supabase';
import type { Session } from '../../lib/auth';
import Modal from './Modal';

const EMPTY: Partial<Promotion> = {
  title: '', subtitle: '', image_url: '', cta_text: 'Ver más', cta_link: '/catalogo',
  badge: 'Promo', active: true, sort_order: 0, starts_at: null, ends_at: null,
};

export default function PromotionsAdmin({ session }: { session: Session }) {
  const [items, setItems] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Partial<Promotion>>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('promotions').select('*').order('sort_order').order('created_at', { ascending: false });
    setItems((data ?? []) as Promotion[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openCreate() { setDraft(EMPTY); setCreating(true); setError(null); }
  function openEdit(p: Promotion) { setEditing(p); setDraft({ ...p }); setError(null); }

  async function save() {
    setSaving(true); setError(null);
    try {
      if (!draft.title?.trim()) throw new Error('El título es obligatorio');
      const payload = { ...draft, sort_order: Number(draft.sort_order) || 0 };
      if (editing) {
        const { id, ...rest } = payload;
        const { error } = await supabase.from('promotions').update(rest).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('promotions').insert(payload);
        if (error) throw error;
      }
      setCreating(false); setEditing(null);
      load();
    } catch (e: any) { setError(e?.message ?? 'Error'); } finally { setSaving(false); }
  }

  async function remove(p: Promotion) {
    if (!confirm(`¿Eliminar la promoción "${p.title}"?`)) return;
    const { error } = await supabase.from('promotions').delete().eq('id', p.id);
    if (error) { alert(error.message); return; }
    load();
  }

  async function toggle(p: Promotion) {
    await supabase.from('promotions').update({ active: !p.active }).eq('id', p.id);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-ink-500">{items.length} promociones</p>
        <button onClick={openCreate} className="btn-primary">+ Nueva promoción</button>
      </div>

      <div className="grid gap-3">
        {loading ? <p className="card p-6 text-sm text-ink-500">Cargando…</p> : items.length === 0 ? (
          <p className="card p-6 text-sm text-ink-500">No hay promociones.</p>
        ) : items.map((p) => (
          <div key={p.id} className="card p-4 flex items-center gap-4">
            {p.image_url && <img src={p.image_url} alt="" className="h-16 w-16 rounded object-cover" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {p.badge && <span className="badge-sale">{p.badge}</span>}
                <p className="font-semibold text-ink-900 dark:text-white truncate">{p.title}</p>
              </div>
              <p className="text-sm text-ink-500 truncate">{p.subtitle}</p>
              <p className="text-xs text-ink-400 mt-1">{p.cta_link}</p>
            </div>
            <button onClick={() => toggle(p)} className={`badge ${p.active ? 'badge-stock' : 'badge-out'}`}>{p.active ? 'Activa' : 'Inactiva'}</button>
            <div className="flex gap-1">
              <button onClick={() => openEdit(p)} className="btn-ghost !px-2 !py-1.5">Editar</button>
              <button onClick={() => remove(p)} className="btn-ghost !px-2 !py-1.5 text-red-600">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {(creating || editing) && (
        <Modal open onClose={() => { setCreating(false); setEditing(null); }} title={editing ? 'Editar promoción' : 'Nueva promoción'}>
          <div className="space-y-4">
            <div>
              <label className="label">Título *</label>
              <input className="input" value={draft.title ?? ''} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Subtítulo</label>
              <input className="input" value={draft.subtitle ?? ''} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} />
            </div>
            <div>
              <label className="label">Imagen (URL)</label>
              <input className="input" value={draft.image_url ?? ''} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Texto del botón</label>
                <input className="input" value={draft.cta_text ?? ''} onChange={(e) => setDraft({ ...draft, cta_text: e.target.value })} />
              </div>
              <div>
                <label className="label">Link del botón</label>
                <input className="input" value={draft.cta_link ?? ''} onChange={(e) => setDraft({ ...draft, cta_link: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">Etiqueta (badge)</label>
                <input className="input" value={draft.badge ?? ''} onChange={(e) => setDraft({ ...draft, badge: e.target.value })} />
              </div>
              <div>
                <label className="label">Orden</label>
                <input type="number" className="input" value={draft.sort_order ?? 0} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} />
              </div>
              <label className="flex items-end gap-2 pb-2 text-sm text-ink-700 dark:text-ink-200">
                <input type="checkbox" checked={draft.active ?? true} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} className="h-4 w-4 rounded border-ink-300 text-brand-600" />
                Activa
              </label>
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</p>}
            <div className="flex justify-end gap-2 border-t border-ink-200 pt-4 dark:border-ink-800">
              <button onClick={() => { setCreating(false); setEditing(null); }} className="btn-secondary">Cancelar</button>
              <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Guardando…' : 'Guardar'}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
