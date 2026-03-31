'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { db } from '@/lib/db';
import type { KYCSubmissionRow, ProfileRow } from '@/lib/database.types';
import { Shield, CheckCircle, XCircle, Clock, FileText, AlertCircle } from 'lucide-react';

interface Props { onRefresh: () => void; adminId: string; }

type KYCEntry = KYCSubmissionRow & { profile: ProfileRow };

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
    submitted: { label: 'Submitted', cls: 'badge-info' },
    under_review: { label: 'Under Review', cls: 'badge-warning' },
    approved: { label: 'Approved', cls: 'badge-success' },
    rejected: { label: 'Rejected', cls: 'badge-danger' },
};

export default function AdminKYCQueue({ onRefresh, adminId }: Props) {
    const [entries, setEntries] = useState<KYCEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isActioning, setIsActioning] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('pending');

    const refresh = useCallback(async () => {
        console.log('[AdminKYCQueue] 🔄 Loading KYC submissions... filter:', filterStatus);
        setLoading(true);
        if (filterStatus === 'all' || filterStatus === 'pending') {
            const data = await db.kyc.getPending();
            setEntries(data as KYCEntry[]);
            console.log('[AdminKYCQueue] ✅ Loaded', data.length, 'pending KYC entries');
        } else {
            // Approved / rejected: load from profiles table
            const allProfiles = await db.profiles.listAll();
            const mapped = allProfiles
                .filter(p => p.kyc_status === filterStatus)
                .map(p => ({
                    id: `profile-${p.id}`,
                    user_id: p.id,
                    document_type: p.kyc_document_type ?? 'Unknown',
                    document_url: null,
                    status: p.kyc_status,
                    admin_notes: null,
                    submitted_at: p.kyc_submitted_at ?? p.created_at,
                    reviewed_at: null,
                    reviewed_by: null,
                    profile: p,
                } as KYCEntry));
            setEntries(mapped);
        }
        setLoading(false);
        onRefresh();
    }, [filterStatus, onRefresh]);

    useEffect(() => { refresh(); }, [refresh]);

    const handleApprove = async (entry: KYCEntry) => {
        setIsActioning(entry.user_id + '-approve');
        console.log('[AdminKYCQueue] ✅ Approving KYC for user:', entry.user_id);
        const ok = await db.kyc.approve(entry.id, entry.user_id, adminId);
        setIsActioning(null);
        if (ok) { toast.success('KYC approved — user notified'); refresh(); }
        else toast.error('Failed to approve KYC. Please try again.');
    };

    const handleReject = async (entry: KYCEntry) => {
        setIsActioning(entry.user_id + '-reject');
        console.log('[AdminKYCQueue] ❌ Rejecting KYC for user:', entry.user_id);
        const ok = await db.kyc.reject(entry.id, entry.user_id, adminId, undefined);
        setIsActioning(null);
        if (ok) { toast.error('KYC rejected — user will be notified to resubmit'); refresh(); }
        else toast.error('Failed to reject KYC. Please try again.');
    };

    const filtered = filterStatus === 'pending'
        ? entries.filter(e => e.status === 'submitted' || e.status === 'under_review')
        : filterStatus === 'all' ? entries
        : entries.filter(e => e.status === filterStatus);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">KYC Verification Queue</h2>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">Review and approve identity verification submissions</p>
                </div>
                <div className="flex items-center gap-2">
                    {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
                        <button
                            key={`kf-${f}`}
                            onClick={() => setFilterStatus(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === f ? 'bg-[hsl(var(--primary))] text-white' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--border))]'}`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="card p-16 text-center">
                    <div className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading KYC submissions...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="card p-16 text-center">
                    <Shield size={40} className="mx-auto mb-3 text-[hsl(var(--muted-foreground))] opacity-30" />
                    <p className="text-base font-semibold text-[hsl(var(--muted-foreground))]">No KYC submissions in this category</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filtered.map((entry) => (
                        <div key={entry.id} className={`card p-5 ${(entry.status === 'submitted' || entry.status === 'under_review') ? 'border-amber-200' : ''}`}>
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0"
                                    style={{ backgroundColor: entry.profile?.avatar_color ?? '#0f4c81' }}
                                >
                                    {entry.profile?.first_name[0]}{entry.profile?.last_name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-semibold">{entry.profile?.first_name} {entry.profile?.last_name}</p>
                                        <span className={STATUS_CONFIG[entry.status]?.cls}>{STATUS_CONFIG[entry.status]?.label}</span>
                                    </div>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{entry.profile?.email}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                                        <span className="flex items-center gap-1"><FileText size={12} />{entry.document_type || 'Unknown doc'}</span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(entry.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 bg-[hsl(var(--muted))] rounded-xl p-4">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                                    <div><span className="text-[hsl(var(--muted-foreground))]">DOB: </span><span className="font-medium">{entry.profile?.dob ? new Date(entry.profile.dob).toLocaleDateString('en-US') : '—'}</span></div>
                                    <div><span className="text-[hsl(var(--muted-foreground))]">SSN: </span><span className="font-mono font-medium">••• - •• - {entry.profile?.ssn_last4}</span></div>
                                    <div><span className="text-[hsl(var(--muted-foreground))]">Phone: </span><span className="font-medium">{entry.profile?.phone}</span></div>
                                    <div><span className="text-[hsl(var(--muted-foreground))]">State: </span><span className="font-medium">{entry.profile?.city}, {entry.profile?.state}</span></div>
                                    <div className="col-span-2"><span className="text-[hsl(var(--muted-foreground))]">Address: </span><span className="font-medium">{entry.profile?.address}, {entry.profile?.zip}</span></div>
                                </div>
                            </div>

                            {(entry.status === 'submitted' || entry.status === 'under_review') && (
                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={() => handleReject(entry)}
                                        disabled={!!isActioning}
                                        className="btn-danger flex-1 flex items-center justify-center gap-2"
                                    >
                                        {isActioning === entry.user_id + '-reject'
                                            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : <XCircle size={15} />}
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleApprove(entry)}
                                        disabled={!!isActioning}
                                        className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isActioning === entry.user_id + '-approve'
                                            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : <CheckCircle size={15} />}
                                        Approve KYC
                                    </button>
                                </div>
                            )}

                            {entry.status === 'approved' && (
                                <div className="flex items-center gap-2 mt-4 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                                    <CheckCircle size={14} className="text-emerald-600" />
                                    <span className="text-xs font-semibold text-emerald-700">Verified &amp; Approved</span>
                                </div>
                            )}

                            {entry.status === 'rejected' && (
                                <div className="flex items-center gap-2 mt-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                    <AlertCircle size={14} className="text-red-600" />
                                    <span className="text-xs font-semibold text-red-700">Rejected — User notified to resubmit</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}