import { supabase } from './supabase';

export async function fetchHomeFeed() {
  const { data, error } = await supabase.rpc('get_trending_venues');
  if (error) throw error;
  return data;
}

export async function submitVote(venueId: string, status: 'yes' | 'maybe' | 'no') {
  const { data, error } = await supabase.rpc('upsert_vote', { p_venue_id: venueId, p_status: status });
  if (error) throw error;
  return data;
}

export async function fetchMapVenues() {
  const { data, error } = await supabase.from('venues').select('id, name, geo_lat, geo_lng').eq('status', 'active');
  if (error) throw error;
  return data;
}

export async function fetchVenueStatus(ids: string[]) {
  const { data, error } = await supabase.from('venue_status').select('*').in('venue_id', ids).order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchEvents() {
  const { data, error } = await supabase.rpc('get_upcoming_events');
  if (error) throw error;
  return data;
}

export async function setInterest(eventId: string, status: 'interested' | 'going') {
  const { data, error } = await supabase.rpc('set_event_interest', { p_event_id: eventId, p_status: status });
  if (error) throw error;
  return data;
}

export async function bookEvent(eventId: string | null, venueId: string | null, partySize = 1) {
  const { data, error } = await supabase.rpc('create_booking', {
    p_event_id: eventId,
    p_venue_id: venueId,
    p_party_size: partySize,
  });
  if (error) throw error;
  return data;
}

export async function toggleFavoriteVenue(venueId: string) {
  const { error } = await supabase.rpc('toggle_favorite', { p_venue_id: venueId });
  if (error) throw error;
}

export async function fetchFavorites() {
  const { data, error } = await supabase.from('favorites').select('venue_id, venues(name, cover_url)').eq('user_id', (await supabase.auth.getUser()).data.user?.id || '');
  if (error) throw error;
  return data;
}

export async function uploadAvatar(fileUri: string) {
  const session = (await supabase.auth.getSession()).data.session;
  const userId = session?.user?.id;
  if (!userId) throw new Error('Not logged in');
  const ext = fileUri.split('.').pop() || 'jpg';
  const path = `${userId}/avatar.${ext}`;
  const response = await fetch(fileUri);
  const blob = await response.blob();
  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true, contentType: blob.type });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  const publicUrl = data.publicUrl;
  await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', userId);
  return publicUrl;
}

export function subscribeVenueVotes(callback: (payload: any) => void) {
  return supabase.channel('rt-venue-votes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'venue_votes' }, callback)
    .subscribe();
}

export function subscribeVenueStatus(callback: (payload: any) => void) {
  return supabase.channel('rt-venue-status')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'venue_status' }, callback)
    .subscribe();
}
