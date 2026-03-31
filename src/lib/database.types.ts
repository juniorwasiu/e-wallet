/**
 * database.types.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * TypeScript types representing the Supabase PostgreSQL schema.
 * These supplement the auto-generated types from `supabase gen types typescript`.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type KYCStatus = 'not_started' | 'submitted' | 'under_review' | 'approved' | 'rejected';
export type DepositAccountStatus = 'not_requested' | 'requested' | 'generated' | 'active';
export type DepositType = 'direct_deposit' | 'ach';
export type TransactionType = 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'payment';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'processing' | 'reversed';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type UserRole = 'user' | 'admin';

// ─── Table Row Types ──────────────────────────────────────────────────────────

export interface ProfileRow {
    id: string; // matches auth.users.id
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    dob: string;
    ssn_last4: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    balance: number;
    kyc_status: KYCStatus;
    kyc_submitted_at?: string | null;
    kyc_document_type?: string | null;
    deposit_account_status: DepositAccountStatus;
    deposit_type?: DepositType | null;
    role: UserRole;
    avatar_color: string;
    created_at: string;
    updated_at: string;
}

export interface TransactionRow {
    id: string;
    user_id: string;
    type: TransactionType;
    amount: number;
    description: string;
    status: TransactionStatus;
    reference: string;
    counterparty?: string | null;
    created_at: string;
}

export interface KYCSubmissionRow {
    id: string;
    user_id: string;
    document_type: string;
    document_url?: string | null;
    status: KYCStatus;
    admin_notes?: string | null;
    submitted_at: string;
    reviewed_at?: string | null;
    reviewed_by?: string | null;
}

export interface DepositAccountRow {
    id: string;
    user_id: string;
    deposit_type: DepositType;
    status: DepositAccountStatus;
    account_number?: string | null;
    routing_number?: string | null;
    bank_name?: string | null;
    requested_at: string;
    activated_at?: string | null;
    activated_by?: string | null;
}

export interface SupportTicketRow {
    id: string;
    user_id: string;
    subject: string;
    message: string;
    status: TicketStatus;
    category: string;
    created_at: string;
    updated_at: string;
}

export interface TicketReplyRow {
    id: string;
    ticket_id: string;
    author_id: string;
    author_name: string;
    is_admin: boolean;
    message: string;
    created_at: string;
}

/** Convenience type returned by db.tickets.forUser() and db.tickets.all() */
export type TicketWithReplies = SupportTicketRow & { replies: TicketReplyRow[] };


// ─── Supabase Database Type Map ───────────────────────────────────────────────
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: ProfileRow;
                Insert: Omit<ProfileRow, 'created_at' | 'updated_at'>;
                Update: Partial<Omit<ProfileRow, 'id' | 'created_at'>>;
                Relationships: [];
            };
            transactions: {
                Row: TransactionRow;
                Insert: Omit<TransactionRow, 'id' | 'created_at'>;
                Update: Partial<Omit<TransactionRow, 'id' | 'created_at'>>;
                Relationships: [];
            };
            kyc_submissions: {
                Row: KYCSubmissionRow;
                Insert: Omit<KYCSubmissionRow, 'id' | 'submitted_at'>;
                Update: Partial<Omit<KYCSubmissionRow, 'id' | 'submitted_at'>>;
                Relationships: [];
            };
            deposit_accounts: {
                Row: DepositAccountRow;
                Insert: Omit<DepositAccountRow, 'id' | 'requested_at'>;
                Update: Partial<Omit<DepositAccountRow, 'id' | 'requested_at'>>;
                Relationships: [];
            };
            support_tickets: {
                Row: SupportTicketRow;
                Insert: Omit<SupportTicketRow, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<SupportTicketRow, 'id' | 'created_at'>>;
                Relationships: [];
            };
            ticket_replies: {
                Row: TicketReplyRow;
                Insert: Omit<TicketReplyRow, 'id' | 'created_at'>;
                Update: Partial<Omit<TicketReplyRow, 'id' | 'created_at'>>;
                Relationships: [];
            };
        };
        Views: Record<string, never>;
        Functions: {
            is_admin: {
                Args: Record<string, never>;
                Returns: boolean;
            };
            perform_transfer: {
                Args: {
                    p_sender_id: string;
                    p_recipient_email: string;
                    p_amount: number;
                };
                Returns: { success: boolean; message: string };
            };
        };
        Enums: Record<string, never>;
        CompositeTypes: Record<string, never>;
    };
}
