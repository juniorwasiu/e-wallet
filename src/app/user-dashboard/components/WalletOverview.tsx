'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, TrendingUp, ArrowUpRight, ArrowDownLeft, Send, CreditCard, Copy, Check, Clock, AlertCircle, ArrowLeftRight } from 'lucide-react';
import { User, AppStore, Transaction } from '@/lib/store';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
    user: User;
    onDeposit: () => void;
    onWithdraw: () => void;
    onTransfer: () => void;
    onViewTransactions: () => void;
}

const CHART_DATA = [
    { date: 'Mar 1', balance: 1200 },
    { date: 'Mar 5', balance: 1850 },
    { date: 'Mar 10', balance: 3200 },
    { date: 'Mar 15', balance: 2800 },
    { date: 'Mar 18', balance: 3100 },
    { date: 'Mar 22', balance: 2950 },
    { date: 'Mar 25', balance: 3800 },
    { date: 'Mar 28', balance: 4250.75 },
];

export default function WalletOverview({ user, onDeposit, onWithdraw, onTransfer, onViewTransactions }: Props) {
    const [balanceHidden, setBalanceHidden] = useState(false);
    const [copiedAccount, setCopiedAccount] = useState(false);
    const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);

    useEffect(() => {
        const txns = AppStore.getTransactions(user.id).slice(0, 5);
        setRecentTxns(txns);
    }, [user.id]);

    const handleCopyAccount = () => {
        if (user.depositAccountNumber) {
            navigator.clipboard.writeText(user.depositAccountNumber);
            setCopiedAccount(true);
            setTimeout(() => setCopiedAccount(false), 2000);
        }
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const getTxnIcon = (type: Transaction['type']) => {
        switch (type) {
            case 'deposit': case 'transfer_in': return <ArrowDownLeft size={14} className="text-emerald-600" />;
            case 'withdrawal': case 'transfer_out': case 'payment': return <ArrowUpRight size={14} className="text-red-500" />;
        }
    };

    const isCredit = (type: Transaction['type']) => type === 'deposit' || type === 'transfer_in';
    const kycWarning = user.kycStatus !== 'approved';

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* KYC warning banner */}
            {kycWarning && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-amber-800">
                            {user.kycStatus === 'not_started' ? 'Complete KYC to unlock full access' :
                                user.kycStatus === 'submitted' ? 'KYC submitted — awaiting admin review' :
                                    user.kycStatus === 'under_review' ? 'KYC under review — withdrawals limited' : 'KYC rejected — please resubmit your documents'}
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">Deposits are available. Withdrawals and transfers require KYC approval.</p>
                    </div>
                    {user.kycStatus === 'not_started' && (
                        <button className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-700 transition-colors shrink-0">
                            Start KYC
                        </button>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Balance hero card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-[hsl(214,74%,18%)] via-[hsl(214,74%,24%)] to-[hsl(214,74%,30%)] rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <p className="text-blue-300 text-sm font-medium">Available Balance</p>
                                <p className="text-blue-200 text-xs mt-0.5">eWallet — Personal Account</p>
                            </div>
                            <button onClick={() => setBalanceHidden(b => !b)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                                {balanceHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        <div className="mb-5">
                            <p className="text-3xl sm:text-4xl font-bold tabular-nums tracking-tight">
                                {balanceHidden ? '••••••' : formatCurrency(user.balance)}
                            </p>
                            <div className="flex items-center gap-1.5 mt-2">
                                <TrendingUp size={14} className="text-emerald-400" />
                                <span className="text-emerald-400 text-sm font-semibold">+$2,300.00 this month</span>
                            </div>
                        </div>

                        {user.depositAccountNumber && (
                            <div className="flex items-center gap-3 bg-white/10 rounded-xl px-3 sm:px-4 py-3 mb-5">
                                <div className="flex-1 min-w-0">
                                    <p className="text-blue-300 text-xs font-medium">Account Number</p>
                                    <p className="font-mono text-sm font-semibold mt-0.5 truncate">
                                        {balanceHidden ? '•••• •••• ••••' : `${user.depositAccountNumber?.slice(0, 4)} ${user.depositAccountNumber?.slice(4, 8)} ${user.depositAccountNumber?.slice(8)}`}
                                    </p>
                                </div>
                                <div className="shrink-0">
                                    <p className="text-blue-300 text-xs font-medium">Routing</p>
                                    <p className="font-mono text-sm font-semibold mt-0.5">{balanceHidden ? '•••••••••' : user.depositRoutingNumber}</p>
                                </div>
                                <button onClick={handleCopyAccount} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors shrink-0">
                                    {copiedAccount ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                </button>
                            </div>
                        )}

                        {/* Quick actions */}
                        <div className="grid grid-cols-4 gap-2 sm:gap-3">
                            {[
                                { label: 'Deposit', icon: ArrowDownLeft, action: onDeposit, color: 'bg-emerald-500/20 hover:bg-emerald-500/30' },
                                { label: 'Withdraw', icon: ArrowUpRight, action: onWithdraw, color: 'bg-red-500/20 hover:bg-red-500/30', disabled: user.kycStatus !== 'approved' },
                                { label: 'Transfer', icon: Send, action: onTransfer, color: 'bg-blue-500/20 hover:bg-blue-500/30', disabled: user.kycStatus !== 'approved' },
                                { label: 'Pay', icon: CreditCard, action: () => { }, color: 'bg-purple-500/20 hover:bg-purple-500/30', disabled: user.kycStatus !== 'approved' },
                            ].map((btn) => (
                                <button
                                    key={`action-${btn.label}`}
                                    onClick={btn.action}
                                    disabled={btn.disabled}
                                    className={`${btn.color} rounded-xl p-2.5 sm:p-3 flex flex-col items-center gap-1 sm:gap-1.5 transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed`}
                                >
                                    <btn.icon size={16} />
                                    <span className="text-[10px] sm:text-xs font-semibold">{btn.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stats column */}
                <div className="space-y-4">
                    <div className="card p-4">
                        <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-3">This Month</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                        <ArrowDownLeft size={14} className="text-emerald-600" />
                                    </div>
                                    <span className="text-sm font-medium">Total In</span>
                                </div>
                                <span className="text-sm font-bold text-emerald-600 tabular-nums">+$4,250.00</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                                        <ArrowUpRight size={14} className="text-red-500" />
                                    </div>
                                    <span className="text-sm font-medium">Total Out</span>
                                </div>
                                <span className="text-sm font-bold text-red-500 tabular-nums">-$1,085.99</span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-[hsl(var(--border))]">
                                <span className="text-sm font-semibold">Net Change</span>
                                <span className="text-sm font-bold text-[hsl(var(--primary))] tabular-nums">+$3,164.01</span>
                            </div>
                        </div>
                    </div>

                    <div className="card p-4">
                        <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-3">Account Status</p>
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[hsl(var(--muted-foreground))]">KYC Status</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${user.kycStatus === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                                        user.kycStatus === 'rejected' ? 'bg-red-50 text-red-700' :
                                            user.kycStatus === 'not_started' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700'
                                    }`}>
                                    {user.kycStatus.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[hsl(var(--muted-foreground))]">Deposit Account</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${user.depositAccountStatus === 'active' ? 'bg-emerald-50 text-emerald-700' :
                                        user.depositAccountStatus === 'requested' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {user.depositAccountStatus === 'not_requested' ? 'Not Set Up' : user.depositAccountStatus.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[hsl(var(--muted-foreground))]">Deposit Type</span>
                                <span className="text-xs font-semibold text-[hsl(var(--foreground))]">
                                    {user.depositType ? (user.depositType === 'direct_deposit' ? 'Direct Deposit' : 'ACH Transfer') : '—'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {user.depositAccountStatus === 'requested' && (
                        <div className="card p-4 border-amber-200 bg-amber-50">
                            <div className="flex items-start gap-2">
                                <Clock size={16} className="text-amber-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-amber-800">Account Setup Pending</p>
                                    <p className="text-xs text-amber-700 mt-1">Your {user.depositType === 'ach' ? 'ACH' : 'Direct Deposit'} account is being set up. Typically 1–2 business days.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Balance chart */}
            <div className="card p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">Balance History</h3>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">March 2026</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                        <TrendingUp size={14} />
                        <span className="text-xs font-semibold">+254% this month</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={CHART_DATA}>
                        <defs>
                            <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(214,74%,28%)" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="hsl(214,74%,28%)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,88%)" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(220,10%,48%)' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(220,10%,48%)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null;
                                return (
                                    <div className="bg-white border border-[hsl(var(--border))] rounded-lg px-3 py-2 shadow-lg">
                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
                                        <p className="text-sm font-bold text-[hsl(var(--primary))]">${payload[0].value?.toLocaleString()}</p>
                                    </div>
                                );
                            }}
                        />
                        <Area type="monotone" dataKey="balance" stroke="hsl(214,74%,28%)" strokeWidth={2} fill="url(#balanceGrad)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Recent transactions */}
            {recentTxns.length > 0 && (
                <div className="card p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">Recent Transactions</h3>
                        <button onClick={onViewTransactions} className="text-xs font-semibold text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
                            View all <ArrowLeftRight size={12} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {recentTxns.map((txn) => (
                            <div key={txn.id} className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isCredit(txn.type) ? 'bg-emerald-50' : 'bg-red-50'}`}>
                                    {getTxnIcon(txn.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{txn.description}</p>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{new Date(txn.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                </div>
                                <span className={`text-sm font-bold tabular-nums shrink-0 ${isCredit(txn.type) ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {isCredit(txn.type) ? '+' : '-'}{formatCurrency(txn.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}