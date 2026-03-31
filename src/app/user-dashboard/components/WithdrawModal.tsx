'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { User } from '@/lib/store';
import { db } from '@/lib/db';
import { X, ArrowUpRight, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
    user: User;
    onClose: () => void;
    onSuccess: () => void;
}

export default function WithdrawModal({ user, onClose, onSuccess }: Props) {
    const [amount, setAmount] = useState('');
    const [destination, setDestination] = useState('');
    const [description, setDescription] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [amountError, setAmountError] = useState('');
    const [success, setSuccess] = useState(false);

    const formatCurrency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

    const handleWithdraw = async () => {
        const amt = parseFloat(amount);
        if (!amount || isNaN(amt) || amt <= 0) { setAmountError('Please enter a valid amount'); return; }
        if (amt < 1) { setAmountError('Minimum withdrawal is $1.00'); return; }
        if (amt > user.balance) { setAmountError(`Insufficient balance. Available: ${formatCurrency(user.balance)}`); return; }
        if (amt > 10000) { setAmountError('Maximum single withdrawal is $10,000'); return; }
        if (!destination) { setAmountError('Please enter a destination'); return; }
        setAmountError('');
        console.log('[WithdrawModal] 💸 Processing withdrawal:', amt, '→', destination);
        setIsProcessing(true);
        const result = await db.wallet.withdraw(user.id, amt, description || `Withdrawal to ${destination}`, destination);
        setIsProcessing(false);
        if (result.success) {
            setSuccess(true);
            toast.success(`$${amt.toFixed(2)} withdrawn successfully`);
        } else {
            setAmountError(result.error ?? 'Withdrawal failed. Please try again.');
            toast.error(result.error ?? 'Withdrawal failed. Please try again.');
            console.error('[WithdrawModal] ❌ Withdrawal failed:', result.error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                            <ArrowUpRight size={18} className="text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold">Withdraw Funds</h3>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Available: {formatCurrency(user.balance)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    {!success ? (
                        <div className="space-y-5">
                            {user.kycStatus !== 'approved' && (
                                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                                    <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                                    <p className="text-xs text-amber-700">KYC verification required for withdrawals. Complete your verification in the KYC section.</p>
                                </div>
                            )}

                            <div>
                                <label className="label">Amount to Withdraw</label>
                                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">Max $10,000 per transaction · Available: {formatCurrency(user.balance)}</p>
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
                                    {['100', '250', '500', '1000'].map(v => (
                                        <button key={`wq-${v}`} type="button" onClick={() => setAmount(v)} className="flex-1 text-xs py-1.5 rounded-lg border border-[hsl(var(--border))] hover:border-red-400 hover:text-red-500 font-medium transition-colors">
                                            ${v}
                                        </button>
                                    ))}
                                    <button type="button" onClick={() => setAmount(user.balance.toFixed(2))} className="flex-1 text-xs py-1.5 rounded-lg border border-[hsl(var(--border))] hover:border-red-400 hover:text-red-500 font-medium transition-colors">
                                        Max
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="label">Destination Account / Bank</label>
                                <input
                                    className="input-field"
                                    placeholder="e.g., Chase Bank, Venmo, ****1234"
                                    value={destination}
                                    onChange={e => setDestination(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="label">Notes (optional)</label>
                                <input
                                    className="input-field"
                                    placeholder="e.g., Rent payment, Emergency fund..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleWithdraw}
                                disabled={isProcessing || !amount || user.kycStatus !== 'approved'}
                                className="btn-danger w-full flex items-center justify-center gap-2 py-3"
                            >
                                {isProcessing ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</> : <>Withdraw {amount ? `$${parseFloat(amount).toFixed(2)}` : 'Funds'}</>}
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-4 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto">
                                <CheckCircle size={28} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-emerald-700">Withdrawal Successful!</p>
                                <p className="text-2xl font-bold tabular-nums mt-1">${parseFloat(amount).toFixed(2)}</p>
                                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">sent to {destination}</p>
                            </div>
                            <button onClick={onSuccess} className="btn-primary w-full py-3">Done</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}