import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Brak zmiennych środowiskowych Supabase. Ustaw VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY w pliku .env (lokalnie) oraz w ustawieniach Netlify."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
