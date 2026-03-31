/**
 * db.ts — Supabase Database Service Layer
 * ─────────────────────────────────────────────────────────────────────────────
 * Replaces the in-memory AppStore with real Supabase-backed operations.
 * All functions are async and return typed results.
 *
 * Usage:
 *   import { db } from '@/lib/db';
 *   const profile = await db.getProfile(userId);
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { supabase as _supabase, supabaseAdmin as _supabaseAdmin } from './supabase';
import type {
    ProfileRow, TransactionRow, KYCSubmissionRow,
    DepositAccountRow, SupportTicketRow, TicketReplyRow,
    KYCStatus, DepositType, TransactionType, TransactionStatus
} from './database.types';

// Cast to any to avoid Supabase v2 generic type mismatch with hand-crafted Database type.
// Return types are enforced via explicit Promise<T> on each function.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = _supabase as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabaseAdmin = _supabaseAdmin as any;


// ─── Re-export types for backward compatibility ───────────────────────────────
export type { KYCStatus, DepositType, TransactionType, TransactionStatus };
export type { ProfileRow as User, TransactionRow as Transaction };

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
    /**
     * Sign in with email and password.
     * Returns session + profile (to determine role for routing).
     */
    signIn: async (email: string, password: string) => {
        console.log('[Auth] 🔐 Attempting sign-in for:', email);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            console.error('[Auth] ❌ Sign-in failed:', error.message);
            return { success: false, error: error.message, role: null };
        }
        console.log('[Auth] ✅ Sign-in successful, fetching role...');
        // Fetch role from profiles table
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();
        const role = profile?.role ?? 'user';
        console.log('[Auth] 👤 User role:', role);
        return { success: true, error: null, role };
    },

    /**
     * Register a new user with full profile data.
     * Step 1: Create auth user → Step 2: Profile is auto-created via trigger.
     */
    signUp: async (params: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
        dob: string;
        ssn_last4: string;
        address: string;
        city: string;
        state: string;
        zip: string;
    }) => {
        console.log('[Auth] 📝 Registering new user:', params.email);

        // Generate a consistent avatar color
        const colors = ['#0f4c81', '#6d28d9', '#059669', '#dc2626', '#d97706', '#0891b2'];
        const avatarColor = colors[Math.floor(Math.random() * colors.length)];

        const { data, error } = await supabase.auth.signUp({
            email: params.email,
            password: params.password,
            options: {
                data: {
                    first_name: params.firstName,
                    last_name: params.lastName,
                    phone: params.phone,
                    dob: params.dob,
                    ssn_last4: params.ssn_last4,
                    address: params.address,
                    city: params.city,
                    state: params.state,
                    zip: params.zip,
                    avatar_color: avatarColor,
                    role: 'user',
                },
            },
        });

        if (error) {
            console.error('[Auth] ❌ Registration failed:', error.message);
            return { success: false, error: error.message };
        }

        console.log('[Auth] ✅ User registered:', data.user?.id);
        return { success: true, error: null, userId: data.user?.id };
    },

    /** Sign out the current user */
    signOut: async () => {
        console.log('[Auth] 🚪 Signing out...');
        const { error } = await supabase.auth.signOut();
        if (error) console.error('[Auth] Sign-out error:', error.message);
        else console.log('[Auth] ✅ Signed out');
    },

    /** Get the current session and user */
    getSession: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    /** Get current user id */
    getCurrentUserId: async (): Promise<string | null> => {
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id ?? null;
    },
};

// ─── Profiles ─────────────────────────────────────────────────────────────────

