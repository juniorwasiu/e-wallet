'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { User } from '@/lib/store';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import type { DepositAccountRow } from '@/lib/database.types';
import { X, ArrowDownLeft, Building2, CreditCard, Clock, CheckCircle, DollarSign, RefreshCw } from 'lucide-react';

interface Props {
    user: User;
    onClose: () => void;
    onSuccess: () => void;
}

type DepositStep = 'select_type' | 'direct_deposit_info' | 'ach_info' | 'amount_entry' | 'waiting' | 'success';

export default function DepositModal({ user, onClose, onSuccess }: Props) {
    const [step, setStep] = useState<DepositStep>(() => {
        if (user.depositAccountStatus === 'active') return 'amount_entry';
        if (user.depositAccountStatus === 'requested') return 'waiting';
        return 'select_type';
    });
    const [selectedType, setSelectedType] = useState<'direct_deposit' | 'ach' | null>(user.depositType || null);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [amountError, setAmountError] = useState('');
    const [depositAccount, setDepositAccount] = useState<DepositAccountRow | null>(null);

    // ── Load deposit account from Supabase ──────────────────────────────────
    useEffect(() => {
        if (user.depositAccountStatus !== 'active' && user.depositAccountStatus !== 'requested') return;
        console.log('[DepositModal] 📖 Loading deposit account for user:', user.id);
        db.depositAccounts.getForUser(user.id).then(acc => {
            if (acc) {
                console.log('[DepositModal] ✅ Deposit account loaded:', acc.id, '| status:', acc.status);
                setDepositAccount(acc);
            }
        });
    }, [user.id, user.depositAccountStatus]);

    // ── Real-time: listen for admin activating the deposit account ──────────
    useEffect(() => {
        if (step !== 'waiting') return;
        console.log('[DepositModal] 📡 Starting real-time watch for deposit account activation');
        const channel = supabase
            .channel(`deposit-watch:${user.id}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'deposit_accounts', filter: `user_id=eq.${user.id}` },
                (payload) => {
                    const updated = payload.new as DepositAccountRow;
                    console.log('[DepositModal] 🔄 Deposit account updated — new status:', updated.status);
                    if (updated.status === 'active') {
                        setDepositAccount(updated);
                        setStep('amount_entry');
                        toast.success('🎉 Your deposit account is ready! You can now add funds.');
                    }
                }
            )
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [step, user.id]);

    const handleSelectType = (type: 'direct_deposit' | 'ach') => {
        setSelectedType(type);
        setStep(type === 'direct_deposit' ? 'direct_deposit_info' : 'ach_info');
    };

    const handleRequestAccount = async () => {
        if (!selectedType) return;
        console.log('[DepositModal] 📬 Requesting deposit account — type:', selectedType);
        setIsProcessing(true);
        const result = await db.depositAccounts.request(user.id, selectedType);
        setIsProcessing(false);
        if (result.success) {
            setStep('waiting');
            toast.success('Deposit account request submitted — admin will generate your account details shortly');
        } else {
            toast.error(result.error ?? 'Failed to request deposit account');
            console.error('[DepositModal] ❌ Request failed:', result.error);
        }
    };

    const handleDeposit = async () => {
        const amt = parseFloat(amount);
        if (!amount || isNaN(amt) || amt <= 0) { setAmountError('Please enter a valid amount'); return; }
        if (amt < 1) { setAmountError('Minimum deposit is $1.00'); return; }
        if (amt > 50000) { setAmountError('Maximum single deposit is $50,000'); return; }
        setAmountError('');
        console.log('[DepositModal] 💵 Processing deposit:', amt);
        setIsProcessing(true);
        const result = await db.wallet.deposit(user.id, amt, description || 'Wallet Deposit', 'eWallet');
        setIsProcessing(false);
        if (result.success) {
            setStep('success');
            toast.success(`$${amt.toFixed(2)} added to your wallet`);
        } else {
            setAmountError(result.error ?? 'Deposit failed. Please try again.');
            console.error('[DepositModal] ❌ Deposit failed:', result.error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <ArrowDownLeft size={18} className="text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold">Add Funds</h3>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Deposit to your eWallet</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Step: Select type */}
                    {step === 'select_type' && (
                        <div className="space-y-4">
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Choose how you'd like to deposit funds into your wallet.</p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => handleSelectType('direct_deposit')}
                                    className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(214,74%,28%,0.03)] transition-all text-left group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary))]/10 flex items-center justify-center shrink-0 group-hover:bg-[hsl(var(--primary))]/20 transition-colors">
                                        <Building2 size={18} className="text-[hsl(var(--primary))]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Direct Deposit</p>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Receive payroll, government benefits, or recurring payments directly into your wallet. Get a dedicated account and routing number.</p>
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Recommended</span>
                                            <span className="text-xs text-[hsl(var(--muted-foreground))]">· No fees</span>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleSelectType('ach')}
                                    className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(214,74%,28%,0.03)] transition-all text-left group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 group-hover:bg-purple-100 transition-colors">
                                        <CreditCard size={18} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">ACH Bank Transfer</p>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Link your external bank account and pull funds via ACH. Transfers typically settle in 1–3 business days.</p>
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <span className="text-xs text-[hsl(var(--muted-foreground))]">1–3 business days · No fees</span>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step: Direct deposit info */}
                    {step === 'direct_deposit_info' && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-sm font-semibold text-blue-800 mb-2">How Direct Deposit Works</p>
                                <ol className="text-xs text-blue-700 space-y-1.5 list-decimal list-inside">
                                    <li>We'll generate a dedicated bank account and routing number for you</li>
                                    <li>Provide these details to your employer or payment source</li>
                                    <li>Funds are deposited directly into your eWallet each pay period</li>
                                    <li>Receive instant notifications when funds arrive</li>
                                </ol>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                                <Clock size={15} className="text-amber-600 mt-0.5 shrink-0" />
                                <p className="text-xs text-amber-700">Account generation typically takes 1–2 business hours. You'll receive an email notification once your account is ready.</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setStep('select_type')} className="btn-secondary flex-1">Back</button>
                                <button onClick={handleRequestAccount} disabled={isProcessing} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                    {isProcessing ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                    Request Account
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step: ACH info */}
                    {step === 'ach_info' && (
                        <div className="space-y-4">
                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                <p className="text-sm font-semibold text-purple-800 mb-2">How ACH Transfer Works</p>
                                <ol className="text-xs text-purple-700 space-y-1.5 list-decimal list-inside">
                                    <li>We generate a unique ACH routing and account number for your wallet</li>
                                    <li>Log into your bank and set up a transfer to this account</li>
                                    <li>Funds settle in 1–3 business days (same-day ACH available)</li>
                                    <li>Use the same account details for recurring transfers</li>
                                </ol>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                                <Clock size={15} className="text-amber-600 mt-0.5 shrink-0" />
                                <p className="text-xs text-amber-700">Your ACH account details will be ready within 1–2 business hours after admin approval.</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setStep('select_type')} className="btn-secondary flex-1">Back</button>
                                <button onClick={handleRequestAccount} disabled={isProcessing} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                    {isProcessing ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                    Request ACH Account
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step: Waiting for account */}
                    {step === 'waiting' && (
                        <div className="text-center py-4 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto">
                                <Clock size={28} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="text-base font-semibold">Account Setup In Progress</p>
                                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                                    Your {user.depositType === 'ach' ? 'ACH' : 'Direct Deposit'} account is being set up by our operations team.
                                </p>
                            </div>
                            <div className="bg-[hsl(var(--muted))] rounded-xl p-4 text-left space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[hsl(var(--muted-foreground))]">Account Type</span>
                                    <span className="font-semibold">{user.depositType === 'ach' ? 'ACH Transfer' : 'Direct Deposit'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[hsl(var(--muted-foreground))]">Status</span>
                                    <span className="badge-warning">Pending Setup</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[hsl(var(--muted-foreground))]">Est. Ready</span>
                                    <span className="font-semibold">1–2 business hours</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <RefreshCw size={13} className="text-blue-500 animate-spin shrink-0" />
                                <span>This page will automatically update when your account is ready — no need to refresh.</span>
                            </div>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">You'll receive an email at {user.email} once your account details are ready.</p>
                            <button onClick={onClose} className="btn-secondary w-full">Close</button>
                        </div>
                    )}

                    {/* Step: Amount entry (account is active) */}
                    {step === 'amount_entry' && (
                        <div className="space-y-5">
                            {depositAccount && depositAccount.account_number && (
                                <div className="bg-[hsl(var(--muted))] rounded-xl p-4 space-y-2">
                                    <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Your Deposit Account</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-[hsl(var(--muted-foreground))]">Account Number</span>
                                        <span className="font-mono text-sm font-semibold">{depositAccount.account_number}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-[hsl(var(--muted-foreground))]">Routing Number</span>
                                        <span className="font-mono text-sm font-semibold">{depositAccount.routing_number}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-[hsl(var(--muted-foreground))]">Bank</span>
                                        <span className="text-sm font-semibold">{depositAccount.bank_name}</span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="label">Deposit Amount</label>
                                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">Min $1.00 · Max $50,000 per transaction</p>
                                <div className="relative">
                                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        className={`input-field pl-8 text-lg font-semibold tabular-nums ${amountError ? 'border-red-400' : ''}`}
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={e => { setAmount(e.target.value); setAmountError(''); }}
                                    />
                                </div>
                                {amountError && <p className="field-error">{amountError}</p>}
                                <div className="flex gap-2 mt-2">
                                    {['50', '100', '500', '1000'].map(v => (
                                        <button key={`quick-${v}`} type="button" onClick={() => setAmount(v)} className="flex-1 text-xs py-1.5 rounded-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] font-medium transition-colors">
                                            ${v}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="label">Description (optional)</label>
                                <input
                                    className="input-field"
                                    placeholder="e.g., Payroll, Savings transfer..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleDeposit}
                                disabled={isProcessing || !amount}
                                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                            >
                                {isProcessing ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</> : <>Deposit {amount ? `$${parseFloat(amount).toFixed(2)}` : 'Funds'}</>}
                            </button>
                        </div>
                    )}

                    {/* Step: Success */}
                    {step === 'success' && (
                        <div className="text-center py-4 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto">
                                <CheckCircle size={28} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-emerald-700">Deposit Successful!</p>
                                <p className="text-2xl font-bold tabular-nums mt-1">${parseFloat(amount).toFixed(2)}</p>
                                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">has been added to your wallet</p>
                            </div>
                            <button onClick={onSuccess} className="btn-primary w-full py-3">Done</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}