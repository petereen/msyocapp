import { supabase } from '../lib/supabase';

// Get all events
export async function getEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_at');
  
  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
  return data || [];
}

// Get events by day
export async function getEventsByDay(day) {
  const startOfDay = new Date(day).toISOString();
  const endOfDay = new Date(day);
  endOfDay.setDate(endOfDay.getDate() + 1);
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('start_at', startOfDay)
    .lt('start_at', endOfDay.toISOString())
    .order('start_at');
  
  if (error) {
    console.error('Error fetching events by day:', error);
    throw error;
  }
  return data || [];
}

// Get user's favorites
export async function getFavorites(userId) {
  const { data, error } = await supabase
    .from('favorites')
    .select('event_id')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
  return data?.map(fav => fav.event_id) || [];
}

// Add favorite
export async function addFavorite(userId, eventId) {
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, event_id: eventId });
  
  if (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
}

// Remove favorite
export async function removeFavorite(userId, eventId) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId);
  
  if (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
}

// Toggle favorite
export async function toggleFavorite(userId, eventId, isFavorite) {
  if (isFavorite) {
    await addFavorite(userId, eventId);
  } else {
    await removeFavorite(userId, eventId);
  }
}