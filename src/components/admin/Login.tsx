import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { signIn } from '../../lib/auth';

interface Props {
  onLoggedIn: () => void;
}

export default function Login({ onLoggedIn }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim() } },
        });
        if (error) throw error;
        await signIn(email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }
      onLoggedIn();
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-ink-50 dark:bg-ink-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <a href="/" className="inline-flex items-center gap-2 font-display text-xl font-bold text-brand-700 dark:text-white">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-700 text-white">ED</span>
            Elohim Descartables
          </a>
          <p className="mt-2 text-sm text-ink-500">Panel de administración</p>
        </div>

        <form onSubmit={submit} className="card p-6 space-y-4">
          <h1 className="font-display text-xl font-bold text-ink-900 dark:text-white">
            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </h1>

          {mode === 'signup' && (
            <div>
              <label className="label" htmlFor="fullname">Nombre completo</label>
              <input id="fullname" className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
          )}

          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>

          <div>
            <label className="label" htmlFor="password">Contraseña</label>
            <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Procesando…' : mode === 'login' ? 'Entrar' : 'Crear y entrar'}
          </button>

          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
            className="w-full text-center text-sm text-ink-500 hover:text-brand-700"
          >
            {mode === 'login' ? '¿No tenés cuenta? Crear una' : '¿Ya tenés cuenta? Iniciar sesión'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-ink-400">
          Las cuentas nuevas se crean con rol <strong>empleado</strong>. Un administrador debe escalarlas a <strong>admin</strong> para acceder a todas las funciones.
        </p>
      </div>
    </div>
  );
}
