'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'sonner';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import type { ProfileRow } from '@/lib/database.types';
import UserSidebar from './UserSidebar';
import WalletOverview from './WalletOverview';
import TransactionHistory from './TransactionHistory';
import UserProfile from './UserProfile';
import KYCSection from './KYCSection';
import SupportSection from './SupportSection';
import DepositModal from './DepositModal';
import WithdrawModal from './WithdrawModal';
import TransferModal from './TransferModal';
import { Wallet, ArrowLeftRight, User as UserIcon, Shield, HeadphonesIcon, Menu } from 'lucide-react';

export type UserSection = 'wallet' | 'transactions' | 'profile' | 'kyc' | 'support';

const MOBILE_NAV: { id: UserSection; label: string; icon: React.ElementType }[] = [
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'transactions', label: 'History', icon: ArrowLeftRight },
    { id: 'kyc', label: 'KYC', icon: Shield },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'support', label: 'Support', icon: HeadphonesIcon },
];

export default function UserDashboardScreen() {
    const router = useRouter();
    const [profile, setProfile] = useState<ProfileRow | null>(null);
    const [loading, setLoading] = useState(true);
    const [section, setSection] = useState<UserSection>('wallet');
    const [showDeposit, setShowDeposit] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [showTransfer, setShowTransfer] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // ─── Load user profile from Supabase ─────────────────────────────────────
    const loadProfile = useCallback(async () => {
        console.log('[UserDashboard] 🚀 Loading user session...');
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.warn('[UserDashboard] ⚠️ No authenticated user — redirecting to login');
            router.replace('/sign-up-login-screen');
            return;
        }

        const profileData = await db.profiles.get(user.id);

        if (!profileData || profileData.role === 'admin') {
            console.warn('[UserDashboard] ⚠️ Invalid role or profile not found — redirecting');
            router.replace('/sign-up-login-screen');
            return;
        }

        console.log('[UserDashboard] ✅ Profile loaded:', profileData.email, '| balance:', profileData.balance);
        setProfile(profileData);
        setLoading(false);
    }, [router]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    // ─── Real-time: refresh profile when balance or deposit_account_status changes ──
    useEffect(() => {
        if (!profile?.id) return;
        console.log('[UserDashboard] 📡 Setting up real-time profile subscription for:', profile.id);

        const channel = supabase
            .channel(`profile:${profile.id}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${profile.id}` },
                (payload) => {
                    console.log('[UserDashboard] 🔄 Profile updated via real-time:', payload.new);
                    setProfile(payload.new as ProfileRow);
                }
            )
            .subscribe();

        return () => {
            console.log('[UserDashboard] 🧹 Cleaning up real-time subscription');
            supabase.removeChannel(channel);
        };
    }, [profile?.id]);

    const refresh = useCallback(() => {
        console.log('[UserDashboard] 🔄 Manual refresh triggered');
        loadProfile();
    }, [loadProfile]);

    // ─── Loading state ────────────────────────────────────────────────────────
    if (loading || !profile) {
        return (
            <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading your wallet...</p>
                </div>
            </div>
        );
    }

    // ─── Map ProfileRow → legacy User shape used by child components ─────────
    // Child components still expect the camelCase User shape from store.ts.
    // This adapter prevents us from rewriting every child component.
    const userForChildren = {
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        phone: profile.phone,
        dob: profile.dob,
        ssn_last4: profile.ssn_last4,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        zip: profile.zip,
        balance: profile.balance,
        kycStatus: profile.kyc_status,
        kycSubmittedAt: profile.kyc_submitted_at ?? undefined,
        kycDocumentType: profile.kyc_document_type ?? undefined,
        depositAccountStatus: profile.deposit_account_status,
        depositType: profile.deposit_type ?? undefined,
        createdAt: profile.created_at,
        role: profile.role,
        avatarColor: profile.avatar_color,
    };

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] flex">
            <Toaster position="top-right" richColors />

            {/* Mobile overlay */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* Desktop sidebar */}
            <div className="hidden lg:block">
                <UserSidebar
                    user={userForChildren}
                    section={section}
                    onSectionChange={setSection}
                    collapsed={sidebarCollapsed}
                    onToggleCollapse={() => setSidebarCollapsed(c => !c)}
                />
            </div>

            {/* Mobile sidebar drawer */}
            <div className={`fixed inset-y-0 left-0 z-40 lg:hidden transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <UserSidebar
                    user={userForChildren}
                    section={section}
                    onSectionChange={(s) => { setSection(s); setMobileSidebarOpen(false); }}
                    collapsed={false}
                    onToggleCollapse={() => setMobileSidebarOpen(false)}
                />
            </div>

            {/* Main content */}
            <main className={`flex-1 transition-all duration-300 lg:${sidebarCollapsed ? 'ml-16' : 'ml-64'} min-h-screen pb-20 lg:pb-0`}>
                {/* Mobile top bar */}
                <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-[hsl(var(--border))] px-4 h-14 flex items-center justify-between">
                    <button
                        onClick={() => setMobileSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
                    >
                        <Menu size={20} className="text-[hsl(var(--foreground))]" />
                    </button>
                    <span className="font-bold text-[hsl(var(--primary))]">eWallet</span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: profile.avatar_color }}>
                        {profile.first_name[0]}{profile.last_name[0]}
                    </div>
                </div>

                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
                    {section === 'wallet' && (
                        <WalletOverview
                            user={userForChildren}
                            onDeposit={() => setShowDeposit(true)}
                            onWithdraw={() => setShowWithdraw(true)}
                            onTransfer={() => setShowTransfer(true)}
                            onViewTransactions={() => setSection('transactions')}
                        />
                    )}
                    {section === 'transactions' && <TransactionHistory userId={profile.id} />}
                    {section === 'profile' && <UserProfile user={userForChildren} onUpdate={refresh} />}
                    {section === 'kyc' && <KYCSection user={userForChildren} onUpdate={refresh} />}
                    {section === 'support' && <SupportSection user={userForChildren} />}
                </div>
            </main>

            {/* Mobile bottom nav */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[hsl(var(--border))] safe-area-pb">
                <div className="grid grid-cols-5 h-16">
                    {MOBILE_NAV.map((item) => {
                        const isActive = section === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setSection(item.id)}
                                className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${isActive ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}
                            >
                                <item.icon size={20} />
                                <span className="text-[10px] font-semibold">{item.label}</span>
                                {isActive && <span className="absolute bottom-0 w-8 h-0.5 bg-[hsl(var(--primary))] rounded-full" />}
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Modals */}
            {showDeposit && (
                <DepositModal user={userForChildren} onClose={() => setShowDeposit(false)} onSuccess={() => { refresh(); setShowDeposit(false); }} />
            )}
            {showWithdraw && (
                <WithdrawModal user={userForChildren} onClose={() => setShowWithdraw(false)} onSuccess={() => { refresh(); setShowWithdraw(false); }} />
            )}
            {showTransfer && (
                <TransferModal user={userForChildren} onClose={() => setShowTransfer(false)} onSuccess={() => { refresh(); setShowTransfer(false); }} />
            )}
        </div>
    );
}