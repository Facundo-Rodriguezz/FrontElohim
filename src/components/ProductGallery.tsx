import { useState } from 'react';
import { classNames } from '../lib/utils';

interface Props {
  images: { id: string; url: string; alt: string | null }[];
  name: string;
}

export default function ProductGallery({ images, name }: Props) {
  const list = images.length > 0 ? images : [{ id: 'fallback', url: '/images/bandejas-termicas.jpg', alt: name }];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  const current = list[active];

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ x, y });
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative aspect-square overflow-hidden rounded-2xl bg-ink-100 dark:bg-ink-800"
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(null)}
      >
        <img
          src={current.url}
          alt={current.alt ?? name}
          className="h-full w-full object-cover transition-transform duration-200"
          style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%`, transform: 'scale(2)' } : undefined}
        />
        {list.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink-900/70 px-3 py-1 text-xs text-white">
            {active + 1} / {list.length}
          </div>
        )}
      </div>
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {list.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={classNames(
                'h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition',
                i === active ? 'border-brand-600' : 'border-transparent opacity-70 hover:opacity-100'
              )}
            >
              <img src={img.url} alt={img.alt ?? name} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
