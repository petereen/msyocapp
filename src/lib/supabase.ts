import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project values
const SUPABASE_URL = 'https://sqkmcngobccoxxlkfypo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxa21jbmdvYmNjb3h4bGtmeXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NDg0MjUsImV4cCI6MjA3NjUyNDQyNX0.6m2yrSTQ6Y9yOPoIwcdMAYqycUfcxdm72p0lc2iXpcs';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);