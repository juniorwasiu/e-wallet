/**
 * supabase.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Supabase client singleton — used throughout the app.
 *
 * Flow:
 *  1. Browser components → use `supabase` (anon key, respects RLS)
 *  2. Server-side / admin ops → use `supabaseAdmin` (service-role key, bypasses RLS)
 *
 * Environment variables required in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// ─── Step 1: Validate environment variables ───────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        '[Supabase] ❌ Missing environment variables!\n' +
        'Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
        'Copy .env.local.example → .env.local and fill in your credentials.'
    );
}

// ─── Step 2: Create browser client (singleton) ────────────────────────────────
// Uses anon key — respects Row Level Security policies.
// Safe to use in browser/client components.
let _supabase: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
    if (!_supabase) {
        _supabase = createClient<Database>(
            supabaseUrl ?? '',
            supabaseAnonKey ?? '',
            {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true,
                },
            }
        );
        console.log('[Supabase] ✅ Browser client initialized');
    }
    return _supabase;
}

// Default export — anon client for use in components
export const supabase = createClient<Database>(
    supabaseUrl ?? '',
    supabaseAnonKey ?? ''
);

// ─── Step 3: Create admin client (service role — bypasses RLS) ────────────────
// Only use server-side or in admin-only paths.
// NEVER expose service role key to the browser.
export const supabaseAdmin = createClient<Database>(
    supabaseUrl ?? '',
    supabaseServiceRoleKey ?? supabaseAnonKey ?? '',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

console.log('[Supabase] 🔑 Admin client initialized (service role)');
