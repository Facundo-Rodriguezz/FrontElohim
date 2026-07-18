import { supabase, type Profile } from './supabase';

export type Session = {
  user: { id: string; email: string };
  profile: Profile | null;
};

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  return data as Profile | null;
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return null;
  const profile = await fetchProfile(data.session.user.id);
  if (!profile || !['admin', 'employee'].includes(profile.role)) return null;
  return { user: { id: data.session.user.id, email: data.session.user.email ?? '' }, profile };
}
