import { supabase } from './supabaseClient';

const VOTE_BROADCAST_CHANNEL = 'rt-venue-votes-broadcast';
let voteBroadcastChannel;
let ensuredProfileUserId = null;

function getVoteBroadcastChannel() {
  if (!voteBroadcastChannel) {
    voteBroadcastChannel = supabase.channel(VOTE_BROADCAST_CHANNEL);
  }
  return voteBroadcastChannel;
}

async function ensureUserProfile(user) {
  if (!user?.id || ensuredProfileUserId === user.id) return;
  const { error } = await supabase.from('users').upsert({
    id: user.id,
    email: user.email,
    display_name: user.user_metadata?.full_name || user.user_metadata?.display_name || null,
  });
  if (error) throw error;
  ensuredProfileUserId = user.id;
}

async function requireSession() {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user?.id) {
    const err = new Error('UNAUTHENTICATED');
    err.code = 'UNAUTHENTICATED';
    throw err;
  }
  await ensureUserProfile(user);
  return user;
}

// Auth
export async function signUpWithEmail({ email, password, displayName, university }) {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: undefined } });
  if (error) throw error;
  const userId = data.user?.id;
  if (userId) {
    await supabase.from('users').upsert({ id: userId, email, display_name: displayName, university });
    await ensureUserProfile({ id: userId, email, user_metadata: { display_name: displayName } });
  }
  return data;
}

export async function signInWithEmail({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const user = data?.user || data?.session?.user;
  if (user?.id) await ensureUserProfile(user);
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

export function subscribeVoteBroadcast(callback) {
  const channel = getVoteBroadcastChannel();
  return channel
    .on('broadcast', { event: 'vote' }, ({ payload }) => callback(payload))
    .subscribe();
}

export async function broadcastVote({ venueId, status }) {
  const channel = getVoteBroadcastChannel();
  if (channel.state !== 'joined') {
    channel.subscribe();
  }
  await channel.send({
    type: 'broadcast',
    event: 'vote',
    payload: { venueId, status },
  });
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

// Occupancy (owner/admin)
export async function fetchVenueOccupancy(venueIds) {
  if (!venueIds?.length) return [];
  const { data, error } = await supabase
    .from('venue_occupancy')
    .select('venue_id, current_count, status_tag, updated_at')
    .in('venue_id', venueIds);
  if (error) throw error;
  return data || [];
}

export async function fetchManageableVenuesWithOccupancy({ role } = {}) {
  const user = await requireSession();
  let query = supabase
    .from('venues')
    .select(`
      id,
      name,
      address,
      city,
      owner_id,
      occupancy:venue_occupancy(
        current_count,
        status_tag,
        source,
        last_delta,
        last_reason,
        updated_at,
        updated_by
      )
    `)
    .order('name', { ascending: true });

  // Owners see only their venues; admins can see all
  if (role !== 'admin') {
    query = query.eq('owner_id', user.id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function incrementVenueOccupancy(venueId, delta, { reason, statusTag } = {}) {
  await requireSession();
  const { data, error } = await supabase.rpc('increment_venue_occupancy', {
    p_venue_id: venueId,
    p_delta: delta,
    p_reason: reason,
    p_status_tag: statusTag || null,
  });
  if (error) throw error;
  return data;
}

export async function setVenueOccupancy(venueId, targetCount, { reason, statusTag } = {}) {
  await requireSession();
  const { data, error } = await supabase.rpc('set_venue_occupancy', {
    p_venue_id: venueId,
    p_target_count: targetCount,
    p_reason: reason,
    p_status_tag: statusTag || null,
  });
  if (error) throw error;
  return data;
}

export function subscribeVenueOccupancy(callback) {
  return supabase
    .channel('venue_occupancy')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'venue_occupancy' }, payload => callback(payload))
    .subscribe();
}

// User votes
export async function fetchUserVenueVotes() {
  const user = await requireSession();
  const { data, error } = await supabase
    .from('venue_votes')
    .select('venue_id, status')
    .eq('user_id', user.id);
  if (error) throw error;
  return data || [];
}
