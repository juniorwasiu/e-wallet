'use client';

import React from 'react';
import { LayoutDashboard, Shield, Building2, HeadphonesIcon, Users, ArrowLeftRight, LogOut, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { db } from '@/lib/db';
import { AdminSection } from './AdminPanelScreen';

interface Props {
    section: AdminSection;
    onSectionChange: (s: AdminSection) => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
    stats: { pendingKYC: number; openTickets: number; depositRequests: number };
}

const NAV_ITEMS: { id: AdminSection; label: string; icon: React.ElementType; badgeKey?: keyof Props['stats'] }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'kyc', label: 'KYC Queue', icon: Shield, badgeKey: 'pendingKYC' },
    { id: 'deposits', label: 'Deposit Requests', icon: Building2, badgeKey: 'depositRequests' },
    { id: 'tickets', label: 'Support Tickets', icon: HeadphonesIcon, badgeKey: 'openTickets' },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
];

export default function AdminSidebar({ section, onSectionChange, collapsed, onToggleCollapse, stats }: Props) {
    return (
        <aside className={`fixed left-0 top-0 h-full bg-[hsl(214,74%,16%)] flex flex-col transition-all duration-300 z-40 ${collapsed ? 'w-16' : 'w-64'}`}>
            {/* Logo */}
            <div className={`flex items-center h-16 px-4 border-b border-white/10 ${collapsed ? 'justify-center' : 'gap-3'}`}>
                <AppLogo size={32} />
                {!collapsed && (
                    <div>
                        <span className="font-bold text-white text-base tracking-tight">eWallet</span>
                        <span className="block text-blue-300 text-xs font-medium">Admin Panel</span>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                {!collapsed && (
                    <p className="text-blue-400/60 text-xs font-semibold uppercase tracking-wider px-3 mb-2">Operations</p>
                )}
                {NAV_ITEMS.map((item) => {
                    const isActive = section === item.id;
                    const badgeCount = item.badgeKey ? stats[item.badgeKey] : 0;
                    return (
                        <button
                            key={`admin-nav-${item.id}`}
                            onClick={() => onSectionChange(item.id)}
                            title={collapsed ? item.label : undefined}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative
                ${isActive ? 'bg-white/15 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'}
                ${collapsed ? 'justify-center px-0' : ''}`}
                        >
                            <item.icon size={18} className="shrink-0" />
                            {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                            {!collapsed && badgeCount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{badgeCount}</span>
                            )}
                            {collapsed && badgeCount > 0 && (
                                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="border-t border-white/10 p-3 space-y-1">
                <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-all ${collapsed ? 'justify-center px-0' : ''}`}>
                    <Settings size={16} />
                    {!collapsed && <span>Settings</span>}
                </button>
                <button
                    onClick={async () => { await db.auth.signOut(); window.location.href = '/sign-up-login-screen'; }}
                    title={collapsed ? 'Sign Out' : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all ${collapsed ? 'justify-center px-0' : ''}`}
                >
                    <LogOut size={16} />
                    {!collapsed && <span>Sign Out</span>}
                </button>
                <button
                    onClick={onToggleCollapse}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-300 hover:bg-white/10 transition-all ${collapsed ? 'justify-center px-0' : 'justify-end'}`}
                >
                    {collapsed ? <ChevronRight size={16} /> : <><span className="flex-1 text-left text-xs">Collapse</span><ChevronLeft size={16} /></>}
                </button>
            </div>
        </aside>
    );
}