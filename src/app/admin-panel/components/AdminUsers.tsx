'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import type { ProfileRow, KYCStatus, DepositAccountStatus } from '@/lib/database.types';
import { Search, Users, DollarSign } from 'lucide-react';

interface Props { onRefresh: () => void; }

const KYC_CONFIG: Record<KYCStatus, string> = {
    not_started: 'badge-neutral',
    submitted: 'badge-info',
    under_review: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-danger',
};

const DEPOSIT_CONFIG: Record<DepositAccountStatus, string> = {
    not_requested: 'badge-neutral',
    requested: 'badge-warning',
    generated: 'badge-info',
    active: 'badge-success',
};

export default function AdminUsers({ onRefresh }: Props) {
    const [users, setUsers] = useState<ProfileRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        console.log('[AdminUsers] 📋 Loading all users...');
        db.profiles.listAll().then(data => {
            setUsers(data);
            setLoading(false);
            console.log('[AdminUsers] ✅ Loaded', data.length, 'users');
            onRefresh();
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = users.filter(u =>
        `${u.first_name} ${u.last_name} ${u.email} ${u.city} ${u.state}`.toLowerCase().includes(search.toLowerCase())
    );

    const formatCurrency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

    if (loading) {
        return (
            <div className="card p-16 text-center">
                <div className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading users...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">All Users</h2>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">{filtered.length} of {users.length} users</p>
                </div>
                <div className="relative w-72">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                    <input
                        className="input-field pl-9"
                        placeholder="Search by name, email, city..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
                                {['User', 'Contact', 'Location', 'Balance', 'KYC Status', 'Deposit Account', 'Joined'].map(h => (
                                    <th key={`uh-${h}`} className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[hsl(var(--border))]">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16 text-center">
                                        <Users size={32} className="mx-auto mb-2 text-[hsl(var(--muted-foreground))] opacity-30" />
                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">No users match your search</p>
                                    </td>
                                </tr>
                            ) : filtered.map((user) => (
                                <tr key={user.id} className="hover:bg-[hsl(var(--muted))] transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: user.avatar_color }}>
                                                {user.first_name[0]}{user.last_name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{user.first_name} {user.last_name}</p>
                                                <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">{user.id.slice(0, 8)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm">{user.email}</p>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{user.phone}</p>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">{user.city}, {user.state}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <DollarSign size={13} className="text-emerald-600" />
                                            <span className="text-sm font-bold tabular-nums text-emerald-600">{formatCurrency(user.balance)}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={KYC_CONFIG[user.kyc_status]}>
                                            {user.kyc_status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={DEPOSIT_CONFIG[user.deposit_account_status]}>
                                            {user.deposit_account_status === 'not_requested' ? 'Not Requested' : user.deposit_account_status.replace(/_/g, ' ')}
                                        </span>
                                        {user.deposit_type && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{user.deposit_type === 'ach' ? 'ACH' : 'Direct Deposit'}</p>}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                                        {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}