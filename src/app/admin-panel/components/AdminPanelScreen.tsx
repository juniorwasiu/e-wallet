'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'sonner';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import AdminSidebar from './AdminSidebar';
import AdminOverview from './AdminOverview';
import AdminKYCQueue from './AdminKYCQueue';
import AdminDepositRequests from './AdminDepositRequests';
import AdminTickets from './AdminTickets';
import AdminUsers from './AdminUsers';
import AdminTransactions from './AdminTransactions';

export type AdminSection = 'overview' | 'kyc' | 'deposits' | 'tickets' | 'users' | 'transactions';

type AdminStats = {
    totalUsers: number;
    pendingKYC: number;
    openTickets: number;
    depositRequests: number;
    volume24h: number;
    totalBalance: number;
};

export default function AdminPanelScreen() {
    const router = useRouter();
    const [section, setSection] = useState<AdminSection>('overview');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0, pendingKYC: 0, openTickets: 0,
        depositRequests: 0, volume24h: 0, totalBalance: 0,
    });
    const [adminId, setAdminId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // ─── Auth guard: only admins may access this page ─────────────────────────
    useEffect(() => {
        console.log('[AdminPanel] 🚀 Verifying admin session...');
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) {
                console.warn('[AdminPanel] ⚠️ No session — redirecting to login');
                router.replace('/sign-up-login-screen');
                return;
            }
            const profile = await db.profiles.get(user.id);
            if (!profile || profile.role !== 'admin') {
                console.warn('[AdminPanel] ⚠️ Not an admin — redirecting');
                router.replace('/sign-up-login-screen');
                return;
            }
            console.log('[AdminPanel] ✅ Admin verified:', profile.email);
            setAdminId(user.id);
            setLoading(false);
        });
    }, [router]);

    // ─── Load dashboard stats ─────────────────────────────────────────────────
    const loadStats = useCallback(async () => {
        console.log('[AdminPanel] 📊 Loading admin stats...');
        const data = await db.adminStats.get();
        setStats(data);
        console.log('[AdminPanel] ✅ Stats loaded:', data);
    }, []);

    useEffect(() => {
        if (!loading) loadStats();
    }, [loading, loadStats, refreshKey]);

    const refresh = () => {
        console.log('[AdminPanel] 🔄 Refresh triggered');
        setRefreshKey(k => k + 1);
        loadStats();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading admin panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] flex">
            <Toaster position="top-right" richColors />

            <AdminSidebar
                section={section}
                onSectionChange={setSection}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(c => !c)}
                stats={stats}
            />

            <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} min-h-screen`}>
                <div className="max-w-screen-2xl mx-auto px-6 py-8">
                    {section === 'overview' && <AdminOverview stats={stats} onNavigate={setSection} refreshKey={refreshKey} />}
                    {section === 'kyc' && <AdminKYCQueue onRefresh={refresh} adminId={adminId!} />}
                    {section === 'deposits' && <AdminDepositRequests onRefresh={refresh} adminId={adminId!} />}
                    {section === 'tickets' && <AdminTickets adminId={adminId!} />}
                    {section === 'users' && <AdminUsers onRefresh={refresh} />}
                    {section === 'transactions' && <AdminTransactions />}
                </div>
            </main>
        </div>
    );
}