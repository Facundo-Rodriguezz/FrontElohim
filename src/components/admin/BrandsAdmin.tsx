import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Brand } from '../../lib/supabase';
import type { Session } from '../../lib/auth';
import { slugify } from '../../lib/utils';
import Modal from './Modal';

const EMPTY: Partial<Brand> = { name: '', slug: '', description: '', logo_url: '', active: true };

export default function BrandsAdmin({ session }: { session: Session }) {
  const [items, setItems] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Partial<Brand>>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('brands').select('*').order('name');
    setItems((data ?? []) as Brand[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openCreate() { setDraft(EMPTY); setCreating(true); setError(null); }
  function openEdit(b: Brand) { setEditing(b); setDraft({ ...b }); setError(null); }

  async function save() {
    setSaving(true); setError(null);
    try {
      if (!draft.name?.trim()) throw new Error('El nombre es obligatorio');
      const payload = { ...draft, slug: draft.slug || slugify(draft.name) };
      if (editing) {
        const { id, ...rest } = payload;
        const { error } = await supabase.from('brands').update(rest).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('brands').insert(payload);
        if (error) throw error;
      }
      setCreating(false); setEditing(null);
      load();
    } catch (e: any) { setError(e?.message ?? 'Error'); } finally { setSaving(false); }
  }

  async function remove(b: Brand) {
    if (!confirm(`¿Eliminar la marca "${b.name}"?`)) return;
    const { error } = await supabase.from('brands').delete().eq('id', b.id);
    if (error) { alert(error.message); return; }
    load();
  }

  async function toggle(b: Brand) {
    await supabase.from('brands').update({ active: !b.active }).eq('id', b.id);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-ink-500">{items.length} marcas</p>
        <button onClick={openCreate} className="btn-primary">+ Nueva marca</button>
      </div>

      <div className="card overflow-hidden">
        {loading ? <p className="p-6 text-sm text-ink-500">Cargando…</p> : items.length === 0 ? (
          <p className="p-6 text-sm text-ink-500">No hay marcas.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase text-ink-500 dark:bg-ink-800/50">
              <tr>
                <th className="px-4 py-3 font-medium">Marca</th>
                <th className="px-4 py-3 font-medium">Logo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {items.map((b) => (
                <tr key={b.id} className="hover:bg-ink-50 dark:hover:bg-ink-800/30">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900 dark:text-white">{b.name}</p>
                    <p className="text-xs text-ink-500">{b.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    {b.logo_url ? <img src={b.logo_url} alt={b.name} className="h-8 w-8 rounded object-cover" /> : <span className="text-ink-400 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(b)} className={`badge ${b.active ? 'badge-stock' : 'badge-out'}`}>{b.active ? 'Activa' : 'Inactiva'}</button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(b)} className="btn-ghost !px-2 !py-1.5">Editar</button>
                    <button onClick={() => remove(b)} className="btn-ghost !px-2 !py-1.5 text-red-600">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(creating || editing) && (
        <Modal open onClose={() => { setCreating(false); setEditing(null); }} title={editing ? 'Editar marca' : 'Nueva marca'}>
          <div className="space-y-4">
            <div>
              <label className="label">Nombre *</label>
              <input className="input" value={draft.name ?? ''} onChange={(e) => setDraft({ ...draft, name: e.target.value, slug: editing ? draft.slug : slugify(e.target.value) })} />
            </div>
            <div>
              <label className="label">Slug</label>
              <input className="input" value={draft.slug ?? ''} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
            </div>
            <div>
              <label className="label">Descripción</label>
              <textarea className="input" rows={2} value={draft.description ?? ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </div>
            <div>
              <label className="label">URL del logo</label>
              <input className="input" value={draft.logo_url ?? ''} onChange={(e) => setDraft({ ...draft, logo_url: e.target.value })} placeholder="https://..." />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-200">
              <input type="checkbox" checked={draft.active ?? true} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} className="h-4 w-4 rounded border-ink-300 text-brand-600" />
              Activa
            </label>
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
