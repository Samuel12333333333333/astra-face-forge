
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://chxhuollywzttaywrrxg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoeGh1b2xseXd6dHRheXdycnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NjQ2NzcsImV4cCI6MjA2MzM0MDY3N30.IjiLDlMt0PJnRkxGg6cxRyQQ1pvZHMbMDjNggPQTnuM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof localStorage !== 'undefined' ? localStorage : undefined,
    detectSessionInUrl: true
  }
});
