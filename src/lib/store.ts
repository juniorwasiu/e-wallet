// Backend integration point: replace with real API calls and auth tokens

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'payment';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'processing' | 'reversed';
export type KYCStatus = 'not_started' | 'submitted' | 'under_review' | 'approved' | 'rejected';
export type DepositAccountStatus = 'not_requested' | 'requested' | 'generated' | 'active';
export type DepositType = 'direct_deposit' | 'ach';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dob: string;
    ssn_last4: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    balance: number;
    kycStatus: KYCStatus;
    kycSubmittedAt?: string;
    kycDocumentType?: string;
    depositAccountStatus: DepositAccountStatus;
    depositType?: DepositType;
    depositAccountNumber?: string;
    depositRoutingNumber?: string;
    depositBankName?: string;
    createdAt: string;
    role: 'user' | 'admin';
    avatarColor: string;
}

export interface Transaction {
    id: string;
    userId: string;
    type: TransactionType;
    amount: number;
    description: string;
    status: TransactionStatus;
    createdAt: string;
    reference: string;
    counterparty?: string;
}

export interface SupportTicket {
    id: string;
    userId: string;
    subject: string;
    message: string;
    status: TicketStatus;
    createdAt: string;
    replies: TicketReply[];
    category: string;
}

export interface TicketReply {
    id: string;
    authorId: string;
    authorName: string;
    isAdmin: boolean;
    message: string;
    createdAt: string;
}

// ─── Mock Users ───────────────────────────────────────────────────────────────
export const MOCK_USERS: User[] = [
    {
        id: 'user-001',
        firstName: 'Marcus',
        lastName: 'Okafor',
        email: 'marcus.okafor@gmail.com',
        phone: '+1 (312) 555-0182',
        dob: '1990-04-15',
        ssn_last4: '4821',
        address: '2847 N Halsted St',
        city: 'Chicago',
        state: 'IL',
        zip: '60614',
        balance: 4250.75,
        kycStatus: 'approved',
        kycSubmittedAt: '2026-03-10T09:22:00Z',
        kycDocumentType: "Driver's License",
        depositAccountStatus: 'active',
        depositType: 'direct_deposit',
        depositAccountNumber: '8821047392',
        depositRoutingNumber: '021000021',
        depositBankName: 'eWallet Bank',
        createdAt: '2026-02-14T08:00:00Z',
        role: 'user',
        avatarColor: '#0f4c81',
    },
    {
        id: 'user-002',
        firstName: 'Priya',
        lastName: 'Nambiar',
        email: 'priya.nambiar@outlook.com',
        phone: '+1 (415) 555-0247',
        dob: '1994-11-28',
        ssn_last4: '7634',
        address: '501 Mission St, Apt 12B',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        balance: 12890.00,
        kycStatus: 'under_review',
        kycSubmittedAt: '2026-03-28T14:10:00Z',
        kycDocumentType: 'Passport',
        depositAccountStatus: 'requested',
        depositType: 'ach',
        createdAt: '2026-03-01T10:30:00Z',
        role: 'user',
        avatarColor: '#6d28d9',
    },
    {
        id: 'user-003',
        firstName: 'DeShawn',
        lastName: 'Williams',
        email: 'deshawn.w@yahoo.com',
        phone: '+1 (404) 555-0391',
        dob: '1988-07-03',
        ssn_last4: '2290',
        address: '1120 Peachtree St NE',
        city: 'Atlanta',
        state: 'GA',
        zip: '30309',
        balance: 780.50,
        kycStatus: 'submitted',
        kycSubmittedAt: '2026-03-29T11:05:00Z',
        kycDocumentType: "Driver's License",
        depositAccountStatus: 'not_requested',
        createdAt: '2026-03-15T16:45:00Z',
        role: 'user',
        avatarColor: '#059669',
    },
    {
        id: 'user-004',
        firstName: 'Yuki',
        lastName: 'Tanaka',
        email: 'yuki.tanaka@protonmail.com',
        phone: '+1 (206) 555-0573',
        dob: '1997-02-19',
        ssn_last4: '5518',
        address: '3421 Eastlake Ave E',
        city: 'Seattle',
        state: 'WA',
        zip: '98102',
        balance: 3100.25,
        kycStatus: 'rejected',
        kycSubmittedAt: '2026-03-20T08:30:00Z',
        kycDocumentType: 'State ID',
        depositAccountStatus: 'not_requested',
        createdAt: '2026-03-18T12:00:00Z',
        role: 'user',
        avatarColor: '#dc2626',
    },
    {
        id: 'user-005',
        firstName: 'Aaliyah',
        lastName: 'Jackson',
        email: 'aaliyah.j@icloud.com',
        phone: '+1 (713) 555-0614',
        dob: '1992-09-11',
        ssn_last4: '8847',
        address: '7700 Westheimer Rd',
        city: 'Houston',
        state: 'TX',
        zip: '77063',
        balance: 22450.00,
        kycStatus: 'approved',
        kycSubmittedAt: '2026-02-28T10:00:00Z',
        kycDocumentType: 'Passport',
        depositAccountStatus: 'active',
        depositType: 'direct_deposit',
        depositAccountNumber: '9934821056',
        depositRoutingNumber: '021000021',
        depositBankName: 'eWallet Bank',
        createdAt: '2026-02-20T09:15:00Z',
        role: 'user',
        avatarColor: '#d97706',
    },
    {
        id: 'user-006',
        firstName: 'Rodrigo',
        lastName: 'Castillo',
        email: 'rodrigo.castillo@gmail.com',
        phone: '+1 (305) 555-0729',
        dob: '1985-05-22',
        ssn_last4: '3392',
        address: '8900 SW 107th Ave',
        city: 'Miami',
        state: 'FL',
        zip: '33176',
        balance: 6750.80,
        kycStatus: 'not_started',
        depositAccountStatus: 'not_requested',
        createdAt: '2026-03-28T07:30:00Z',
        role: 'user',
        avatarColor: '#0891b2',
    },
];

