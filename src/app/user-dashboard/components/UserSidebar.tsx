"use client";

import React from 'react';
import { AppLogo } from '@/components/ui/AppLogo';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Users, 
  ShieldCheck, 
  HelpCircle, 
  LogOut,
  Settings,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/user-dashboard' },
  { icon: Wallet, label: 'My Wallet', href: '/user-dashboard/wallet' },
  { icon: ArrowUpRight, label: 'Transfer', href: '/user-dashboard/transfer' },
  { icon: ShieldCheck, label: 'KYC Verification', href: '/user-dashboard/kyc' },
  { icon: HelpCircle, label: 'Support', href: '/user-dashboard/support' },
];

export const UserSidebar: React.FC = () => {
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <aside className="w-72 bg-card border-r border-border min-h-screen flex flex-col p-6 sticky top-0 hidden lg:flex">
      <AppLogo className="mb-12" />
      
      <nav className="flex-1 space-y-2">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 mb-4">Main Menu</p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                isActive 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon size={20} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
              <span className="font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-border space-y-2">
        <Link 
          href="/user-dashboard/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-secondary transition-all text-muted-foreground hover:text-foreground"
        >
          <Settings size={20} />
          <span className="font-semibold">Settings</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-destructive/10 transition-all text-muted-foreground hover:text-destructive"
        >
          <LogOut size={20} />
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  );
};
