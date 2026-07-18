import { useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { classNames } from '../../lib/utils';

interface Props {
  productId: string;
  images: { id: string; url: string; alt: string | null; sort_order: number }[];
  onChange: () => void;
}

export default function ImageUploader({ productId, images, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop() ?? 'jpg';
        const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage.from('product-images').upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
        const nextOrder = (images?.reduce((m, i) => Math.max(m, i.sort_order), -1) ?? -1) + 1;
        const { error: insErr } = await supabase.from('product_images').insert({
          product_id: productId,
          url: pub.publicUrl,
          alt: file.name.replace(/\.[^.]+$/, ''),
          sort_order: nextOrder,
        });
        if (insErr) throw insErr;
      }
      onChange();
      if (fileRef.current) fileRef.current.value = '';
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo subir la imagen. Verificá que el bucket "product-images" exista.');
    } finally {
      setUploading(false);
    }
  }

  async function addByUrl() {
    if (!urlInput.trim()) return;
    const nextOrder = (images?.reduce((m, i) => Math.max(m, i.sort_order), -1) ?? -1) + 1;
    const { error } = await supabase.from('product_images').insert({
      product_id: productId,
      url: urlInput.trim(),
      alt: 'Imagen',
      sort_order: nextOrder,
    });
    if (error) { setError(error.message); return; }
    setUrlInput('');
    onChange();
  }

  async function remove(id: string) {
    const { error } = await supabase.from('product_images').delete().eq('id', id);
    if (!error) onChange();
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); uploadFiles(e.dataTransfer.files); }}
        className="rounded-xl border-2 border-dashed border-ink-300 p-6 text-center dark:border-ink-700"
      >
        <p className="text-sm text-ink-600 dark:text-ink-300">Arrastrá imágenes acá o</p>
        <button type="button" onClick={() => fileRef.current?.click()} className="btn-outline mt-2" disabled={uploading}>
          {uploading ? 'Subiendo…' : 'Elegir archivos'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => uploadFiles(e.target.files)} />
      </div>

      <div className="flex gap-2">
        <input className="input" placeholder="O pegá una URL de imagen" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
        <button type="button" onClick={addByUrl} className="btn-secondary shrink-0">Agregar URL</button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {(images ?? []).sort((a, b) => a.sort_order - b.sort_order).map((img) => (
          <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-ink-200 dark:border-ink-700">
            <img src={img.url} alt={img.alt ?? ''} className="h-full w-full object-cover" />
            <button type="button" onClick={() => remove(img.id)} className="absolute inset-0 hidden items-center justify-center bg-ink-950/60 text-white group-hover:flex" aria-label="Eliminar">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.87 12.14A2 2 0 0116.13 21H7.87a2 2 0 01-1.99-1.86L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
            </button>
          </div>
        ))}
        {(!images || images.length === 0) && (
          <p className="col-span-full text-sm text-ink-500">Sin imágenes todavía.</p>
        )}
      </div>
    </div>
  );
}
