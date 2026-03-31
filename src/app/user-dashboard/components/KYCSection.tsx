'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { User } from '@/lib/store';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { Shield, CheckCircle, Clock, XCircle, AlertCircle, Upload, FileText } from 'lucide-react';

interface Props { user: User; onUpdate: () => void; }

const DOC_TYPES = ["Driver\'s License", "Passport", "State ID", "Military ID"];

export default function KYCSection({ user, onUpdate }: Props) {
    const [selectedDoc, setSelectedDoc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Real-time: listen for admin approving or rejecting KYC ─────────────
    useEffect(() => {
        if (user.kycStatus === 'approved' || user.kycStatus === 'not_started') return;
        console.log('[KYCSection] 📡 Watching real-time for KYC status change for user:', user.id);
        const channel = supabase
            .channel(`kyc-watch:${user.id}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'kyc_submissions', filter: `user_id=eq.${user.id}` },
                (payload) => {
                    const updated = payload.new as { status: string };
                    console.log('[KYCSection] 🔄 KYC status changed:', updated.status);
                    if (updated.status === 'approved') {
                        toast.success('🎉 Your identity has been verified! All wallet features are now unlocked.');
                    } else if (updated.status === 'rejected') {
                        toast.error('Your KYC submission was rejected. Please resubmit with clearer documents.');
                    }
                    onUpdate();
                }
            )
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [user.id, user.kycStatus, onUpdate]);

    const handleSubmitKYC = async () => {
        if (!selectedDoc) { toast.error('Please select a document type'); return; }
        console.log('[KYCSection] 📸 Submitting KYC for document type:', selectedDoc);
        setIsSubmitting(true);
        const result = await db.kyc.submit(user.id, selectedDoc);
        setIsSubmitting(false);
        if (result.success) {
            onUpdate();
            toast.success('KYC documents submitted — you\'ll be notified within 1–2 business days');
        } else {
            toast.error(result.error ?? 'Failed to submit KYC. Please try again.');
            console.error('[KYCSection] ❌ KYC submission failed:', result.error);
        }
    };

    const statusConfig = {
        not_started: { icon: AlertCircle, color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200', label: 'Not Started', desc: 'Complete KYC verification to unlock all wallet features including withdrawals and transfers.' },
        submitted: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Submitted — Awaiting Review', desc: 'Your documents have been submitted and are awaiting admin review. This typically takes 1–2 business days.' },
        under_review: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', label: 'Under Review', desc: 'Our compliance team is reviewing your documents. You\'ll receive a notification once the review is complete.' },
        approved: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Verified & Approved', desc: 'Your identity has been verified. All wallet features are now unlocked.' },
        rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Rejected — Resubmission Required', desc: 'Your documents were rejected. Please resubmit with clearer images and ensure all information is visible and valid.' },
    };

    const config = statusConfig[user.kycStatus];
    const StatusIcon = config.icon;

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h2 className="text-2xl font-bold">KYC Verification</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">Identity verification required by FinCEN AML regulations</p>
            </div>

            {/* Status card */}
            <div className={`card p-5 border ${config.bg}`}>
                <div className="flex items-start gap-4">
                    <StatusIcon size={28} className={config.color} />
                    <div className="flex-1">
                        <p className={`font-semibold text-base ${config.color}`}>{config.label}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{config.desc}</p>
                        {user.kycSubmittedAt && (
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                                Submitted: {new Date(user.kycSubmittedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        )}
                        {user.kycDocumentType && (
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Document: {user.kycDocumentType}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Steps */}
            <div className="card p-6">
                <h4 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-5">Verification Process</h4>
                <div className="space-y-4">
                    {[
                        { step: 1, label: 'Submit Government-Issued ID', desc: 'Upload a clear photo of your ID — both front and back', done: user.kycStatus !== 'not_started' },
                        { step: 2, label: 'Admin Review', desc: 'Our compliance team verifies your documents against national databases', done: user.kycStatus === 'approved' || user.kycStatus === 'rejected' },
                        { step: 3, label: 'Verification Complete', desc: 'Full wallet access unlocked — withdrawals, transfers, and high-limit deposits enabled', done: user.kycStatus === 'approved' },
                    ].map((s) => (
                        <div key={`kyc-step-${s.step}`} className="flex items-start gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${s.done ? 'bg-emerald-500 text-white' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}>
                                {s.done ? <CheckCircle size={14} /> : s.step}
                            </div>
                            <div>
                                <p className="text-sm font-semibold">{s.label}</p>
                                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Submission form */}
            {(user.kycStatus === 'not_started' || user.kycStatus === 'rejected') && (
                <div className="card p-6 space-y-5">
                    <h4 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                        {user.kycStatus === 'rejected' ? 'Resubmit KYC Documents' : 'Submit KYC Documents'}
                    </h4>

                    <div>
                        <label className="label">Government ID Type</label>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">Select the type of ID you are submitting</p>
                        <div className="grid grid-cols-2 gap-3">
                            {DOC_TYPES.map(doc => (
                                <button
                                    key={`doc-${doc}`}
                                    type="button"
                                    onClick={() => setSelectedDoc(doc)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-sm font-medium transition-all ${selectedDoc === doc ? 'border-[hsl(var(--primary))] bg-[hsl(214,74%,28%,0.05)] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]'}`}
                                >
                                    <FileText size={16} />
                                    {doc}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-2 border-dashed border-[hsl(var(--border))] rounded-xl p-8 text-center hover:border-[hsl(var(--primary))] transition-colors cursor-pointer">
                        <Upload size={28} className="mx-auto mb-3 text-[hsl(var(--muted-foreground))]" />
                        <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Upload ID Document</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">JPG, PNG, or PDF — max 10MB per file</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Front and back required for Driver's License and State ID</p>
                        <button type="button" className="mt-4 btn-secondary text-xs">Browse Files</button>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-xs font-semibold text-blue-800 mb-1">Document Requirements</p>
                        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                            <li>Document must be valid and not expired</li>
                            <li>All four corners must be visible in the image</li>
                            <li>Text must be clearly legible — no glare or blur</li>
                            <li>Your name and photo must match your account registration</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleSubmitKYC}
                        disabled={isSubmitting || !selectedDoc}
                        className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                    >
                        {isSubmitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</> : <><Shield size={16} /> Submit for Verification</>}
                    </button>
                </div>
            )}
        </div>
    );
}