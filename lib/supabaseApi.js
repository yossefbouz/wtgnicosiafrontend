import { supabase } from './supabaseClient';

async function requireSession() {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user?.id) {
    const err = new Error('UNAUTHENTICATED');
    err.code = 'UNAUTHENTICATED';
    throw err;
  }
  return user;
}

// Auth
export async function signUpWithEmail({ email, password, displayName, university }) {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: undefined } });
  if (error) throw error;
  const userId = data.user?.id;
  if (userId) {
    await supabase.from('users').upsert({ id: userId, email, display_name: displayName, university });
  }
  return data;
}

export async function signInWithEmail({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function fetchProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return null;
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export async function updateProfile(partial) {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) throw new Error('Not logged in');
  const { data, error } = await supabase.from('users').update(partial).eq('id', userId).select().single();
  if (error) throw error;
  return data;
}

// Storage
export async function uploadAvatar(fileUri) {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) throw new Error('Not logged in');
  const ext = fileUri.split('.').pop();
  const path = `${userId}/avatar.${ext || 'jpg'}`;
  const response = await fetch(fileUri);
  const blob = await response.blob();
  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true, contentType: blob.type });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  await updateProfile({ avatar_url: data.publicUrl });
  return data.publicUrl;
}

// Home / venues
export async function fetchTrendingVenues() {
  const { data, error } = await supabase.rpc('get_trending_venues');
  if (error) throw error;
  return data;
}

export async function voteVenue(venueId, status) {
  await requireSession();
  const { data, error } = await supabase.rpc('upsert_vote', { p_venue_id: venueId, p_status: status });
  if (error) throw error;
  return data;
}

export async function fetchVenueStatus(venueIds) {
  const { data, error } = await supabase
    .from('venue_status')
    .select('*')
    .in('venue_id', venueIds)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Map
export async function fetchMapVenues() {
  const { data, error } = await supabase
    .from('venues')
    .select('id, name, geo_lat, geo_lng')
    .eq('status', 'active');
  if (error) throw error;
  return data;
}

// Events
export async function fetchUpcomingEvents() {
  const { data, error } = await supabase.rpc('get_upcoming_events');
  if (error) throw error;
  return data;
}

export async function setEventInterest(eventId, status) {
  await requireSession();
  const { data, error } = await supabase.rpc('set_event_interest', { p_event_id: eventId, p_status: status });
  if (error) throw error;
  return data;
}

export async function createBooking({ venueId, eventId, partySize = 1 }) {
  await requireSession();
  const { data, error } = await supabase.rpc('create_booking', {
    p_event_id: eventId,
    p_venue_id: venueId,
    p_party_size: partySize,
  });
  if (error) throw error;
  return data;
}

// Favorites / Saved
export async function toggleFavorite(venueId) {
  await requireSession();
  const { error } = await supabase.rpc('toggle_favorite', { p_venue_id: venueId });
  if (error) throw error;
}

export async function fetchFavorites() {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return [];
  const { data, error } = await supabase
    .from('favorites')
    .select('venue_id, venues(name, address, cover_url)')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
}

// Profile history
export async function fetchUserHistory() {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return { votes: [], interests: [], checkIns: [], favorites: [] };
  const [votes, interests, checkIns, favorites] = await Promise.all([
    supabase.from('venue_votes').select('*, venue:venues(name)').eq('user_id', userId),
    supabase.from('event_interest').select('*, event:events(title, start_at)').eq('user_id', userId),
    supabase.from('check_ins').select('*, venue:venues(name)').eq('user_id', userId),
    supabase.from('favorites').select('venue_id, venues(name, cover_url)').eq('user_id', userId),
  ]);
  return {
    votes: votes.data || [],
    interests: interests.data || [],
    checkIns: checkIns.data || [],
    favorites: favorites.data || [],
  };
}

export function subscribeVenueVotes(callback) {
  return supabase
    .channel('venue_votes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'venue_votes' }, payload => callback(payload))
    .subscribe();
}

export function subscribeVenueStatus(callback) {
  return supabase
    .channel('venue_status')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'venue_status' }, payload => callback(payload))
    .subscribe();
}
