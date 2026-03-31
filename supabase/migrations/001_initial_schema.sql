-- ═══════════════════════════════════════════════════════════════════════════════
-- E-WALLET DATABASE SCHEMA — Supabase/PostgreSQL Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Enable required extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── PROFILES TABLE ──────────────────────────────────────────────────────────
-- Extends Supabase auth.users. Created automatically on signup via trigger.
CREATE TABLE IF NOT EXISTS public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name      TEXT NOT NULL DEFAULT '',
    last_name       TEXT NOT NULL DEFAULT '',
    email           TEXT NOT NULL DEFAULT '',
    phone           TEXT DEFAULT '',
    dob             TEXT DEFAULT '',
    ssn_last4       TEXT DEFAULT '',
    address         TEXT DEFAULT '',
    city            TEXT DEFAULT '',
    state           TEXT DEFAULT '',
    zip             TEXT DEFAULT '',
    balance         NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    kyc_status      TEXT NOT NULL DEFAULT 'not_started'
                        CHECK (kyc_status IN ('not_started','submitted','under_review','approved','rejected')),
    kyc_submitted_at TIMESTAMPTZ,
    kyc_document_type TEXT,
    deposit_account_status TEXT NOT NULL DEFAULT 'not_requested'
                        CHECK (deposit_account_status IN ('not_requested','requested','generated','active')),
    deposit_type    TEXT CHECK (deposit_type IN ('direct_deposit','ach')),
    role            TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
    avatar_color    TEXT NOT NULL DEFAULT '#0f4c81',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TRANSACTIONS TABLE ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type        TEXT NOT NULL CHECK (type IN ('deposit','withdrawal','transfer_in','transfer_out','payment')),
    amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL DEFAULT '',
    status      TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('completed','pending','failed','processing','reversed')),
    reference   TEXT NOT NULL DEFAULT '',
    counterparty TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── KYC SUBMISSIONS TABLE ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kyc_submissions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_type   TEXT NOT NULL,
    document_url    TEXT,
    status          TEXT NOT NULL DEFAULT 'submitted'
                        CHECK (status IN ('submitted','under_review','approved','rejected')),
    admin_notes     TEXT,
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at     TIMESTAMPTZ,
    reviewed_by     UUID REFERENCES public.profiles(id)
);

-- ─── DEPOSIT ACCOUNTS TABLE ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.deposit_accounts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    deposit_type    TEXT NOT NULL CHECK (deposit_type IN ('direct_deposit','ach')),
    status          TEXT NOT NULL DEFAULT 'requested'
                        CHECK (status IN ('not_requested','requested','generated','active')),
    account_number  TEXT,
    routing_number  TEXT,
    bank_name       TEXT,
    requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    activated_at    TIMESTAMPTZ,
    activated_by    UUID REFERENCES public.profiles(id)
);

