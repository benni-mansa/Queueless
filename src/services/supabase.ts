import { createClient } from '@supabase/supabase-js';
import { config, validateConfig } from '../config/env';

// Validate configuration before creating client
console.log('🔧 [SUPABASE] Initializing Supabase client...');
console.log('🔧 [SUPABASE] Configuration validation starting...');
validateConfig();
console.log('✅ [SUPABASE] Configuration validation completed');

console.log('🔧 [SUPABASE] Creating Supabase client with URL:', config.supabase.url ? `${config.supabase.url.substring(0, 20)}...` : 'MISSING');
console.log('🔧 [SUPABASE] Anon key available:', config.supabase.anonKey ? 'Yes' : 'No');
console.log('🔧 [SUPABASE] Service role key available:', config.supabase.serviceRoleKey ? 'Yes' : 'No');

export const supabase = createClient(config.supabase.url, config.supabase.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'hospital-queue-app',
    },
  },
});

console.log('✅ [SUPABASE] Regular Supabase client created successfully');

// Admin client for admin operations (requires service role key)
console.log('🔧 [SUPABASE] Creating admin client...');
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey || config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': 'hospital-queue-admin',
      },
    },
  }
);

console.log('✅ [SUPABASE] Admin Supabase client created successfully');
console.log('🎉 [SUPABASE] All Supabase clients initialized successfully');

export default supabase;