// ─── Mock Transactions ────────────────────────────────────────────────────────
export const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 'txn-001', userId: 'user-001', type: 'deposit', amount: 2000.00, description: 'Direct Deposit — Payroll', status: 'completed', createdAt: '2026-03-28T09:00:00Z', reference: 'REF-DD-88291', counterparty: 'Acme Corp' },
    { id: 'txn-002', userId: 'user-001', type: 'withdrawal', amount: 500.00, description: 'ATM Withdrawal — Chicago Loop', status: 'completed', createdAt: '2026-03-27T14:30:00Z', reference: 'REF-WD-77183', counterparty: 'Chase ATM' },
    { id: 'txn-003', userId: 'user-001', type: 'transfer_out', amount: 250.00, description: 'Transfer to Priya Nambiar', status: 'completed', createdAt: '2026-03-26T11:15:00Z', reference: 'REF-TR-66042', counterparty: 'Priya Nambiar' },
    { id: 'txn-004', userId: 'user-001', type: 'payment', amount: 89.99, description: 'Netflix Annual Plan', status: 'completed', createdAt: '2026-03-25T08:00:00Z', reference: 'REF-PY-55910', counterparty: 'Netflix Inc.' },
    { id: 'txn-005', userId: 'user-001', type: 'deposit', amount: 1500.00, description: 'ACH Transfer — Savings', status: 'completed', createdAt: '2026-03-24T16:45:00Z', reference: 'REF-ACH-44821', counterparty: 'Chase Bank' },
    { id: 'txn-006', userId: 'user-001', type: 'withdrawal', amount: 200.00, description: 'Bill Payment — ComEd', status: 'completed', createdAt: '2026-03-22T10:00:00Z', reference: 'REF-WD-33714', counterparty: 'ComEd' },
    { id: 'txn-007', userId: 'user-001', type: 'transfer_in', amount: 300.00, description: 'Transfer from DeShawn Williams', status: 'completed', createdAt: '2026-03-20T13:20:00Z', reference: 'REF-TR-22605', counterparty: 'DeShawn Williams' },
    { id: 'txn-008', userId: 'user-001', type: 'payment', amount: 45.00, description: 'Spotify Premium', status: 'failed', createdAt: '2026-03-19T07:30:00Z', reference: 'REF-PY-11496', counterparty: 'Spotify AB' },
    { id: 'txn-009', userId: 'user-001', type: 'deposit', amount: 750.00, description: 'Freelance Payment', status: 'pending', createdAt: '2026-03-30T18:00:00Z', reference: 'REF-DD-99387', counterparty: 'TechStart LLC' },
    { id: 'txn-010', userId: 'user-001', type: 'withdrawal', amount: 150.00, description: 'Grocery — Whole Foods', status: 'processing', createdAt: '2026-03-30T17:45:00Z', reference: 'REF-WD-88278', counterparty: 'Whole Foods' },
    { id: 'txn-011', userId: 'user-002', type: 'deposit', amount: 5000.00, description: 'Wire Transfer', status: 'completed', createdAt: '2026-03-29T09:00:00Z', reference: 'REF-WR-77169', counterparty: 'Bank of America' },
    { id: 'txn-012', userId: 'user-003', type: 'deposit', amount: 800.00, description: 'Initial Deposit', status: 'completed', createdAt: '2026-03-15T16:50:00Z', reference: 'REF-DD-66060', counterparty: 'Self' },
    { id: 'txn-013', userId: 'user-005', type: 'deposit', amount: 10000.00, description: 'Business Revenue', status: 'completed', createdAt: '2026-03-27T11:00:00Z', reference: 'REF-DD-55951', counterparty: 'Jackson Consulting LLC' },
    { id: 'txn-014', userId: 'user-005', type: 'withdrawal', amount: 2500.00, description: 'Vendor Payment', status: 'completed', createdAt: '2026-03-26T14:00:00Z', reference: 'REF-WD-44842', counterparty: 'TechVendors Inc.' },
    { id: 'txn-015', userId: 'user-002', type: 'transfer_out', amount: 1200.00, description: 'Rent Payment', status: 'pending', createdAt: '2026-03-30T16:00:00Z', reference: 'REF-TR-33733', counterparty: 'Landlord LLC' },
];

