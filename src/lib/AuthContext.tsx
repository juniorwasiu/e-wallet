/**
 * AuthContext.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Global auth context — provides current session, user profile, and auth state
 * to all components via React Context.
 *
 * Flow:
 *  1. On mount: restores session from storage + listens for auth state changes
 *  2. On auth change: fetches fresh profile from `profiles` table
 *  3. Components consume via `useAuth()` hook
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { ProfileRow } from '@/lib/database.types';

interface AuthContextValue {
    session: Session | null;
    profile: ProfileRow | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
    session: null,
    profile: null,
    loading: true,
    refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<ProfileRow | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async (userId: string) => {
        console.log('[AuthContext] 📖 Fetching profile for user:', userId);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) {
            console.error('[AuthContext] ❌ Profile fetch error:', error.message);
            setProfile(null);
        } else {
            const profile = data as unknown as ProfileRow;
            console.log('[AuthContext] ✅ Profile loaded for:', profile.email, '| role:', profile.role);
            setProfile(profile);
        }
    }, []);

    const refreshProfile = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await fetchProfile(user.id);
    }, [fetchProfile]);

    useEffect(() => {
        console.log('[AuthContext] 🚀 Initializing auth state listener');

        // Step 1: Restore existing session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('[AuthContext] 🔑 Initial session:', session ? 'active' : 'none');
            setSession(session);
            if (session?.user) {
                fetchProfile(session.user.id).finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });

        // Step 2: Listen for future auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('[AuthContext] 🔄 Auth state changed:', event, '| User:', session?.user?.email ?? 'none');
                setSession(session);
                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }
                setLoading(false);
            }
        );

        return () => {
            console.log('[AuthContext] 🧹 Cleaning up auth listener');
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    return (
        <AuthContext.Provider value={{ session, profile, loading, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

/** Hook to consume auth context from any client component */
export function useAuth() {
    return useContext(AuthContext);
}