export const profiles = {
    /** Fetch a user's full profile */
    get: async (userId: string): Promise<ProfileRow | null> => {
        console.log('[DB:profiles] 📖 Fetching profile for:', userId);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) {
            console.error('[DB:profiles] ❌ Fetch error:', error.message);
            return null;
        }
        console.log('[DB:profiles] ✅ Profile loaded:', data.email);
        return data;
    },

    /** Update a user's profile fields */
    update: async (userId: string, updates: Partial<ProfileRow>): Promise<{ success: boolean; error?: string }> => {
        console.log('[DB:profiles] ✏️ Updating profile for:', userId, 'fields:', Object.keys(updates));
        const { error } = await supabase
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', userId);
        if (error) {
            console.error('[DB:profiles] ❌ Update error:', error.message);
            return { success: false, error: error.message };
        }
        console.log('[DB:profiles] ✅ Profile updated');
        return { success: true };
    },

    /** Admin: list all non-admin users */
    listAll: async (): Promise<ProfileRow[]> => {
        console.log('[DB:profiles] 📋 Admin: listing all users');
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'user')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('[DB:profiles] ❌ List error:', error.message);
            return [];
        }
        console.log('[DB:profiles] ✅ Found', data.length, 'users');
        return data;
    },

    /** Admin: adjust a user's balance (for simulation / corrections) */
    adjustBalance: async (userId: string, newBalance: number): Promise<boolean> => {
        console.log('[DB:profiles] 💰 Admin adjusting balance for:', userId, 'to:', newBalance);
        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ balance: newBalance })
            .eq('id', userId);
        if (error) {
            console.error('[DB:profiles] ❌ Balance adjustment error:', error.message);
            return false;
        }
        console.log('[DB:profiles] ✅ Balance adjusted');
        return true;
    },
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export const transactions = {
    /** Fetch transactions for a specific user */
    forUser: async (userId: string): Promise<TransactionRow[]> => {
        console.log('[DB:transactions] 📖 Fetching transactions for user:', userId);
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('[DB:transactions] ❌ Fetch error:', error.message);
            return [];
        }
        console.log('[DB:transactions] ✅ Found', data.length, 'transactions');
        return data;
    },

    /** Admin: fetch all transactions */
    all: async (): Promise<TransactionRow[]> => {
        console.log('[DB:transactions] 📋 Admin: fetching all transactions');
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('[DB:transactions] ❌ Fetch error:', error.message);
            return [];
        }
        console.log('[DB:transactions] ✅ Found', data.length, 'total transactions');
        return data;
    },

    /** Log a single transaction (used internally by wallet operations) */
    insert: async (params: {
        userId: string;
        type: TransactionType;
        amount: number;
        description: string;
        status: TransactionStatus;
        counterparty?: string;
    }): Promise<TransactionRow | null> => {
        const reference = `REF-${params.type.toUpperCase().slice(0, 2)}-${Date.now().toString().slice(-8)}`;
        console.log('[DB:transactions] ➕ Inserting transaction:', params.type, params.amount);
        const { data, error } = await supabaseAdmin
            .from('transactions')
            .insert({
                user_id: params.userId,
                type: params.type,
                amount: params.amount,
                description: params.description,
                status: params.status,
                reference,
                counterparty: params.counterparty ?? null,
            })
            .select()
            .single();
        if (error) {
            console.error('[DB:transactions] ❌ Insert error:', error.message);
            return null;
        }
        console.log('[DB:transactions] ✅ Transaction logged:', data.id);
        return data;
    },
};

// ─── Wallet Operations ────────────────────────────────────────────────────────

