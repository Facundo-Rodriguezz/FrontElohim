import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Category } from '../../lib/supabase';
import type { Session } from '../../lib/auth';
import { slugify } from '../../lib/utils';
import Modal from './Modal';

const EMPTY: Partial<Category> = { name: '', slug: '', description: '', icon: '', sort_order: 0, active: true };

export default function CategoriesAdmin({ session }: { session: Session }) {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Partial<Category>>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('sort_order').order('name');
    setItems((data ?? []) as Category[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openCreate() { setDraft(EMPTY); setCreating(true); setError(null); }
  function openEdit(c: Category) { setEditing(c); setDraft({ ...c }); setError(null); }

  async function save() {
    setSaving(true); setError(null);
    try {
      if (!draft.name?.trim()) throw new Error('El nombre es obligatorio');
      const payload = { ...draft, slug: draft.slug || slugify(draft.name), sort_order: Number(draft.sort_order) || 0 };
      if (editing) {
        const { id, ...rest } = payload;
        const { error } = await supabase.from('categories').update(rest).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert(payload);
        if (error) throw error;
      }
      setCreating(false); setEditing(null);
      load();
    } catch (e: any) { setError(e?.message ?? 'Error'); } finally { setSaving(false); }
  }

  async function remove(c: Category) {
    if (!confirm(`¿Eliminar la categoría "${c.name}"?`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', c.id);
    if (error) { alert(error.message); return; }
    load();
  }

  async function toggle(c: Category) {
    await supabase.from('categories').update({ active: !c.active }).eq('id', c.id);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-ink-500">{items.length} categorías</p>
        <button onClick={openCreate} className="btn-primary">+ Nueva categoría</button>
      </div>

      <div className="card overflow-hidden">
        {loading ? <p className="p-6 text-sm text-ink-500">Cargando…</p> : items.length === 0 ? (
          <p className="p-6 text-sm text-ink-500">No hay categorías.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase text-ink-500 dark:bg-ink-800/50">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Orden</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {items.map((c) => (
                <tr key={c.id} className="hover:bg-ink-50 dark:hover:bg-ink-800/30">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900 dark:text-white">{c.name}</p>
                    <p className="text-xs text-ink-500">/{c.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{c.sort_order}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(c)} className={`badge ${c.active ? 'badge-stock' : 'badge-out'}`}>{c.active ? 'Activa' : 'Inactiva'}</button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(c)} className="btn-ghost !px-2 !py-1.5">Editar</button>
                    <button onClick={() => remove(c)} className="btn-ghost !px-2 !py-1.5 text-red-600">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(creating || editing) && (
        <Modal open onClose={() => { setCreating(false); setEditing(null); }} title={editing ? 'Editar categoría' : 'Nueva categoría'}>
          <div className="space-y-4">
            <div>
              <label className="label">Nombre *</label>
              <input className="input" value={draft.name ?? ''} onChange={(e) => { setDraft({ ...draft, name: e.target.value, slug: editing ? draft.slug : slugify(e.target.value) }); }} />
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
              <label className="label">Ícono (texto libre)</label>
              <input className="input" value={draft.icon ?? ''} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} placeholder="cup, bag, tray..." />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