// ─── Mock Support Tickets ─────────────────────────────────────────────────────
export const MOCK_TICKETS: SupportTicket[] = [
    {
        id: 'ticket-001',
        userId: 'user-001',
        subject: 'Deposit not reflected after 24 hours',
        message: 'I made a direct deposit on March 28th and the funds still haven\'t appeared in my balance. Transaction reference REF-DD-88291. Please investigate.',
        status: 'in_progress',
        createdAt: '2026-03-29T10:00:00Z',
        category: 'Deposits',
        replies: [
            { id: 'reply-001', authorId: 'admin-001', authorName: 'Support Team', isAdmin: true, message: 'Hi Marcus, we\'ve received your request and are investigating with our banking partner. We\'ll update you within 2 business hours.', createdAt: '2026-03-29T10:45:00Z' },
        ],
    },
    {
        id: 'ticket-002',
        userId: 'user-004',
        subject: 'KYC rejected — document was clear',
        message: 'My State ID was rejected but the image I submitted was perfectly clear and valid. I\'d like to understand why it was rejected and resubmit.',
        status: 'open',
        createdAt: '2026-03-30T08:30:00Z',
        category: 'KYC & Verification',
        replies: [],
    },
    {
        id: 'ticket-003',
        userId: 'user-002',
        subject: 'ACH account setup taking too long',
        message: 'I requested an ACH deposit account 2 days ago and it still shows as pending. When will the account details be ready?',
        status: 'open',
        createdAt: '2026-03-29T15:00:00Z',
        category: 'Account Setup',
        replies: [],
    },
    {
        id: 'ticket-004',
        userId: 'user-003',
        subject: 'Unable to initiate withdrawal',
        message: 'Every time I try to withdraw funds I get an error saying "Verification required". I haven\'t been able to access my money.',
        status: 'resolved',
        createdAt: '2026-03-25T09:00:00Z',
        category: 'Withdrawals',
        replies: [
            { id: 'reply-002', authorId: 'admin-001', authorName: 'Support Team', isAdmin: true, message: 'Hi DeShawn, withdrawals require KYC approval. Your verification is currently under review. Once approved, withdrawals will be enabled automatically.', createdAt: '2026-03-25T11:00:00Z' },
            { id: 'reply-003', authorId: 'user-003', authorName: 'DeShawn Williams', isAdmin: false, message: 'Got it, thank you for clarifying!', createdAt: '2026-03-25T11:30:00Z' },
        ],
    },
];

