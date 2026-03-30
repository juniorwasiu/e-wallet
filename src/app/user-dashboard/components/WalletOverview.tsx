"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  CreditCard,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';

export const WalletOverview: React.FC = () => {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Main Balance Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="md:col-span-2 lg:col-span-2 p-8 rounded-[2.5rem] bg-gradient-to-br from-primary via-indigo-600 to-indigo-700 text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/20"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <CreditCard size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Total Balance</p>
              <div className="flex items-center gap-4">
                <h3 className="text-4xl md:text-5xl font-black tracking-tight">
                  {showBalance ? '$45,285.00' : '••••••••'}
                </h3>
                <button 
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                >
                  {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-2xl flex items-center gap-2 text-sm font-bold">
              <TrendingUp size={16} />
              +2.5%
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button className="flex-1 min-w-[140px] bg-white text-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-95 transition-all active:scale-95 shadow-lg shadow-black/5">
              <Plus size={20} />
              Deposit
            </button>
            <button className="flex-1 min-w-[140px] bg-white/20 backdrop-blur-md text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/30 transition-all active:scale-95">
              <ArrowUpRight size={20} />
              Send
            </button>
            <button className="flex-1 min-w-[140px] bg-white/20 backdrop-blur-md text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/30 transition-all active:scale-95">
              <ArrowDownLeft size={20} />
              Withdraw
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats / Savings */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="p-8 rounded-[2.5rem] bg-card border border-border flex flex-col justify-between"
      >
        <div>
          <h4 className="text-xl font-bold mb-1">Weekly Savings</h4>
          <p className="text-sm text-muted-foreground mb-6">You saved 15% more than last week!</p>
          
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Vacation Goal</span>
                <span className="text-sm font-bold">$1,200 / $5,000</span>
             </div>
             <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[24%]" />
             </div>
          </div>
        </div>
        
        <button className="text-primary font-bold text-sm mt-8 flex items-center gap-2 hover:translate-x-1 transition-transform">
           View Savings Analysis <ArrowRight size={16} />
        </button>
      </motion.div>
    </div>
  );
};

const ArrowRight = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
);