export const wallet = {
    /**
     * Simulate a deposit — credits balance and logs transaction.
     * In production, this would be triggered by a webhook from the bank.
     * Admin can also trigger this directly from the admin panel.
     */
    deposit: async (userId: string, amount: number, description: string, counterparty?: string): Promise<{ success: boolean; error?: string }> => {
        console.log('[DB:wallet] 💵 Depositing', amount, 'for user:', userId);

        // Step 1: Fetch current balance
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('balance')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            console.error('[DB:wallet] ❌ Profile not found for deposit:', profileError?.message);
            return { success: false, error: 'User not found' };
        }

        // Step 2: Update balance
        const newBalance = Number(profile.balance) + Number(amount);
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ balance: newBalance })
            .eq('id', userId);

        if (updateError) {
            console.error('[DB:wallet] ❌ Balance update error:', updateError.message);
            return { success: false, error: 'Failed to update balance' };
        }

        // Step 3: Log transaction
        await transactions.insert({
            userId,
            type: 'deposit',
            amount,
            description,
            status: 'completed',
            counterparty: counterparty ?? 'eWallet',
        });

        console.log('[DB:wallet] ✅ Deposit successful. New balance:', newBalance);
        return { success: true };
    },

    /**
     * Withdraw from user's account — deducts balance and logs transaction.
     * Requires KYC approval (enforced in UI, also checked here).
     */
    withdraw: async (userId: string, amount: number, description: string, counterparty?: string): Promise<{ success: boolean; error?: string }> => {
        console.log('[DB:wallet] 💸 Withdrawing', amount, 'for user:', userId);

        // Step 1: Check balance and KYC
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('balance, kyc_status')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            return { success: false, error: 'User not found' };
        }

        if (profile.kyc_status !== 'approved') {
            console.warn('[DB:wallet] ⚠️ Withdrawal blocked — KYC not approved. Status:', profile.kyc_status);
            return { success: false, error: 'KYC verification required before withdrawals' };
        }

        if (Number(profile.balance) < amount) {
            console.warn('[DB:wallet] ⚠️ Insufficient balance:', profile.balance, '<', amount);
            return { success: false, error: 'Insufficient balance' };
        }

        // Step 2: Deduct balance
        const newBalance = Number(profile.balance) - amount;
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ balance: newBalance })
            .eq('id', userId);

        if (updateError) {
            console.error('[DB:wallet] ❌ Balance deduction error:', updateError.message);
            return { success: false, error: 'Failed to process withdrawal' };
        }

        // Step 3: Log transaction
        await transactions.insert({
            userId,
            type: 'withdrawal',
            amount,
            description,
            status: 'completed',
            counterparty: counterparty ?? 'eWallet',
        });

        console.log('[DB:wallet] ✅ Withdrawal successful. New balance:', newBalance);
        return { success: true };
    },

    /**
     * Transfer between two users atomically via DB function.
     * Calls the `perform_transfer` PostgreSQL function.
     */
    transfer: async (senderId: string, recipientEmail: string, amount: number): Promise<{ success: boolean; error?: string }> => {
        console.log('[DB:wallet] 🔄 Transfer', amount, 'from', senderId, 'to', recipientEmail);

        const { data, error } = await supabaseAdmin.rpc('perform_transfer', {
            p_sender_id: senderId,
            p_recipient_email: recipientEmail,
            p_amount: amount,
        });

        if (error) {
            console.error('[DB:wallet] ❌ Transfer RPC error:', error.message);
            return { success: false, error: error.message };
        }

        // data is the JSON return from the SQL function
        const result = data as { success: boolean; message: string };
        console.log('[DB:wallet]', result.success ? '✅' : '❌', 'Transfer result:', result.message);
        return { success: result.success, error: result.success ? undefined : result.message };
    },
};

// ─── KYC ─────────────────────────────────────────────────────────────────────

