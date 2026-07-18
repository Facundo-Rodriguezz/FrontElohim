import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface Props {
  productId: string;
}

export default function ReviewForm({ productId }: Props) {
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) return;
    setStatus('loading');
    const { error } = await supabase.from('product_reviews').insert({
      product_id: productId,
      author: author.trim(),
      rating,
      comment: comment.trim(),
      approved: false,
    });
    if (error) setStatus('error');
    else {
      setStatus('ok');
      setAuthor('');
      setComment('');
      setRating(5);
    }
  }

  if (status === 'ok') {
    return (
      <div className="card p-6 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <p className="font-semibold text-ink-900 dark:text-white">¡Gracias por tu opinión!</p>
        <p className="text-sm text-ink-500 mt-1">Tu reseña será visible después de ser aprobada.</p>
        <button onClick={() => setStatus('idle')} className="btn-outline mt-4">Escribir otra</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-6 space-y-4">
      <h3 className="font-semibold text-ink-900 dark:text-white">Dejá tu opinión</h3>
      <div>
        <label className="label" htmlFor="r-author">Nombre *</label>
        <input id="r-author" className="input" value={author} onChange={(e) => setAuthor(e.target.value)} required />
      </div>
      <div>
        <span className="label">Calificación</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} estrellas`} className="text-2xl transition">
              <span className={n <= rating ? 'text-accent-500' : 'text-ink-300'}>★</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="r-comment">Comentario *</label>
        <textarea id="r-comment" className="input" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} required />
      </div>
      {status === 'error' && <p className="text-sm text-red-600">No se pudo enviar. Intentá de nuevo.</p>}
      <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
        {status === 'loading' ? 'Enviando…' : 'Enviar opinión'}
      </button>
    </form>
  );
}
