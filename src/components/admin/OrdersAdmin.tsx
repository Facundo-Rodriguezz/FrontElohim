import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { OrderRequest } from '../../lib/supabase';
import { formatDate, whatsappUrl } from '../../lib/utils';
import Modal from './Modal';

const STATUS: Record<string, string> = { nuevo: 'Nuevo', en_proceso: 'En proceso', completado: 'Completado', cancelado: 'Cancelado' };
const STATUS_CLASS: Record<string, string> = {
  nuevo: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  en_proceso: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300',
  completado: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  cancelado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export default function OrdersAdmin() {
  const [items, setItems] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [viewing, setViewing] = useState<OrderRequest | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('order_requests').select('*').order('created_at', { ascending: false });
    setItems((data ?? []) as OrderRequest[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(o: OrderRequest, status: OrderRequest['status']) {
    await supabase.from('order_requests').update({ status }).eq('id', o.id);
    setViewing(null);
    load();
  }

  const filtered = filter === 'all' ? items : items.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', 'nuevo', 'en_proceso', 'completado', 'cancelado'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`chip whitespace-nowrap ${filter === f ? 'chip-active' : ''}`}>
            {f === 'all' ? 'Todos' : STATUS[f]} {f !== 'all' && `(${items.filter((o) => o.status === f).length})`}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? <p className="p-6 text-sm text-ink-500">Cargando…</p> : filtered.length === 0 ? (
          <p className="p-6 text-sm text-ink-500">No hay pedidos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-left text-xs uppercase text-ink-500 dark:bg-ink-800/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Teléfono</th>
                  <th className="px-4 py-3 font-medium">Pedido</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-ink-50 dark:hover:bg-ink-800/30">
                    <td className="px-4 py-3 font-medium text-ink-900 dark:text-white">{o.nombre}</td>
                    <td className="px-4 py-3 text-ink-600">{o.telefono}</td>
                    <td className="px-4 py-3 text-ink-600 max-w-xs truncate">{o.pedido}</td>
                    <td className="px-4 py-3"><span className={`badge ${STATUS_CLASS[o.status]}`}>{STATUS[o.status]}</span></td>
                    <td className="px-4 py-3 text-ink-500">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setViewing(o)} className="btn-ghost !px-2 !py-1.5">Ver</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewing && (
        <Modal open onClose={() => setViewing(null)} title={`Pedido de ${viewing.nombre}`} size="lg">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <Field label="Teléfono" value={viewing.telefono} />
              <Field label="Fecha" value={formatDate(viewing.created_at)} />
              <Field label="Dirección" value={[viewing.calle, viewing.numeracion, viewing.piso && `Piso ${viewing.piso}`, viewing.departamento && `Dpto ${viewing.departamento}`].filter(Boolean).join(' ') || '—'} />
              <Field label="Localidad" value={[viewing.localidad, viewing.provincia].filter(Boolean).join(', ') || '—'} />
            </div>
            <div>
              <p className="label">Detalle del pedido</p>
              <p className="rounded-lg bg-ink-50 p-3 text-sm dark:bg-ink-800/50">{viewing.pedido}</p>
            </div>
            <div>
              <p className="label">Cambiar estado</p>
              <div className="flex flex-wrap gap-2">
                {(['nuevo', 'en_proceso', 'completado', 'cancelado'] as const).map((s) => (
                  <button key={s} onClick={() => setStatus(viewing, s)} className={`chip ${viewing.status === s ? 'chip-active' : ''}`}>{STATUS[s]}</button>
                ))}
              </div>
            </div>
            <a href={whatsappUrl(viewing.telefono, `Hola ${viewing.nombre}, te contactamos por tu pedido en Elohim Descartables:`)} target="_blank" rel="noopener" className="btn-primary w-full">
              Contactar por WhatsApp
            </a>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase text-ink-400">{label}</p>
      <p className="text-ink-900 dark:text-white">{value}</p>
    </div>
  );
}