export const kyc = {
    /** Submit KYC — creates submission row and updates profile status */
    submit: async (userId: string, documentType: string, documentUrl?: string): Promise<{ success: boolean; error?: string }> => {
        console.log('[DB:kyc] 📄 Submitting KYC for user:', userId, 'doc type:', documentType);

        // Insert submission record
        const { error: insertError } = await supabase
            .from('kyc_submissions')
            .insert({
                user_id: userId,
                document_type: documentType,
                document_url: documentUrl ?? null,
                status: 'submitted',
            });

        if (insertError) {
            console.error('[DB:kyc] ❌ Submission insert error:', insertError.message);
            return { success: false, error: 'Failed to submit KYC documents' };
        }

        // Update profile kyc_status
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                kyc_status: 'submitted',
                kyc_submitted_at: new Date().toISOString(),
                kyc_document_type: documentType,
            })
            .eq('id', userId);

        if (profileError) {
            console.error('[DB:kyc] ❌ Profile status update error:', profileError.message);
            return { success: false, error: 'Submission recorded but profile update failed' };
        }

        console.log('[DB:kyc] ✅ KYC submitted');
        return { success: true };
    },

    /** Admin: list all pending KYC submissions */
    getPending: async (): Promise<(KYCSubmissionRow & { profile: ProfileRow })[]> => {
        console.log('[DB:kyc] 📋 Admin: fetching pending KYC queue');
        const { data, error } = await supabase
            .from('kyc_submissions')
            .select('*, profile:profiles(*)')
            .in('status', ['submitted', 'under_review'])
            .order('submitted_at', { ascending: true });

        if (error) {
            console.error('[DB:kyc] ❌ Pending fetch error:', error.message);
            return [];
        }
        console.log('[DB:kyc] ✅ Found', data.length, 'pending KYC submissions');
        return data as (KYCSubmissionRow & { profile: ProfileRow })[];
    },

    /** Admin: approve a KYC submission */
    approve: async (submissionId: string, userId: string, adminId: string): Promise<boolean> => {
        console.log('[DB:kyc] ✅ Admin approving KYC:', submissionId);

        const { error: subError } = await supabaseAdmin
            .from('kyc_submissions')
            .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: adminId })
            .eq('id', submissionId);

        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ kyc_status: 'approved' })
            .eq('id', userId);

        if (subError || profileError) {
            console.error('[DB:kyc] ❌ Approve error:', subError?.message, profileError?.message);
            return false;
        }
        console.log('[DB:kyc] ✅ KYC approved for user:', userId);
        return true;
    },

    /** Admin: reject a KYC submission */
    reject: async (submissionId: string, userId: string, adminId: string, notes?: string): Promise<boolean> => {
        console.log('[DB:kyc] ❌ Admin rejecting KYC:', submissionId);

        const { error: subError } = await supabaseAdmin
            .from('kyc_submissions')
            .update({
                status: 'rejected',
                reviewed_at: new Date().toISOString(),
                reviewed_by: adminId,
                admin_notes: notes ?? null,
            })
            .eq('id', submissionId);

        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ kyc_status: 'rejected' })
            .eq('id', userId);

        if (subError || profileError) {
            console.error('[DB:kyc] ❌ Reject error:', subError?.message, profileError?.message);
            return false;
        }
        console.log('[DB:kyc] ✅ KYC rejected for user:', userId);
        return true;
    },
};

// ─── Deposit Accounts ─────────────────────────────────────────────────────────

