import { useEffect, useState } from 'react';
import { getEvents, getFavorites, toggleFavorite } from '../services/events';
import { supabase } from '../lib/supabase';

export default function SchedulePage() {
  const [events, setEvents] = useState([]);
  const [favIds, setFavIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    
    // Load events and favorites
    (async () => {
      try {
        const [ev, fav] = await Promise.all([getEvents(), user ? getFavorites(user.id) : []]);
        setEvents(ev);
        setFavIds(fav);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  async function onToggle(id) {
    if (!user) return;
    
    try {
      const isFavorite = favIds.includes(id);
      await toggleFavorite(user.id, id, !isFavorite);
      setFavIds(prev => isFavorite ? prev.filter(f => f !== id) : [...prev, id]);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }

  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <div className="p-4 grid gap-3">
      {events.map(e => (
        <div key={e.id} className="rounded-xl border p-3 flex items-start justify-between">
          <div>
            <div className="font-semibold">{e.title}</div>
            <div className="text-sm opacity-80">
              {new Date(e.start_at).toLocaleString()} – {new Date(e.end_at).toLocaleTimeString()}
              {e.location ? ` · ${e.location}` : ''}
            </div>
            {e.description && (
              <div className="text-sm text-gray-600 mt-1">{e.description}</div>
            )}
          </div>
          {user && (
            <button
              className={`rounded px-3 py-1 border ${favIds.includes(e.id) ? 'bg-yellow-400' : ''}`}
              onClick={() => onToggle(e.id)}
            >
              {favIds.includes(e.id) ? '★' : '☆'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
