import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import React from 'react';


export function ProfileMenu() {
  const [email, setEmail] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setEmail(s?.user?.email ?? null)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!email) return null;

  async function signOut() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm opacity-80">{email}</span>
      <button
        className="rounded px-2 py-1 border"
        onClick={signOut}
      >
        Гарах
      </button>
    </div>
  );
}