export const depositAccounts = {
    /** User requests a deposit account (Direct Deposit or ACH) */
    request: async (userId: string, depositType: DepositType): Promise<{ success: boolean; error?: string; accountId?: string }> => {
        console.log('[DB:deposit] 📬 User requesting deposit account:', depositType, 'for:', userId);

        // Check if already requested
        const { data: existing } = await supabase
            .from('deposit_accounts')
            .select('id, status')
            .eq('user_id', userId)
            .in('status', ['requested', 'active'])
            .maybeSingle();

        if (existing) {
            console.warn('[DB:deposit] ⚠️ Already has active/requested account:', existing.status);
            return { success: false, error: 'You already have an active or pending deposit account' };
        }

        const { data, error } = await supabase
            .from('deposit_accounts')
            .insert({ user_id: userId, deposit_type: depositType, status: 'requested' })
            .select()
            .single();

        if (error) {
            console.error('[DB:deposit] ❌ Request error:', error.message);
            return { success: false, error: 'Failed to request deposit account' };
        }

        // Update profile deposit status
        await supabaseAdmin.from('profiles').update({
            deposit_account_status: 'requested',
            deposit_type: depositType,
        }).eq('id', userId);

        console.log('[DB:deposit] ✅ Deposit account requested:', data.id);
        return { success: true, accountId: data.id };
    },

    /** Get active deposit account for a user */
    getForUser: async (userId: string): Promise<DepositAccountRow | null> => {
        console.log('[DB:deposit] 📖 Fetching deposit account for user:', userId);
        const { data, error } = await supabase
            .from('deposit_accounts')
            .select('*')
            .eq('user_id', userId)
            .order('requested_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) {
            console.error('[DB:deposit] ❌ Fetch error:', error.message);
            return null;
        }
        return data;
    },

    /** Admin: list all pending deposit requests */
    getPending: async (): Promise<(DepositAccountRow & { profile: ProfileRow })[]> => {
        console.log('[DB:deposit] 📋 Admin: fetching pending deposit requests');
        const { data, error } = await supabase
            .from('deposit_accounts')
            .select('*, profile:profiles(*)')
            .eq('status', 'requested')
            .order('requested_at', { ascending: true });

        if (error) {
            console.error('[DB:deposit] ❌ Pending fetch error:', error.message);
            return [];
        }
        console.log('[DB:deposit] ✅ Found', data.length, 'pending requests');
        return data as (DepositAccountRow & { profile: ProfileRow })[];
    },

    /** Admin: generate / activate a deposit account with banking details */
    activate: async (params: {
        accountId: string;
        userId: string;
        adminId: string;
        accountNumber: string;
        routingNumber: string;
        bankName: string;
    }): Promise<boolean> => {
        console.log('[DB:deposit] ✅ Admin activating deposit account:', params.accountId);

        const { error: accError } = await supabaseAdmin
            .from('deposit_accounts')
            .update({
                status: 'active',
                account_number: params.accountNumber,
                routing_number: params.routingNumber,
                bank_name: params.bankName,
                activated_at: new Date().toISOString(),
                activated_by: params.adminId,
            })
            .eq('id', params.accountId);

        if (accError) {
            console.error('[DB:deposit] ❌ Account activation error:', accError.message);
            return false;
        }

        // Update user's profile deposit fields
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                deposit_account_status: 'active',
            })
            .eq('id', params.userId);

        if (profileError) {
            console.error('[DB:deposit] ❌ Profile update error:', profileError.message);
        }

        console.log('[DB:deposit] ✅ Deposit account activated for user:', params.userId);
        return true;
    },
};

// ─── Support Tickets ──────────────────────────────────────────────────────────

export const tickets = {
    /** Create a new support ticket */
    create: async (params: {
        userId: string;
        subject: string;
        message: string;
        category: string;
    }): Promise<{ success: boolean; ticketId?: string; error?: string }> => {
        console.log('[DB:tickets] 🎫 Creating ticket:', params.subject);

        const { data, error } = await supabase
            .from('support_tickets')
            .insert({
                user_id: params.userId,
                subject: params.subject,
                message: params.message,
                category: params.category,
                status: 'open',
            })
            .select()
            .single();

        if (error) {
            console.error('[DB:tickets] ❌ Create error:', error.message);
            return { success: false, error: 'Failed to create ticket' };
        }
        console.log('[DB:tickets] ✅ Ticket created:', data.id);
        return { success: true, ticketId: data.id };
    },

    /** Fetch tickets for a user, including their replies */
    forUser: async (userId: string): Promise<(SupportTicketRow & { replies: TicketReplyRow[] })[]> => {
        console.log('[DB:tickets] 📖 Fetching tickets for user:', userId);
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*, replies:ticket_replies(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[DB:tickets] ❌ Fetch error:', error.message);
            return [];
        }
        console.log('[DB:tickets] ✅ Found', data.length, 'tickets');
        return data as (SupportTicketRow & { replies: TicketReplyRow[] })[];
    },

    /** Admin: fetch all tickets with replies */
    all: async (): Promise<(SupportTicketRow & { replies: TicketReplyRow[]; profile: ProfileRow })[]> => {
        console.log('[DB:tickets] 📋 Admin: fetching all tickets');
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*, replies:ticket_replies(*), profile:profiles(*)')
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('[DB:tickets] ❌ Admin fetch error:', error.message);
            return [];
        }
        console.log('[DB:tickets] ✅ Found', data.length, 'tickets');
        return data as (SupportTicketRow & { replies: TicketReplyRow[]; profile: ProfileRow })[];
    },

    /** Add a reply to a ticket */
    reply: async (params: {
        ticketId: string;
        authorId: string;
        authorName: string;
        isAdmin: boolean;
        message: string;
    }): Promise<{ success: boolean; error?: string }> => {
        console.log('[DB:tickets] 💬 Adding reply to ticket:', params.ticketId, 'isAdmin:', params.isAdmin);

        const { error: replyError } = await supabase
            .from('ticket_replies')
            .insert({
                ticket_id: params.ticketId,
                author_id: params.authorId,
                author_name: params.authorName,
                is_admin: params.isAdmin,
                message: params.message,
            });

        if (replyError) {
            console.error('[DB:tickets] ❌ Reply error:', replyError.message);
            return { success: false, error: 'Failed to send reply' };
        }

        // Update ticket status and timestamp
        const newStatus = params.isAdmin ? 'in_progress' : undefined;
        await supabase
            .from('support_tickets')
            .update({
                updated_at: new Date().toISOString(),
                ...(newStatus ? { status: newStatus } : {}),
            })
            .eq('id', params.ticketId);

        console.log('[DB:tickets] ✅ Reply sent');
        return { success: true };
    },

    /** Update ticket status (resolve / close) */
    updateStatus: async (ticketId: string, status: 'resolved' | 'closed' | 'in_progress'): Promise<boolean> => {
        console.log('[DB:tickets] 🔄 Updating ticket status:', ticketId, '→', status);
        const { error } = await supabaseAdmin
            .from('support_tickets')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', ticketId);
        if (error) {
            console.error('[DB:tickets] ❌ Status update error:', error.message);
            return false;
        }
        console.log('[DB:tickets] ✅ Status updated');
        return true;
    },
};

