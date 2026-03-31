'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { User } from '@/lib/store';
import { db } from '@/lib/db';
import { X, Send, DollarSign, CheckCircle, AlertCircle, Search } from 'lucide-react';

interface Props {
    user: User;
    onClose: () => void;
    onSuccess: () => void;
}

export default function TransferModal({ user, onClose, onSuccess }: Props) {
    const [recipientEmail, setRecipientEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [confirming, setConfirming] = useState(false);

    const formatCurrency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

    const handleReview = () => {
        const amt = parseFloat(amount);
        if (!recipientEmail) { setError('Recipient email is required'); return; }
        if (!amount || isNaN(amt) || amt <= 0) { setError('Enter a valid amount'); return; }
        if (amt > user.balance) { setError(`Insufficient balance. Available: ${formatCurrency(user.balance)}`); return; }
        if (recipientEmail === user.email) { setError('You cannot transfer to yourself'); return; }
        setError('');
        setConfirming(true);
    };

    const handleTransfer = async () => {
        console.log('[TransferModal] 🔄 Initiating transfer:', parseFloat(amount), '→', recipientEmail);
        setIsProcessing(true);
        const result = await db.wallet.transfer(user.id, recipientEmail, parseFloat(amount));
        setIsProcessing(false);
        if (result.success) {
            setSuccess(true);
            toast.success(`$${parseFloat(amount).toFixed(2)} transferred successfully`);
        } else {
            setError(result.error || 'Transfer failed');
            setConfirming(false);
            console.error('[TransferModal] ❌ Transfer failed:', result.error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Send size={18} className="text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold">Send Money</h3>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Transfer to another eWallet user</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    {!success ? (
                        !confirming ? (
                            <div className="space-y-5">
                                {user.kycStatus !== 'approved' && (
                                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                                        <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                                        <p className="text-xs text-amber-700">KYC verification required for transfers.</p>
                                    </div>
                                )}

                                <div>
                                    <label className="label">Recipient Email</label>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">Must be a registered eWallet user</p>
                                    <div className="relative">
                                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                                        <input
                                            type="email"
                                            className={`input-field pl-9 ${error && !amount ? 'border-red-400' : ''}`}
                                            placeholder="recipient@example.com"
                                            value={recipientEmail}
                                            onChange={e => { setRecipientEmail(e.target.value); setError(''); }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Amount</label>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">Available: {formatCurrency(user.balance)}</p>
                                    <div className="relative">
                                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                                        <input
                                            type="number"
                                            min="1"
                                            step="0.01"
                                            className={`input-field pl-8 text-lg font-semibold tabular-nums ${error && amount ? 'border-red-400' : ''}`}
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={e => { setAmount(e.target.value); setError(''); }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Note (optional)</label>
                                    <input
                                        className="input-field"
                                        placeholder="e.g., Dinner split, Rent, Gift..."
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                    />
                                </div>

                                {error && <p className="field-error text-sm">{error}</p>}

                                <button
                                    onClick={handleReview}
                                    disabled={user.kycStatus !== 'approved'}
                                    className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                                >
                                    Review Transfer
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="bg-[hsl(var(--muted))] rounded-xl p-5 space-y-3">
                                    <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Transfer Summary</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-[hsl(var(--muted-foreground))]">To</span>
                                        <span className="text-sm font-semibold">{recipientEmail}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-[hsl(var(--muted-foreground))]">Amount</span>
                                        <span className="text-xl font-bold text-[hsl(var(--primary))] tabular-nums">{formatCurrency(parseFloat(amount))}</span>
                                    </div>
                                    {note && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-[hsl(var(--muted-foreground))]">Note</span>
                                            <span className="text-sm font-medium">{note}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between pt-2 border-t border-[hsl(var(--border))]">
                                        <span className="text-sm text-[hsl(var(--muted-foreground))]">Fee</span>
                                        <span className="text-sm font-semibold text-emerald-600">Free</span>
                                    </div>
                                </div>

                                {error && <p className="field-error text-sm">{error}</p>}

                                <div className="flex gap-3">
                                    <button onClick={() => setConfirming(false)} className="btn-secondary flex-1">Edit</button>
                                    <button onClick={handleTransfer} disabled={isProcessing} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                                        {isProcessing ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</> : <>Confirm Send</>}
                                    </button>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-4 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto">
                                <CheckCircle size={28} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-emerald-700">Transfer Sent!</p>
                                <p className="text-2xl font-bold tabular-nums mt-1">{formatCurrency(parseFloat(amount))}</p>
                                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">sent to {recipientEmail}</p>
                            </div>
                            <button onClick={onSuccess} className="btn-primary w-full py-3">Done</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}