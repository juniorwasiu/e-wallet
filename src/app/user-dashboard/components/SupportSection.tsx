'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { User } from '@/lib/store';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import type { TicketWithReplies } from '@/lib/database.types';
import { HeadphonesIcon, Plus, MessageSquare, CheckCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';

interface Props { user: User; }

const CATEGORIES = ['Deposits', 'Withdrawals', 'Transfers', 'KYC & Verification', 'Account Setup', 'Other'];

const STATUS_CLASSES: Record<TicketWithReplies['status'], string> = {
    open: 'badge-danger',
    in_progress: 'badge-warning',
    resolved: 'badge-success',
    closed: 'badge-neutral',
};

export default function SupportSection({ user }: Props) {
    const [tickets, setTickets] = useState<TicketWithReplies[]>([]);
    const [showNewForm, setShowNewForm] = useState(false);
    const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<{ subject: string; category: string; message: string }>();

    const refreshTickets = async () => {
        console.log('[SupportSection] 🔄 Refreshing tickets for user:', user.id);
        const data = await db.tickets.forUser(user.id);
        setTickets(data);
    };

    useEffect(() => {
        console.log('[SupportSection] 📖 Loading tickets for user:', user.id);
        setLoading(true);
        db.tickets.forUser(user.id).then(data => {
            setTickets(data);
            setLoading(false);
            console.log('[SupportSection] ✅ Loaded', data.length, 'tickets');
        });
    }, [user.id]);

    // ── Real-time: get notified when admin replies to a ticket ────────────
    useEffect(() => {
        console.log('[SupportSection] 📡 Setting up real-time reply listener');
        const channel = supabase
            .channel(`ticket-replies:${user.id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'ticket_replies' },
                async (payload) => {
                    const reply = payload.new as { is_admin: boolean; author_name: string };
                    if (reply.is_admin) {
                        console.log('[SupportSection] 💬 New admin reply received from:', reply.author_name);
                        toast.success(`💬 New reply from ${reply.author_name}`);
                        await refreshTickets();
                    }
                }
            )
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.id]);

    const onSubmitTicket = async (data: { subject: string; category: string; message: string }) => {
        console.log('[SupportSection] 🎟️ Submitting ticket:', data.subject);
        setIsSubmitting(true);
        const result = await db.tickets.create({ userId: user.id, subject: data.subject, category: data.category, message: data.message });
        setIsSubmitting(false);
        if (result.success) {
            await refreshTickets();
            setShowNewForm(false);
            reset();
            toast.success('Support ticket submitted — we\'ll respond within 4 business hours');
        } else {
            toast.error(result.error ?? 'Failed to submit ticket. Please try again.');
            console.error('[SupportSection] ❌ Ticket submission failed:', result.error);
        }
    };

    const handleReply = async (ticketId: string) => {
        if (!replyText.trim()) return;
        console.log('[SupportSection] 💬 Sending user reply to ticket:', ticketId);
        setIsReplying(true);
        const result = await db.tickets.reply({ ticketId, message: replyText, isAdmin: false, authorName: `${user.firstName} ${user.lastName}`, authorId: user.id });
        setIsReplying(false);
        if (result.success) {
            await refreshTickets();
            setReplyText('');
            toast.success('Reply sent');
        } else {
            toast.error(result.error ?? 'Failed to send reply');
            console.error('[SupportSection] ❌ Reply failed:', result.error);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Support</h2>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">Get help with your wallet account</p>
                </div>
                <button onClick={() => setShowNewForm(f => !f)} className="btn-primary flex items-center gap-2">
                    <Plus size={15} /> New Ticket
                </button>
            </div>

            {/* New ticket form */}
            {showNewForm && (
                <div className="card p-6 border-[hsl(var(--primary))] border-2">
                    <h4 className="text-base font-semibold mb-4">Submit a Support Request</h4>
                    <form onSubmit={handleSubmit(onSubmitTicket)} className="space-y-4">
                        <div>
                            <label className="label">Category</label>
                            <select className={`input-field ${errors.category ? 'border-red-400' : ''}`} {...register('category', { required: 'Select a category' })}>
                                <option value="">Select a category...</option>
                                {CATEGORIES.map(c => <option key={`cat-${c}`} value={c}>{c}</option>)}
                            </select>
                            {errors.category && <p className="field-error">{errors.category.message}</p>}
                        </div>
                        <div>
                            <label className="label">Subject</label>
                            <input className={`input-field ${errors.subject ? 'border-red-400' : ''}`} placeholder="Brief description of your issue" {...register('subject', { required: 'Subject is required' })} />
                            {errors.subject && <p className="field-error">{errors.subject.message}</p>}
                        </div>
                        <div>
                            <label className="label">Message</label>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Include relevant transaction references or dates</p>
                            <textarea rows={4} className={`input-field resize-none ${errors.message ? 'border-red-400' : ''}`} placeholder="Describe your issue in detail..." {...register('message', { required: 'Message is required', minLength: { value: 20, message: 'Please provide more detail (min 20 characters)' } })} />
                            {errors.message && <p className="field-error">{errors.message.message}</p>}
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setShowNewForm(false)} className="btn-secondary flex-1">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={15} />}
                                Submit Ticket
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Ticket list */}
            {tickets.length === 0 ? (
                <div className="card p-12 text-center">
                    <HeadphonesIcon size={36} className="mx-auto mb-3 text-[hsl(var(--muted-foreground))] opacity-30" />
                    <p className="text-base font-semibold text-[hsl(var(--muted-foreground))]">No support tickets yet</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Submit a ticket if you need help with your account</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {tickets.map((ticket) => (
                        <div key={ticket.id} className="card overflow-hidden">
                            <div
                                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-[hsl(var(--muted))] transition-colors"
                                onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-semibold truncate">{ticket.subject}</p>
                                        <span className={STATUS_CLASSES[ticket.status]}>{ticket.status.replace('_', ' ')}</span>
                                        <span className="text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-2 py-0.5 rounded-full">{ticket.category}</span>
                                    </div>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                                        {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {ticket.replies.length} {ticket.replies.length === 1 ? 'reply' : 'replies'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {ticket.replies.length > 0 && <MessageSquare size={14} className="text-[hsl(var(--primary))]" />}
                                    {expandedTicket === ticket.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </div>

                            {expandedTicket === ticket.id && (
                                <div className="border-t border-[hsl(var(--border))] p-4 space-y-4">
                                    {/* Original message */}
                                    <div className="bg-[hsl(var(--muted))] rounded-xl p-4">
                                        <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-2">Original Message</p>
                                        <p className="text-sm">{ticket.message}</p>
                                    </div>

                                    {/* Replies */}
                                    {ticket.replies.map((reply: import('@/lib/database.types').TicketReplyRow) => (
                                        <div key={reply.id} className={`rounded-xl p-4 ${reply.is_admin ? 'bg-blue-50 border border-blue-200' : 'bg-[hsl(var(--muted))]'}`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${reply.is_admin ? 'bg-[hsl(var(--primary))]' : 'bg-slate-400'}`}>
                                                    {reply.author_name[0]}
                                                </div>
                                                <span className="text-xs font-semibold">{reply.author_name}</span>
                                                {reply.is_admin && <span className="text-xs bg-[hsl(var(--primary))] text-white px-1.5 py-0.5 rounded font-semibold">Support</span>}
                                                <span className="text-xs text-[hsl(var(--muted-foreground))] ml-auto">
                                                    {new Date(reply.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm">{reply.message}</p>
                                        </div>
                                    ))}

                                    {/* Reply input */}
                                    {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                                        <div className="flex gap-2">
                                            <input
                                                className="input-field flex-1"
                                                placeholder="Write a reply..."
                                                value={replyText}
                                                onChange={e => setReplyText(e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(ticket.id); } }}
                                            />
                                            <button
                                                onClick={() => handleReply(ticket.id)}
                                                disabled={isReplying || !replyText.trim()}
                                                className="btn-primary px-3 flex items-center gap-1"
                                            >
                                                {isReplying ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
                                            </button>
                                        </div>
                                    )}

                                    {(ticket.status === 'resolved' || ticket.status === 'closed') && (
                                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                                            <CheckCircle size={14} />
                                            <span className="text-xs font-semibold">This ticket has been {ticket.status}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}