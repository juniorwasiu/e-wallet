'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '@/lib/db';
import type { TransactionRow } from '@/lib/database.types';
import { toast } from 'sonner';

interface Props { userId: string; }

const TYPE_LABELS: Record<TransactionRow['type'], string> = {
    deposit: 'Deposit',
    withdrawal: 'Withdrawal',
    transfer_in: 'Transfer In',
    transfer_out: 'Transfer Out',
    payment: 'Payment',
};

const STATUS_CLASSES: Record<TransactionRow['status'], string> = {
    completed: 'badge-success',
    pending: 'badge-warning',
    processing: 'badge-info',
    failed: 'badge-danger',
    reversed: 'badge-neutral',
};

export default function TransactionHistory({ userId }: Props) {
    const [transactions, setTransactions] = useState<TransactionRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [isExporting, setIsExporting] = useState(false);
    const PER_PAGE = 8;

    useEffect(() => {
        console.log('[TransactionHistory] 📖 Loading transactions for user:', userId);
        setLoading(true);
        db.transactions.forUser(userId).then(txns => {
            setTransactions(txns);
            setLoading(false);
            console.log('[TransactionHistory] ✅ Loaded', txns.length, 'transactions');
        });
    }, [userId]);

    const filtered = transactions.filter(t => {
        const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.reference.toLowerCase().includes(search.toLowerCase()) || (t.counterparty || '').toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === 'all' || t.type === typeFilter;
        const matchStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchSearch && matchType && matchStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const isCredit = (type: TransactionRow['type']) => type === 'deposit' || type === 'transfer_in';

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text('eWallet — Transaction Statement', 14, 22);
            doc.setFontSize(11);
            doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 14, 32);
            doc.text(`Account: ${userId}`, 14, 40);
            autoTable(doc, {
                startY: 50,
                head: [['Date', 'Description', 'Type', 'Reference', 'Status', 'Amount']],
                body: filtered.map(t => [
                    new Date(t.created_at).toLocaleDateString('en-US'),
                    t.description,
                    TYPE_LABELS[t.type],
                    t.reference,
                    t.status,
                    `${isCredit(t.type) ? '+' : '-'}${formatCurrency(t.amount)}`,
                ]),
                styles: { fontSize: 9 },
                headStyles: { fillColor: [15, 76, 129] },
            });
            doc.save(`ewallet-transactions-${new Date().toISOString().slice(0, 10)}.pdf`);
            toast.success('Transaction statement downloaded');
        } catch (err) {
            console.error('[TransactionHistory] ❌ PDF export error:', err);
            toast.error('Failed to export PDF. Please try again.');
        }
        setIsExporting(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Transaction History</h2>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">{loading ? 'Loading...' : `${filtered.length} transactions found`}</p>
                </div>
                <button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="btn-secondary flex items-center gap-2"
                >
                    {isExporting ? <span className="w-4 h-4 border-2 border-[hsl(var(--border))] border-t-[hsl(var(--primary))] rounded-full animate-spin" /> : <Download size={15} />}
                    Export PDF
                </button>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                        <input
                            className="input-field pl-9"
                            placeholder="Search by description, reference, or counterparty..."
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

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Date & Time</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Description</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Counterparty</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Reference</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[hsl(var(--border))]">
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16 text-center">
                                        <Search size={32} className="mx-auto mb-2 text-[hsl(var(--muted-foreground))] opacity-40" />
                                        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">No transactions match your filters</p>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Try adjusting your search or filter criteria</p>
                                    </td>
                                </tr>
                            ) : paginated.map((txn) => (
                                <tr key={txn.id} className="hover:bg-[hsl(var(--muted))] transition-colors">
                                    <td className="px-4 py-3 text-sm text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                                        {new Date(txn.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
                                        <span className="text-xs">{new Date(txn.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-medium text-[hsl(var(--foreground))] max-w-[200px] truncate">{txn.description}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">{TYPE_LABELS[txn.type]}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">{txn.counterparty || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-xs text-[hsl(var(--muted-foreground))]">{txn.reference}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={STATUS_CLASSES[txn.status]}>{txn.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={`text-sm font-bold tabular-nums ${isCredit(txn.type) ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {isCredit(txn.type) ? '+' : '-'}{formatCurrency(txn.amount)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                    </p>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-[hsl(var(--border))] disabled:opacity-40 transition-colors">
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button
                                key={`page-${p}`}
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