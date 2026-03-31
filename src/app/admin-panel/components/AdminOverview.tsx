'use client';

import React, { useEffect, useState } from 'react';
import { Users, Shield, Building2, HeadphonesIcon, TrendingUp, AlertCircle, ArrowRight, Activity } from 'lucide-react';
import { db } from '@/lib/db';
import type { TransactionRow } from '@/lib/database.types';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { AdminSection } from './AdminPanelScreen';

interface Props {
    stats: { totalUsers: number; pendingKYC: number; openTickets: number; depositRequests: number; volume24h: number; totalBalance: number };
    onNavigate: (s: AdminSection) => void;
    refreshKey: number;
}

const VOLUME_DATA = [
    { date: 'Mar 24', deposits: 8200, withdrawals: 3100 },
    { date: 'Mar 25', deposits: 12500, withdrawals: 4800 },
    { date: 'Mar 26', deposits: 9800, withdrawals: 6200 },
    { date: 'Mar 27', deposits: 15300, withdrawals: 5400 },
    { date: 'Mar 28', deposits: 11200, withdrawals: 7800 },
    { date: 'Mar 29', deposits: 18900, withdrawals: 4200 },
    { date: 'Mar 30', deposits: 14600, withdrawals: 9100 },
];

const KYC_STATUS_DATA = [
    { name: 'Approved', value: 2, color: '#059669' },
    { name: 'Under Review', value: 1, color: '#d97706' },
    { name: 'Submitted', value: 1, color: '#2563eb' },
    { name: 'Rejected', value: 1, color: '#dc2626' },
    { name: 'Not Started', value: 1, color: '#94a3b8' },
];

