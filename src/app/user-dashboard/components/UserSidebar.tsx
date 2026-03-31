'use client';

import React from 'react';
import { Wallet, ArrowLeftRight, User, Shield, HeadphonesIcon, LogOut, ChevronLeft, ChevronRight, Bell, X } from 'lucide-react';
import { User as UserType, AppStore } from '@/lib/store';
import AppLogo from '@/components/ui/AppLogo';
import { UserSection } from './UserDashboardScreen';

interface Props {
    user: UserType;
    section: UserSection;
    onSectionChange: (s: UserSection) => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
}

const NAV_ITEMS: { id: UserSection; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'wallet', label: 'My Wallet', icon: Wallet },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'kyc', label: 'KYC Verification', icon: Shield },
    { id: 'support', label: 'Support', icon: HeadphonesIcon },
];

export default function UserSidebar({ user, section, onSectionChange, collapsed, onToggleCollapse }: Props) {
    const initials = `${user.firstName[0]}${user.lastName[0]}`;
    const kycPending = user.kycStatus === 'not_started' || user.kycStatus === 'submitted';

    return (
        <aside className={`fixed left-0 top-0 h-full bg-white border-r border-[hsl(var(--border))] flex flex-col transition-all duration-300 z-40 shadow-sm ${collapsed ? 'w-16' : 'w-64'}`}>
            {/* Logo */}
            <div className={`flex items-center h-16 px-4 border-b border-[hsl(var(--border))] ${collapsed ? 'justify-center' : 'justify-between'}`}>
                <div className="flex items-center gap-3">
                    <AppLogo size={32} />
                    {!collapsed && <span className="font-bold text-lg text-[hsl(var(--primary))] tracking-tight">eWallet</span>}
                </div>
                {/* Mobile close button */}
                {!collapsed && (
                    <button
                        onClick={onToggleCollapse}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
                    >
                        <X size={16} className="text-[hsl(var(--muted-foreground))]" />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const isActive = section === item.id;
                    const showBadge = item.id === 'kyc' && kycPending;
                    return (
                        <button
                            key={`nav-${item.id}`}
                            onClick={() => onSectionChange(item.id)}
                            title={collapsed ? item.label : undefined}
                            className={`sidebar-item w-full relative ${isActive ? 'sidebar-item-active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
                        >
                            <item.icon size={18} className="shrink-0" />
                            {!collapsed && (
                                <span className="flex-1 text-left">{item.label}</span>
                            )}
                            {!collapsed && showBadge && (
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                            )}
                            {collapsed && showBadge && (
                                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="border-t border-[hsl(var(--border))] p-3 space-y-2">
                {!collapsed && (
                    <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-[hsl(var(--muted))]">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: user.avatarColor }}>
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{user.email}</p>
                        </div>
                        <Bell size={14} className="text-[hsl(var(--muted-foreground))] shrink-0" />
                    </div>
                )}
                <button
                    onClick={() => { AppStore.logout(); window.location.href = '/sign-up-login-screen'; }}
                    title={collapsed ? 'Sign Out' : undefined}
                    className={`sidebar-item w-full text-red-500 hover:bg-red-50 hover:text-red-600 ${collapsed ? 'justify-center px-0' : ''}`}
                >
                    <LogOut size={16} />
                    {!collapsed && <span>Sign Out</span>}
                </button>
                {/* Desktop collapse toggle only */}
                <button
                    onClick={onToggleCollapse}
                    className={`hidden lg:flex sidebar-item w-full ${collapsed ? 'justify-center px-0' : 'justify-end'}`}
                >
                    {collapsed ? <ChevronRight size={16} /> : <><span className="flex-1 text-left text-xs">Collapse</span><ChevronLeft size={16} /></>}
                </button>
            </div>
        </aside>
    );
}