-- ─── SUPPORT TICKETS TABLE ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject     TEXT NOT NULL,
    message     TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open','in_progress','resolved','closed')),
    category    TEXT NOT NULL DEFAULT 'General',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TICKET REPLIES TABLE ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ticket_replies (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id   UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    author_id   UUID NOT NULL REFERENCES public.profiles(id),
    author_name TEXT NOT NULL,
    is_admin    BOOLEAN NOT NULL DEFAULT FALSE,
    message     TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON public.kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_accounts_user_id ON public.deposit_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket_id ON public.ticket_replies(ticket_id);

-- ─── AUTO-UPDATE updated_at TRIGGER ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── AUTO-CREATE PROFILE ON SIGNUP TRIGGER ───────────────────────────────────
-- When a user signs up via Supabase Auth, automatically create their profile row.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, email, first_name, last_name, phone, dob, ssn_last4,
        address, city, state, zip, avatar_color, role
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'dob', ''),
        COALESCE(NEW.raw_user_meta_data->>'ssn_last4', ''),
        COALESCE(NEW.raw_user_meta_data->>'address', ''),
        COALESCE(NEW.raw_user_meta_data->>'city', ''),
        COALESCE(NEW.raw_user_meta_data->>'state', ''),
        COALESCE(NEW.raw_user_meta_data->>'zip', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_color', '#0f4c81'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── is_admin() HELPER FUNCTION ──────────────────────────────────────────────
-- Returns true if the currently authenticated user has admin role.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── PERFORM TRANSFER (ATOMIC) ────────────────────────────────────────────────
-- Atomically transfer between two users; deducts sender, credits receiver,
-- and logs both transaction rows in one DB transaction.
CREATE OR REPLACE FUNCTION public.perform_transfer(
    p_sender_id UUID,
    p_recipient_email TEXT,
    p_amount NUMERIC
)
RETURNS JSON AS $$
DECLARE
    v_recipient_id UUID;
    v_sender_balance NUMERIC;
    v_sender_name TEXT;
    v_recipient_name TEXT;
    v_ref TEXT;
BEGIN
    -- Step 1: Look up recipient
    SELECT id, first_name || ' ' || last_name
    INTO v_recipient_id, v_recipient_name
    FROM public.profiles
    WHERE email = p_recipient_email AND role = 'user';

    IF v_recipient_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Recipient not found');
    END IF;

    IF v_recipient_id = p_sender_id THEN
        RETURN json_build_object('success', false, 'message', 'Cannot transfer to yourself');
    END IF;

    -- Step 2: Get sender balance
    SELECT balance, first_name || ' ' || last_name
    INTO v_sender_balance, v_sender_name
    FROM public.profiles WHERE id = p_sender_id;

    IF v_sender_balance < p_amount THEN
        RETURN json_build_object('success', false, 'message', 'Insufficient balance');
    END IF;

    -- Step 3: Generate reference
    v_ref := 'REF-TR-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || FLOOR(RANDOM() * 99999)::TEXT;

    -- Step 4: Deduct from sender
    UPDATE public.profiles SET balance = balance - p_amount WHERE id = p_sender_id;

    -- Step 5: Credit recipient
    UPDATE public.profiles SET balance = balance + p_amount WHERE id = v_recipient_id;

    -- Step 6: Log sender's outgoing transaction
    INSERT INTO public.transactions (user_id, type, amount, description, status, reference, counterparty)
    VALUES (p_sender_id, 'transfer_out', p_amount,
            'Transfer to ' || v_recipient_name, 'completed', v_ref, v_recipient_name);

    -- Step 7: Log recipient's incoming transaction
    INSERT INTO public.transactions (user_id, type, amount, description, status, reference, counterparty)
    VALUES (v_recipient_id, 'transfer_in', p_amount,
            'Transfer from ' || v_sender_name, 'completed', v_ref, v_sender_name);

    RETURN json_build_object('success', true, 'message', 'Transfer completed successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

-- profiles: users see own row, admins see all
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- transactions: users see own, admins see all
CREATE POLICY "transactions_select" ON public.transactions FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "transactions_insert" ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- kyc_submissions: users see own, admins see all
CREATE POLICY "kyc_select" ON public.kyc_submissions FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "kyc_insert" ON public.kyc_submissions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "kyc_update" ON public.kyc_submissions FOR UPDATE
    USING (public.is_admin());

-- deposit_accounts: users see own, admins see all and can update
CREATE POLICY "deposit_select" ON public.deposit_accounts FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "deposit_insert" ON public.deposit_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "deposit_update" ON public.deposit_accounts FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin());

-- support_tickets: users see own, admins see all
CREATE POLICY "tickets_select" ON public.support_tickets FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "tickets_insert" ON public.support_tickets FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tickets_update" ON public.support_tickets FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin());

-- ticket_replies: users see replies on their tickets, admins see all
CREATE POLICY "replies_select" ON public.ticket_replies FOR SELECT
    USING (
        public.is_admin() OR
        EXISTS (
            SELECT 1 FROM public.support_tickets t
            WHERE t.id = ticket_replies.ticket_id AND t.user_id = auth.uid()
        )
    );
CREATE POLICY "replies_insert" ON public.ticket_replies FOR INSERT
    WITH CHECK (auth.uid() = author_id);

-- ─── REALTIME ─────────────────────────────────────────────────────────────────
-- Enable real-time on tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.deposit_accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- ─── SEED: DEMO ADMIN USER ────────────────────────────────────────────────────
-- NOTE: Run this AFTER creating the admin user via Supabase Auth dashboard
-- (Email: admin@ewallet.io, Password: Admin@2026!)
-- Then replace 'ADMIN_USER_UUID_HERE' with the actual UUID from auth.users.
--
-- Example:
-- UPDATE public.profiles SET role = 'admin', first_name = 'Admin', last_name = 'Ops'
-- WHERE email = 'admin@ewallet.io';
