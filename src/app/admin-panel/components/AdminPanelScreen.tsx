"use client";

import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Bell, Search, Settings, ShieldAlert, Menu } from 'lucide-react';

interface AdminPanelScreenProps {
  children: React.ReactNode;
}

export const AdminPanelScreen: React.FC<AdminPanelScreenProps> = ({ children }) => {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Admin Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
             <div className="lg:hidden">
                <Menu className="w-6 h-6 text-slate-600" />
             </div>
             <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                   System Dashboard 
                   <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Production</span>
                </h1>
             </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-xl w-80 text-slate-500 border border-transparent focus-within:border-primary/20 focus-within:bg-white transition-all">
               <Search size={18} />
               <input type="text" placeholder="Global search..." className="bg-transparent border-none outline-none text-sm w-full" />
            </div>

            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
               <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md">
                  <ShieldAlert size={20} />
               </div>
               <div className="hidden sm:block">
                  <p className="text-sm font-black text-slate-900">Master Admin</p>
                  <p className="text-[10px] font-bold text-slate-500 tracking-[0.1em] uppercase">Superuser Access</p>
               </div>
            </div>
          </div>
        </header>

        {/* Admin Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-12">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
