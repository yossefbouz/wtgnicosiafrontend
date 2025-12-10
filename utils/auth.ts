import { supabase } from './supabase';

export async function signUp(email: string, password: string, confirmPassword: string) {
  if (!email || !password || !confirmPassword) {
    throw new Error('Email, password, and confirm password are required');
  }
  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
