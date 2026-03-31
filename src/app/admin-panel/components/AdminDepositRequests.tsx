'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { db } from '@/lib/db';
import type { DepositAccountRow, ProfileRow } from '@/lib/database.types';
import { Building2, CheckCircle, Clock, CreditCard, Hash } from 'lucide-react';

interface Props { onRefresh: () => void; adminId: string; }

interface GenerateForm {
    accountNumber: string;
    routingNumber: string;
    bankName: string;
}

type DepositEntry = DepositAccountRow & { profile: ProfileRow };

export default function AdminDepositRequests({ onRefresh, adminId }: Props) {
    const [entries, setEntries] = useState<DepositEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [generatingFor, setGeneratingFor] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<GenerateForm>({
        defaultValues: { bankName: 'eWallet Bank', routingNumber: '021000021' }
    });

    const loadEntries = useCallback(async () => {
        console.log('[AdminDeposit] 📋 Loading deposit account requests...');
        setLoading(true);
        const data = await db.depositAccounts.getPending();
        setEntries(data as DepositEntry[]);
        setLoading(false);
        console.log('[AdminDeposit] ✅ Loaded', data.length, 'pending deposit requests');
        onRefresh();
    }, [onRefresh]);

    useEffect(() => { loadEntries(); }, [loadEntries]);

    const handleGenerate = async (data: GenerateForm) => {
        if (!generatingFor) return;
        const entry = entries.find(e => e.id === generatingFor);
        if (!entry) return;
        console.log('[AdminDeposit] 🏦 Generating account for entry:', generatingFor);
        setIsSubmitting(true);
        const ok = await db.depositAccounts.activate({
            accountId: entry.id,
            userId: entry.user_id,
            adminId,
            accountNumber: data.accountNumber,
            routingNumber: data.routingNumber,
            bankName: data.bankName,
        });
        setIsSubmitting(false);
        if (ok) {
            loadEntries();
            setGeneratingFor(null);
            reset({ bankName: 'eWallet Bank', routingNumber: '021000021' });
            toast.success('Deposit account generated — user will be notified in real-time');
        } else {
            toast.error('Failed to generate account. Please try again.');
            console.error('[AdminDeposit] ❌ Account generation failed');
        }
    };

    const generateRandomAccount = () => {
        const acc = String(Math.floor(1000000000 + Math.random() * 9000000000));
        setValue('accountNumber', acc);
    };

    const pending = entries.filter(e => e.status === 'requested');
    const active = entries.filter(e => e.status === 'active');

    if (loading) {
        return (
            <div className="card p-16 text-center">
                <div className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading deposit requests...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Deposit Account Requests</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">Generate bank account details for users awaiting deposit setup</p>
            </div>

            {pending.length === 0 && (
                <div className="card p-8 text-center border-emerald-200 bg-emerald-50">
                    <CheckCircle size={32} className="mx-auto mb-2 text-emerald-600" />
                    <p className="text-base font-semibold text-emerald-700">All deposit requests processed</p>
                    <p className="text-sm text-emerald-600 mt-1">No pending account generation requests</p>
                </div>
            )}

            {pending.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Clock size={16} className="text-amber-600" />
                        <h3 className="text-sm font-semibold text-amber-700">Pending Setup ({pending.length})</h3>
                    </div>
                    <div className="space-y-4">
                        {pending.map((entry) => (
                            <div key={entry.id} className="card p-5 border-amber-200 bg-amber-50/30">
                                <div className="flex items-start gap-4 mb-4">
                                    <div
                                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                                        style={{ backgroundColor: entry.profile?.avatar_color ?? '#0f4c81' }}
                                    >
                                        {entry.profile?.first_name[0]}{entry.profile?.last_name[0]}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold">{entry.profile?.first_name} {entry.profile?.last_name}</p>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{entry.profile?.email}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="badge-warning">{entry.deposit_type === 'ach' ? 'ACH Transfer' : 'Direct Deposit'}</span>
                                            <span className="text-xs text-[hsl(var(--muted-foreground))]">Requested: {new Date(entry.requested_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>

                                {generatingFor === entry.id ? (
                                    <form onSubmit={handleSubmit(handleGenerate)} className="space-y-4 border-t border-amber-200 pt-4">
                                        <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                                            Generate Account Details for {entry.profile?.first_name}
                                        </p>

                                        <div>
                                            <label className="label">Account Number</label>
                                            <div className="flex gap-2">
                                                <input
                                                    className={`input-field flex-1 font-mono ${errors.accountNumber ? 'border-red-400' : ''}`}
                                                    placeholder="10-digit account number"
                                                    {...register('accountNumber', {
                                                        required: 'Account number required',
                                                        pattern: { value: /^\d{8,12}$/, message: '8–12 digit number' }
                                                    })}
                                                />
                                                <button type="button" onClick={generateRandomAccount} className="btn-secondary px-3 text-xs">
                                                    <Hash size={14} />
                                                </button>
                                            </div>
                                            {errors.accountNumber && <p className="field-error">{errors.accountNumber.message}</p>}
                                        </div>

                                        <div>
                                            <label className="label">Routing Number</label>
                                            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">9-digit ABA routing number</p>
                                            <input
                                                className={`input-field font-mono ${errors.routingNumber ? 'border-red-400' : ''}`}
                                                placeholder="021000021"
                                                {...register('routingNumber', {
                                                    required: 'Routing number required',
                                                    pattern: { value: /^\d{9}$/, message: '9-digit routing number' }
                                                })}
                                            />
                                            {errors.routingNumber && <p className="field-error">{errors.routingNumber.message}</p>}
                                        </div>

                                        <div>
                                            <label className="label">Bank Name</label>
                                            <input
                                                className="input-field"
                                                {...register('bankName', { required: 'Bank name required' })}
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <button type="button" onClick={() => setGeneratingFor(null)} className="btn-secondary flex-1">Cancel</button>
                                            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                                {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Building2 size={15} />}
                                                Generate &amp; Activate
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <button
                                        onClick={() => { setGeneratingFor(entry.id); generateRandomAccount(); }}
                                        className="btn-primary w-full flex items-center justify-center gap-2"
                                    >
                                        <CreditCard size={15} />
                                        Generate Account Details
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {active.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <CheckCircle size={16} className="text-emerald-600" />
                        <h3 className="text-sm font-semibold text-emerald-700">Active Accounts ({active.length})</h3>
                    </div>
                    <div className="card overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
                                    {['User', 'Type', 'Account Number', 'Routing Number', 'Bank', 'Activated', 'Status'].map(h => (
                                        <th key={`dh-${h}`} className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[hsl(var(--border))]">
                                {active.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-[hsl(var(--muted))] transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-semibold">{entry.profile?.first_name} {entry.profile?.last_name}</p>
                                            <p className="text-xs text-[hsl(var(--muted-foreground))]">{entry.profile?.email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-xs font-medium">{entry.deposit_type === 'ach' ? 'ACH' : 'Direct Deposit'}</td>
                                        <td className="px-4 py-3 font-mono text-sm">{entry.account_number}</td>
                                        <td className="px-4 py-3 font-mono text-sm">{entry.routing_number}</td>
                                        <td className="px-4 py-3 text-sm">{entry.bank_name}</td>
                                        <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                                            {entry.activated_at ? new Date(entry.activated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                                        </td>
                                        <td className="px-4 py-3"><span className="badge-success">Active</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}