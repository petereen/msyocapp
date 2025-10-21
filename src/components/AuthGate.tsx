import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import React from 'react';


export default function AuthGate({ children }) {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="sticky top-0 z-50 bg-white border-b border-neutral-200 px-4 py-3">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MS</span>
              </div>
              <div>
                <div className="text-sm font-semibold">MSYOC 2025</div>
                <div className="text-xs text-neutral-500">Mongolian Students' Youth Overseas Conference</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">{session.user?.email}</span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-xs px-3 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                Гарах
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-md mx-auto">
          {children}
        </div>
      </div>
    );
  }

  async function signIn(e) {
    e.preventDefault();
    if (!email) return;
    
    try {
      setLoading(true);
      setMessage('');
      
      const { error } = await supabase.auth.signInWithOtp({ 
        email, 
        options: { 
          emailRedirectTo: window.location.origin 
        } 
      });
      
      if (error) {
        setMessage('Алдаа: ' + error.message);
      } else {
        setMessage('Цахим холбоос илгээгдлээ. Та цахим шуудангийн хаягт илгээгдсэн холбоос дээр дарж нэвтэрнэ үү.');
      }
    } catch (error) {
      setMessage('Алдаа: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-400 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">MS</span>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">MSYOC 2025</h2>
          <p className="text-neutral-600 mt-2">Нэвтрэх</p>
        </div>
        
        <form onSubmit={signIn} className="space-y-4">
          <div>
            <input
              className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              type="email"
              placeholder="та@жишээ.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading || !email}
            className="w-full bg-neutral-900 text-white py-3 rounded-lg font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Илгээж байна...' : 'Цахим холбоос илгээх'}
          </button>
        </form>
        
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.includes('Алдаа') 
              ? 'bg-red-100 text-red-800 border border-red-200' 
              : 'bg-green-100 text-green-800 border border-green-200'
          }`}>
            {message}
          </div>
        )}
        
        <div className="mt-6 text-center text-xs text-neutral-500">
          <p>Цахим шуудангаа шалгаж, холбоос дээр дарж нэвтэрнэ үү</p>
        </div>
      </div>
    </div>
  );
}
