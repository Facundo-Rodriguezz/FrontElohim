import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { SiteConfig } from '../../lib/supabase';
import type { Session } from '../../lib/auth';

export default function SiteConfigAdmin({ session }: { session: Session }) {
  const [cfg, setCfg] = useState<SiteConfig | null>(null);
  const [draft, setDraft] = useState<Partial<SiteConfig>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_config').select('*').eq('id', 1).maybeSingle();
      if (data) { setCfg(data as SiteConfig); setDraft(data as SiteConfig); }
    })();
  }, []);

  function update<K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    const { error } = await supabase.from('site_config').update(draft).eq('id', 1);
    setSaving(false);
    if (!error) setSaved(true);
  }

  if (!cfg) return <p className="card p-6 text-sm text-ink-500">Cargando configuración…</p>;

  const sections: { title: string; fields: { key: keyof SiteConfig; label: string; type?: string; placeholder?: string }[] }[] = [
    {
      title: 'Identidad',
      fields: [
        { key: 'company_name', label: 'Nombre de la empresa' },
        { key: 'logo_url', label: 'Logo (URL)' },
        { key: 'footer_text', label: 'Texto del footer' },
        { key: 'primary_color', label: 'Color principal' },
        { key: 'accent_color', label: 'Color de acento' },
      ],
    },
    {
      title: 'Contacto',
      fields: [
        { key: 'phone', label: 'Teléfono' },
        { key: 'whatsapp', label: 'WhatsApp (con código de país, sin +)' },
        { key: 'email', label: 'Email' },
        { key: 'address', label: 'Dirección' },
        { key: 'hours', label: 'Horarios' },
        { key: 'instagram', label: 'Instagram (usuario sin @)' },
        { key: 'facebook', label: 'Facebook (URL o usuario)' },
      ],
    },
    {
      title: 'Home — Hero',
      fields: [
        { key: 'hero_title', label: 'Título principal' },
        { key: 'hero_subtitle', label: 'Subtítulo' },
        { key: 'hero_image_url', label: 'Imagen del hero (URL)' },
      ],
    },
    {
      title: 'Home — Newsletter & envíos',
      fields: [
        { key: 'newsletter_title', label: 'Título del newsletter' },
        { key: 'free_shipping_threshold', label: 'Mensaje de envío gratis (top bar)' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title} className="card p-6">
          <h2 className="font-semibold text-ink-900 dark:text-white mb-4">{section.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {section.fields.map((f) => (
              <div key={f.key as string} className={f.key === 'footer_text' || f.key === 'hero_title' ? 'sm:col-span-2' : ''}>
                <label className="label">{f.label}</label>
                <input
                  className="input"
                  value={(draft[f.key] as string) ?? ''}
                  onChange={(e) => update(f.key, e.target.value as any)}
                  placeholder={f.placeholder}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Guardando…' : 'Guardar configuración'}</button>
        {saved && <p className="text-sm text-emerald-600">¡Guardado!</p>}
      </div>
    </div>
  );
}
