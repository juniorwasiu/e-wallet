'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import type { TransactionRow, TransactionType, TransactionStatus } from '@/lib/database.types';
import { Search, Filter, ArrowLeftRight, ChevronLeft, ChevronRight } from 'lucide-react';

const TYPE_LABELS: Record<TransactionType, string> = {
    deposit: 'Deposit',
    withdrawal: 'Withdrawal',
    transfer_in: 'Transfer In',
    transfer_out: 'Transfer Out',
    payment: 'Payment',
};

const STATUS_CLS: Record<TransactionStatus, string> = {
    completed: 'badge-success',
    pending: 'badge-warning',
    processing: 'badge-info',
    failed: 'badge-danger',
    reversed: 'badge-neutral',
};

export default function AdminTransactions() {
    const [transactions, setTransactions] = useState<TransactionRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const PER_PAGE = 10;

    useEffect(() => {
        console.log('[AdminTransactions] 📋 Loading all transactions...');
        db.transactions.all().then(data => {
            setTransactions(data);
            setLoading(false);
            console.log('[AdminTransactions] ✅ Loaded', data.length, 'transactions');
        });
    }, []);

    const filtered = transactions.filter(t => {
        const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
            t.reference.toLowerCase().includes(search.toLowerCase()) ||
            (t.counterparty || '').toLowerCase().includes(search.toLowerCase()) ||
            t.user_id.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === 'all' || t.type === typeFilter;
        const matchStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchSearch && matchType && matchStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const isCredit = (type: TransactionType) => type === 'deposit' || type === 'transfer_in';
    const formatCurrency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">All Transactions</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                    {loading ? 'Loading...' : `${filtered.length} transactions`}
                </p>
            </div>

            <div className="card p-4">
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                        <input
                            className="input-field pl-9"
                            placeholder="Search description, reference, or user…"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-[hsl(var(--muted-foreground))]" />
                        <select className="input-field" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
                            <option value="all">All Types</option>
                            <option value="deposit">Deposit</option>
                            <option value="withdrawal">Withdrawal</option>
                            <option value="transfer_in">Transfer In</option>
                            <option value="transfer_out">Transfer Out</option>
                            <option value="payment">Payment</option>
                        </select>
                    </div>
                    <select className="input-field" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                        <option value="all">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
                                {['User ID', 'Type', 'Description', 'Counterparty', 'Reference', 'Status', 'Amount', 'Date'].map(h => (
                                    <th key={`ath-${h}`} className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[hsl(var(--border))]">
                            {loading ? (
                                <tr><td colSpan={8} className="px-4 py-16 text-center">
                                    <div className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading transactions...</p>
                                </td></tr>
                            ) : paginated.length === 0 ? (
                                <tr><td colSpan={8} className="px-4 py-16 text-center">
                                    <ArrowLeftRight size={32} className="mx-auto mb-2 text-[hsl(var(--muted-foreground))] opacity-30" />
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">No transactions match your filters</p>
                                </td></tr>
                            ) : paginated.map((txn) => (
                                <tr key={txn.id} className="hover:bg-[hsl(var(--muted))] transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="text-xs font-mono text-[hsl(var(--muted-foreground))]">{txn.user_id.slice(0, 8)}…</p>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap">{TYPE_LABELS[txn.type]}</td>
                                    <td className="px-4 py-3 text-sm max-w-[160px] truncate">{txn.description}</td>
                                    <td className="px-4 py-3 text-sm text-[hsl(var(--muted-foreground))] whitespace-nowrap">{txn.counterparty || '—'}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap">{txn.reference}</td>
                                    <td className="px-4 py-3"><span className={STATUS_CLS[txn.status]}>{txn.status}</span></td>
                                    <td className={`px-4 py-3 text-sm font-bold tabular-nums whitespace-nowrap ${isCredit(txn.type) ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {isCredit(txn.type) ? '+' : '-'}{formatCurrency(txn.amount)}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                                        {new Date(txn.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {filtered.length === 0 ? 'No results' : `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, filtered.length)} of ${filtered.length}`}
                    </p>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-[hsl(var(--border))] disabled:opacity-40 transition-colors">
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                            <button
                                key={`atp-${p}`}
                                onClick={() => setPage(p)}
                                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${page === p ? 'bg-[hsl(var(--primary))] text-white' : 'hover:bg-[hsl(var(--border))]'}`}
                            >
                                {p}
                            </button>
                        ))}
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-[hsl(var(--border))] disabled:opacity-40 transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}