// ─── App State (in-memory simulation) ─────────────────────────────────────────
// Backend integration point: replace with React Context + API calls or Zustand store
let _users = [...MOCK_USERS];
const _transactions = [...MOCK_TRANSACTIONS];
let _tickets = [...MOCK_TICKETS];
let _currentUserId: string | null = 'user-001';
let _currentRole: 'user' | 'admin' | null = 'user';

export const AppStore = {
    // Auth
    getCurrentUser: (): User | null => {
        if (!_currentUserId) return null;
        if (_currentRole === 'admin') return { id: 'admin-001', firstName: 'Admin', lastName: 'Ops', email: 'admin@ewallet.io', role: 'admin' } as User;
        return _users.find(u => u.id === _currentUserId) || null;
    },
    login: (email: string, password: string): { success: boolean; role: 'user' | 'admin' } => {
        // Backend integration point: replace with real auth API
        if (email === 'admin@ewallet.io' && password === 'Admin@2026!') {
            _currentRole = 'admin';
            _currentUserId = 'admin-001';
            return { success: true, role: 'admin' };
        }
        const user = _users.find(u => u.email === email);
        if (user && password === 'User@2026!') {
            _currentUserId = user.id;
            _currentRole = 'user';
            return { success: true, role: 'user' };
        }
        return { success: false, role: 'user' };
    },
    logout: () => { _currentUserId = null; _currentRole = null; },
    register: (data: Partial<User>): User => {
        const newUser: User = {
            id: `user-${String(_users.length + 1).padStart(3, '0')}`,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            dob: data.dob || '',
            ssn_last4: data.ssn_last4 || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            zip: data.zip || '',
            balance: 0,
            kycStatus: 'not_started',
            depositAccountStatus: 'not_requested',
            createdAt: new Date().toISOString(),
            role: 'user',
            avatarColor: '#0f4c81',
        };
        _users.push(newUser);
        _currentUserId = newUser.id;
        _currentRole = 'user';
        return newUser;
    },

    // Users
    getUsers: () => _users.filter(u => u.role !== 'admin'),
    getUserById: (id: string) => _users.find(u => u.id === id),
    updateUser: (id: string, data: Partial<User>) => {
        _users = _users.map(u => u.id === id ? { ...u, ...data } : u);
        return _users.find(u => u.id === id);
    },

    // Transactions
    getTransactions: (userId?: string) => userId ? _transactions.filter(t => t.userId === userId) : _transactions,
    addTransaction: (txn: Omit<Transaction, 'id' | 'reference'>) => {
        const newTxn: Transaction = {
            ...txn,
            id: `txn-${String(_transactions.length + 1).padStart(3, '0')}`,
            reference: `REF-${txn.type.toUpperCase().slice(0, 2)}-${Math.floor(10000 + Math.random() * 90000)}`,
        };
        _transactions.unshift(newTxn);
        return newTxn;
    },
    deposit: (userId: string, amount: number, description: string) => {
        const user = _users.find(u => u.id === userId);
        if (!user) return null;
        _users = _users.map(u => u.id === userId ? { ...u, balance: u.balance + amount } : u);
        return AppStore.addTransaction({ userId, type: 'deposit', amount, description, status: 'completed', createdAt: new Date().toISOString(), counterparty: 'eWallet' });
    },
    withdraw: (userId: string, amount: number, description: string) => {
        const user = _users.find(u => u.id === userId);
        if (!user || user.balance < amount) return null;
        _users = _users.map(u => u.id === userId ? { ...u, balance: u.balance - amount } : u);
        return AppStore.addTransaction({ userId, type: 'withdrawal', amount, description, status: 'completed', createdAt: new Date().toISOString(), counterparty: 'eWallet' });
    },
    transfer: (fromId: string, toEmail: string, amount: number) => {
        const from = _users.find(u => u.id === fromId);
        const to = _users.find(u => u.email === toEmail);
        if (!from || !to || from.balance < amount) return { success: false, message: !to ? 'Recipient not found' : 'Insufficient balance' };
        _users = _users.map(u => {
            if (u.id === fromId) return { ...u, balance: u.balance - amount };
            if (u.id === to.id) return { ...u, balance: u.balance + amount };
            return u;
        });
        AppStore.addTransaction({ userId: fromId, type: 'transfer_out', amount, description: `Transfer to ${to.firstName} ${to.lastName}`, status: 'completed', createdAt: new Date().toISOString(), counterparty: `${to.firstName} ${to.lastName}` });
        AppStore.addTransaction({ userId: to.id, type: 'transfer_in', amount, description: `Transfer from ${from.firstName} ${from.lastName}`, status: 'completed', createdAt: new Date().toISOString(), counterparty: `${from.firstName} ${from.lastName}` });
        return { success: true, message: 'Transfer completed' };
    },

    // KYC
    submitKYC: (userId: string, docType: string) => {
        _users = _users.map(u => u.id === userId ? { ...u, kycStatus: 'submitted', kycSubmittedAt: new Date().toISOString(), kycDocumentType: docType } : u);
    },
    approveKYC: (userId: string) => {
        _users = _users.map(u => u.id === userId ? { ...u, kycStatus: 'approved' } : u);
    },
    rejectKYC: (userId: string) => {
        _users = _users.map(u => u.id === userId ? { ...u, kycStatus: 'rejected' } : u);
    },

    // Deposit Accounts
    requestDepositAccount: (userId: string, type: DepositType) => {
        _users = _users.map(u => u.id === userId ? { ...u, depositAccountStatus: 'requested', depositType: type } : u);
    },
    generateDepositAccount: (userId: string, accountNumber: string, routingNumber: string, bankName: string) => {
        _users = _users.map(u => u.id === userId ? {
            ...u,
            depositAccountStatus: 'active',
            depositAccountNumber: accountNumber,
            depositRoutingNumber: routingNumber,
            depositBankName: bankName,
        } : u);
    },

    // Tickets
    getTickets: (userId?: string) => userId ? _tickets.filter(t => t.userId === userId) : _tickets,
    addTicket: (ticket: Omit<SupportTicket, 'id' | 'replies' | 'status' | 'createdAt'>) => {
        const newTicket: SupportTicket = {
            ...ticket,
            id: `ticket-${String(_tickets.length + 1).padStart(3, '0')}`,
            status: 'open',
            createdAt: new Date().toISOString(),
            replies: [],
        };
        _tickets.push(newTicket);
        return newTicket;
    },
    replyToTicket: (ticketId: string, message: string, isAdmin: boolean, authorName: string, authorId: string) => {
        _tickets = _tickets.map(t => {
            if (t.id !== ticketId) return t;
            return {
                ...t,
                status: isAdmin ? 'in_progress' : t.status,
                replies: [...t.replies, {
                    id: `reply-${Date.now()}`,
                    authorId,
                    authorName,
                    isAdmin,
                    message,
                    createdAt: new Date().toISOString(),
                }],
            };
        });
    },
    resolveTicket: (ticketId: string) => {
        _tickets = _tickets.map(t => t.id === ticketId ? { ...t, status: 'resolved' } : t);
    },
    closeTicket: (ticketId: string) => {
        _tickets = _tickets.map(t => t.id === ticketId ? { ...t, status: 'closed' } : t);
    },

    // Stats for admin
    getStats: () => {
        const users = _users.filter(u => u.role !== 'admin');
        const allTxns = _transactions;
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const txns24h = allTxns.filter(t => new Date(t.createdAt) > oneDayAgo);
        return {
            totalUsers: users.length,
            pendingKYC: users.filter(u => u.kycStatus === 'submitted' || u.kycStatus === 'under_review').length,
            openTickets: _tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length,
            depositRequests: users.filter(u => u.depositAccountStatus === 'requested').length,
            volume24h: txns24h.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0),
            totalBalance: users.reduce((s, u) => s + u.balance, 0),
        };
    },
};