export default function AdminOverview({ stats, onNavigate, refreshKey }: Props) {
    const [recentTxns, setRecentTxns] = useState<TransactionRow[]>([]);
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        console.log('[AdminOverview] 📊 Loading recent transactions...');
        db.transactions.all().then(data => {
            setRecentTxns(data.slice(0, 8));
            console.log('[AdminOverview] ✅ Loaded', data.length, 'recent transactions');
        });
        setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, [refreshKey]);

    const formatCurrency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: v > 9999 ? 'compact' : 'standard' }).format(v);

    const KPI_CARDS = [
        { label: 'Total Users', value: stats.totalUsers.toString(), icon: Users, color: 'text-[hsl(var(--primary))]', bg: 'bg-blue-50', trend: '+2 this week', trendUp: true },
        { label: 'Pending KYC', value: stats.pendingKYC.toString(), icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Needs attention', trendUp: false, alert: stats.pendingKYC > 0, action: () => onNavigate('kyc') },
        { label: 'Deposit Requests', value: stats.depositRequests.toString(), icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'Awaiting setup', trendUp: false, alert: stats.depositRequests > 0, action: () => onNavigate('deposits') },
        { label: 'Open Tickets', value: stats.openTickets.toString(), icon: HeadphonesIcon, color: 'text-red-600', bg: 'bg-red-50', trend: 'Needs response', trendUp: false, alert: stats.openTickets > 0, action: () => onNavigate('tickets') },
        { label: '24h Volume', value: formatCurrency(stats.volume24h), icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+18% vs yesterday', trendUp: true },
        { label: 'Total Balance', value: formatCurrency(stats.totalBalance), icon: TrendingUp, color: 'text-[hsl(var(--primary))]', bg: 'bg-blue-50', trend: 'Across all wallets', trendUp: true },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Operations Overview</h2>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">Last updated: {lastUpdated}</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-700">Live</span>
                </div>
            </div>

            {/* KPI Grid — 3+3 layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
                {KPI_CARDS.map((card) => (
                    <div
                        key={`kpi-${card.label}`}
                        onClick={card.action}
                        className={`card p-5 ${card.alert ? 'border-red-200 bg-red-50/50' : ''} ${card.action ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                                <card.icon size={18} className={card.color} />
                            </div>
                            {card.alert && (
                                <AlertCircle size={16} className="text-red-500" />
                            )}
                            {card.action && (
                                <ArrowRight size={14} className="text-[hsl(var(--muted-foreground))]" />
                            )}
                        </div>
                        <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{card.label}</p>
                        <p className="text-2xl font-bold tabular-nums mt-1">{card.value}</p>
                        <p className={`text-xs mt-1 font-medium ${card.trendUp ? 'text-emerald-600' : card.alert ? 'text-red-500' : 'text-[hsl(var(--muted-foreground))]'}`}>
                            {card.trend}
                        </p>
                    </div>
                ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Volume chart */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-semibold">Transaction Volume</h3>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Deposits vs Withdrawals — Last 7 days</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={VOLUME_DATA} barSize={16}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,88%)" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(220,10%,48%)' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: 'hsl(220,10%,48%)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (!active || !payload?.length) return null;
                                    return (
                                        <div className="bg-white border border-[hsl(var(--border))] rounded-lg px-3 py-2 shadow-lg">
                                            <p className="text-xs font-semibold mb-1">{label}</p>
                                            {payload.map((p) => (
                                                <p key={`tp-${p.name}`} className="text-xs" style={{ color: p.color }}>
                                                    {p.name}: ${Number(p.value).toLocaleString()}
                                                </p>
                                            ))}
                                        </div>
                                    );
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Bar dataKey="deposits" name="Deposits" fill="#059669" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="withdrawals" name="Withdrawals" fill="#dc2626" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* KYC distribution */}
                <div className="card p-6">
                    <div className="mb-4">
                        <h3 className="text-base font-semibold">KYC Status Distribution</h3>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Current verification status across all users</p>
                    </div>
                    <div className="space-y-3">
                        {KYC_STATUS_DATA.map((item) => (
                            <div key={`kyc-dist-${item.name}`} className="flex items-center gap-3">
                                <div className="w-24 text-xs font-medium text-[hsl(var(--muted-foreground))]">{item.name}</div>
                                <div className="flex-1 bg-[hsl(var(--muted))] rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${(item.value / 6) * 100}%`, backgroundColor: item.color }}
                                    />
                                </div>
                                <span className="text-xs font-bold w-6 text-right">{item.value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[hsl(var(--border))] flex items-center justify-between">
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">Total Users</span>
                        <span className="text-sm font-bold">{stats.totalUsers}</span>
                    </div>
                </div>
            </div>

            {/* Recent transactions */}
            <div className="card overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
                    <h3 className="text-base font-semibold">Recent Transactions</h3>
                    <button onClick={() => onNavigate('transactions')} className="text-xs text-[hsl(var(--primary))] font-semibold hover:underline flex items-center gap-1">
                        View all <ArrowRight size={12} />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
                                {['User', 'Type', 'Description', 'Reference', 'Status', 'Amount', 'Date'].map(h => (
                                    <th key={`h-${h}`} className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[hsl(var(--border))]">
                            {recentTxns.map((txn) => {
                                const isCredit = txn.type === 'deposit' || txn.type === 'transfer_in';
                                return (
                                    <tr key={txn.id} className="hover:bg-[hsl(var(--muted))] transition-colors">
                                        <td className="px-4 py-3 text-xs font-mono text-[hsl(var(--muted-foreground))]">{txn.user_id.slice(0, 8)}…</td>
                                        <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))] capitalize">{txn.type.replace(/_/g, ' ')}</td>
                                        <td className="px-4 py-3 text-sm max-w-[160px] truncate">{txn.description}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--muted-foreground))]">{txn.reference}</td>
                                        <td className="px-4 py-3">
                                            <span className={txn.status === 'completed' ? 'badge-success' : txn.status === 'failed' ? 'badge-danger' : txn.status === 'pending' ? 'badge-warning' : 'badge-info'}>
                                                {txn.status}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 text-sm font-bold tabular-nums ${isCredit ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {isCredit ? '+' : '-'}${txn.amount.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                                            {new Date(txn.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}