"use client";

import React from 'react';
import { AppLogo } from '@/components/ui/AppLogo';
import { 
  BarChart3, 
  Users, 
  UserCheck, 
  DownloadCloud, 
  History, 
  Ticket, 
  ShieldAlert,
  LogOut,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminMenuItems = [
  { icon: BarChart3, label: 'Overview', href: '/admin-panel' },
  { icon: Users, label: 'Users Management', href: '/admin-panel/users' },
  { icon: UserCheck, label: 'KYC Queue', href: '/admin-panel/kyc' },
  { icon: DownloadCloud, label: 'Deposit Requests', href: '/admin-panel/deposits' },
  { icon: History, label: 'All Transactions', href: '/admin-panel/transactions' },
  { icon: Ticket, label: 'Support Tickets', href: '/admin-panel/tickets' },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-slate-900 text-slate-300 min-h-screen flex flex-col p-6 sticky top-0 hidden lg:flex">
      <div className="mb-12 flex items-center gap-2">
         <div className="bg-primary p-2 rounded-xl text-white">
            <ShieldAlert size={24} />
         </div>
         <span className="text-xl font-black text-white tracking-tight uppercase">Admin Core</span>
      </div>
      
      <nav className="flex-1 space-y-1">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-4">Management</p>
        {adminMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className={isActive ? '' : 'group-hover:text-primary transition-colors'} />
              <span className="font-bold text-sm tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800 space-y-1">
        <Link 
          href="/admin-panel/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all hover:text-white"
        >
          <Settings size={20} />
          <span className="font-bold text-sm tracking-wide">System Settings</span>
        </Link>
        <Link 
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 transition-all hover:text-destructive text-slate-400"
        >
          <LogOut size={20} />
          <span className="font-bold text-sm tracking-wide">Exit Admin</span>
        </Link>
      </div>
    </aside>
  );
};
