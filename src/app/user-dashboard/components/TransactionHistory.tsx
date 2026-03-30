"use client";

import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShoppingBag, 
  Zap, 
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const transactions = [
  { id: 1, type: 'withdraw', label: 'Starbucks Coffee', amount: '-$12.50', status: 'Completed', date: 'Today, 09:42 AM', icon: ShoppingBag, color: 'text-orange-500 bg-orange-50' },
  { id: 2, type: 'deposit', label: 'Salary Deposit', amount: '+$4,500.00', status: 'Completed', date: 'Yesterday, 14:20 PM', icon: Zap, color: 'text-green-500 bg-green-50' },
  { id: 3, type: 'transfer', label: 'To John Doe', amount: '-$150.00', status: 'Pending', date: '28 Mar, 2026', icon: ArrowUpRight, color: 'text-blue-500 bg-blue-50' },
  { id: 4, type: 'deposit', label: 'Refund Amazon', amount: '+$89.00', status: 'Completed', date: '27 Mar, 2026', icon: ShoppingBag, color: 'text-purple-500 bg-purple-50' },
];

export const TransactionHistory: React.FC = () => {
  return (
    <div className="bg-card border border-border rounded-[2.5rem] p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold">Recent Transactions</h3>
          <p className="text-sm text-muted-foreground">Monitoring your daily activity</p>
        </div>
        <button className="p-2 hover:bg-secondary rounded-xl transition-colors">
          <MoreHorizontal size={20} className="text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-4">
        {transactions.map((tx, i) => (
          <motion.div 
            key={tx.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between p-4 hover:bg-secondary/50 rounded-2xl transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.color} group-hover:scale-110 transition-transform`}>
                <tx.icon size={20} />
              </div>
              <div>
                <p className="font-bold">{tx.label}</p>
                <p className="text-xs text-muted-foreground">{tx.date}</p>
              </div>
            </div>
            
            <div className="text-right flex items-center gap-4">
              <div>
                <p className={`font-black ${tx.type === 'deposit' ? 'text-green-600' : 'text-foreground'}`}>
                  {tx.amount}
                </p>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${
                  tx.status === 'Completed' ? 'text-green-500' : 'text-amber-500'
                }`}>
                  {tx.status}
                </p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>

      <button className="w-full mt-8 py-4 border border-dashed border-border rounded-2xl text-sm font-bold text-muted-foreground hover:bg-secondary transition-all">
        View All Transactions
      </button>
    </div>
  );
};
