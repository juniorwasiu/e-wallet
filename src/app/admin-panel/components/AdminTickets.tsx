'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { db } from '@/lib/db';
import type { TicketWithReplies, TicketReplyRow, TicketStatus } from '@/lib/database.types';
import { HeadphonesIcon, Send, CheckCircle, ChevronDown, ChevronUp, MessageSquare, AlertCircle } from 'lucide-react';

interface Props { adminId: string; }

const STATUS_CLASSES: Record<TicketStatus, string> = {
    open: 'badge-danger',
    in_progress: 'badge-warning',
    resolved: 'badge-success',
    closed: 'badge-neutral',
};

type AdminTicketEntry = TicketWithReplies & { profile?: { first_name: string; last_name: string; email: string; avatar_color: string } };

export default function AdminTickets({ adminId }: Props) {
    const [tickets, setTickets] = useState<AdminTicketEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
    const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
    const [isReplying, setIsReplying] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('open');

    const refresh = useCallback(async () => {
        console.log('[AdminTickets] 🔄 Loading all tickets...');
        setLoading(true);
        const data = await db.tickets.all();
        setTickets(data as AdminTicketEntry[]);
        setLoading(false);
        console.log('[AdminTickets] ✅ Loaded', data.length, 'tickets');
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const handleReply = async (ticketId: string) => {
        const msg = replyTexts[ticketId];
        if (!msg?.trim()) return;
        console.log('[AdminTickets] 💬 Sending admin reply to ticket:', ticketId);
        setIsReplying(ticketId);
        const result = await db.tickets.reply({
            ticketId,
            authorId: adminId,
            authorName: 'Support Team',
            isAdmin: true,
            message: msg,
        });
        setIsReplying(null);
        if (result.success) {
            setReplyTexts(prev => ({ ...prev, [ticketId]: '' }));
            refresh();
            toast.success('Reply sent to user');
        } else {
            toast.error(result.error ?? 'Failed to send reply');
            console.error('[AdminTickets] ❌ Reply failed:', result.error);
        }
    };

    const handleResolve = async (ticketId: string) => {
        console.log('[AdminTickets] ✅ Resolving ticket:', ticketId);
        const ok = await db.tickets.updateStatus(ticketId, 'resolved');
        if (ok) { refresh(); toast.success('Ticket marked as resolved'); }
        else toast.error('Failed to resolve ticket');
    };

    const handleClose = async (ticketId: string) => {
        console.log('[AdminTickets] 🔒 Closing ticket:', ticketId);
        const ok = await db.tickets.updateStatus(ticketId, 'closed');
        if (ok) { refresh(); toast.success('Ticket closed'); }
        else toast.error('Failed to close ticket');
    };

    const filtered = tickets.filter(t => {
        if (filterStatus === 'open') return t.status === 'open' || t.status === 'in_progress';
        if (filterStatus === 'resolved') return t.status === 'resolved' || t.status === 'closed';
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Support Tickets</h2>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">Respond to and resolve user support requests</p>
                </div>
                <div className="flex gap-2">
                    {(['open', 'resolved', 'all'] as const).map(f => (
                        <button
                            key={`tf-${f}`}
                            onClick={() => setFilterStatus(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === f ? 'bg-[hsl(var(--primary))] text-white' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--border))]'}`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}{' '}
                            {f !== 'all' && `(${tickets.filter(t => f === 'open' ? (t.status === 'open' || t.status === 'in_progress') : (t.status === 'resolved' || t.status === 'closed')).length})`}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="card p-16 text-center">
                    <div className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading tickets...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="card p-16 text-center">
                    <HeadphonesIcon size={40} className="mx-auto mb-3 text-[hsl(var(--muted-foreground))] opacity-30" />
                    <p className="text-base font-semibold text-[hsl(var(--muted-foreground))]">No tickets in this category</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((ticket) => (
                        <div key={ticket.id} className={`card overflow-hidden ${ticket.status === 'open' ? 'border-red-200' : ticket.status === 'in_progress' ? 'border-amber-200' : ''}`}>
                            <div
                                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[hsl(var(--muted))] transition-colors"
                                onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                            >
                                <div>
                                    {ticket.status === 'open' ? <AlertCircle size={18} className="text-red-500" />
                                        : ticket.status === 'in_progress' ? <MessageSquare size={18} className="text-amber-600" />
                                        : <CheckCircle size={18} className="text-emerald-600" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-semibold">{ticket.subject}</p>
                                        <span className={STATUS_CLASSES[ticket.status]}>{ticket.status.replace('_', ' ')}</span>
                                        <span className="text-xs bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] px-2 py-0.5 rounded-full">{ticket.category}</span>
                                    </div>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                                        {ticket.profile
                                            ? `${ticket.profile.first_name} ${ticket.profile.last_name} · ${ticket.profile.email}`
                                            : ticket.user_id}
                                        {' · '}
                                        {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        {' · '}{ticket.replies.length} replies
                                    </p>
                                </div>
                                {expandedTicket === ticket.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>

                            {expandedTicket === ticket.id && (
                                <div className="border-t border-[hsl(var(--border))] p-5 space-y-4">
                                    {/* Original user message */}
                                    <div className="bg-[hsl(var(--muted))] rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                                style={{ backgroundColor: ticket.profile?.avatar_color ?? '#94a3b8' }}
                                            >
                                                {ticket.profile?.first_name[0] ?? 'U'}
                                            </div>
                                            <span className="text-xs font-semibold">
                                                {ticket.profile ? `${ticket.profile.first_name} ${ticket.profile.last_name}` : 'User'}
                                            </span>
                                            <span className="text-xs text-[hsl(var(--muted-foreground))] ml-auto">
                                                {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm">{ticket.message}</p>
                                    </div>

                                    {/* All replies */}
                                    {ticket.replies.map((reply: TicketReplyRow) => (
                                        <div key={reply.id} className={`rounded-xl p-4 ${reply.is_admin ? 'bg-blue-50 border border-blue-200 ml-4' : 'bg-[hsl(var(--muted))]'}`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${reply.is_admin ? 'bg-[hsl(var(--primary))]' : 'bg-slate-400'}`}>
                                                    {reply.author_name[0]}
                                                </div>
                                                <span className="text-xs font-semibold">{reply.author_name}</span>
                                                {reply.is_admin && <span className="text-xs bg-[hsl(var(--primary))] text-white px-1.5 py-0.5 rounded font-semibold">Admin</span>}
                                                <span className="text-xs text-[hsl(var(--muted-foreground))] ml-auto">
                                                    {new Date(reply.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm">{reply.message}</p>
                                        </div>
                                    ))}

                                    {/* Admin reply input */}
                                    {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                                        <div className="space-y-3">
                                            <textarea
                                                rows={3}
                                                className="input-field resize-none"
                                                placeholder="Write a response to this ticket..."
                                                value={replyTexts[ticket.id] || ''}
                                                onChange={e => setReplyTexts(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                                            />
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleResolve(ticket.id)}
                                                    className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle size={15} /> Mark Resolved
                                                </button>
                                                <button
                                                    onClick={() => handleReply(ticket.id)}
                                                    disabled={isReplying === ticket.id || !replyTexts[ticket.id]?.trim()}
                                                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                                                >
                                                    {isReplying === ticket.id ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
                                                    Send Reply
                                                </button>
                                                <button onClick={() => handleClose(ticket.id)} className="btn-secondary px-4">Close</button>
                                            </div>
                                        </div>
                                    )}

                                    {(ticket.status === 'resolved' || ticket.status === 'closed') && (
                                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                                            <CheckCircle size={14} className="text-emerald-600" />
                                            <span className="text-xs font-semibold text-emerald-700">Ticket {ticket.status}</span>
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