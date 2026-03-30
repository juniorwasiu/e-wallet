"use client";

import React, { useEffect, useState } from 'react';
import { UserSidebar } from './UserSidebar';
import { Bell, Search, User as UserIcon, Menu } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { SplashScreen } from '@/components/ui/SplashScreen';

interface UserDashboardScreenProps {
  children: React.ReactNode;
}

export const UserDashboardScreen: React.FC<UserDashboardScreenProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
      console.debug('Dashboard: User loaded', user?.email);
    };
    getUser();
  }, []);

  if (loading) return <SplashScreen />;

  return (
    <div className="flex bg-background min-h-screen">
      <UserSidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-border px-8 flex items-center justify-between bg-card/50 backdrop-blur-md sticky top-0 z-20">
          <div className="lg:hidden flex items-center gap-4">
             <Menu className="w-6 h-6 cursor-pointer" />
             <span className="font-bold">E-Wallet</span>
          </div>

          <div className="hidden md:flex items-center gap-4 bg-secondary/50 px-4 py-2 rounded-2xl w-96">
            <Search size={18} className="text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search transactions, users..." 
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer hover:bg-secondary p-2 rounded-full transition-colors">
              <Bell size={20} className="text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
            </div>
            
            <div className="flex items-center gap-3 pl-6 border-l border-border cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold truncate max-w-[120px]">{user?.user_metadata?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Verified Account</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <UserIcon size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