// ─── Admin Statistics ─────────────────────────────────────────────────────────

export const adminStats = {
    /**
     * Get aggregate statistics for the admin overview dashboard.
     * Runs parallel queries for efficiency.
     */
    get: async (): Promise<{
        totalUsers: number;
        pendingKYC: number;
        openTickets: number;
        depositRequests: number;
        volume24h: number;
        totalBalance: number;
    }> => {
        console.log('[DB:stats] 📊 Fetching admin stats...');
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const [usersRes, kycRes, ticketsRes, depositsRes, volume24hRes, balanceRes] = await Promise.all([
            // Total users
            supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'user'),
            // Pending KYC
            supabase.from('kyc_submissions').select('id', { count: 'exact', head: true })
                .in('status', ['submitted', 'under_review']),
            // Open tickets
            supabase.from('support_tickets').select('id', { count: 'exact', head: true })
                .in('status', ['open', 'in_progress']),
            // Pending deposit requests
            supabase.from('deposit_accounts').select('id', { count: 'exact', head: true })
                .eq('status', 'requested'),
            // 24h volume
            supabase.from('transactions').select('amount').eq('status', 'completed')
                .gte('created_at', oneDayAgo),
            // Total balance across all users
            supabase.from('profiles').select('balance').eq('role', 'user'),
        ]);

        const volume24h = (volume24hRes.data ?? [] as { amount: number }[]).reduce((sum: number, t: { amount: number }) => sum + Number(t.amount), 0);
        const totalBalance = (balanceRes.data ?? [] as { balance: number }[]).reduce((sum: number, p: { balance: number }) => sum + Number(p.balance), 0);

        const stats = {
            totalUsers: usersRes.count ?? 0,
            pendingKYC: kycRes.count ?? 0,
            openTickets: ticketsRes.count ?? 0,
            depositRequests: depositsRes.count ?? 0,
            volume24h,
            totalBalance,
        };

        console.log('[DB:stats] ✅ Admin stats:', stats);
        return stats;
    },
};

// ─── Default export — named db object ────────────────────────────────────────
export const db = {
    auth,
    profiles,
    transactions,
    wallet,
    kyc,
    depositAccounts,
    tickets,
    adminStats,
};

export default db;
