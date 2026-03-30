"use client";

import React from 'react';
import { 
  Users, 
  Wallet, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownLeft,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Total Users', value: '12,543', change: '+12%', icon: Users, color: 'text-blue-600 bg-blue-50' },
  { label: 'Total Deposits', value: '$1.2M', change: '+8%', icon: DollarSign, color: 'text-green-600 bg-green-50' },
  { label: 'Pending KYC', value: '42', change: '-5', icon: AlertCircle, color: 'text-orange-600 bg-orange-50' },
  { label: 'Active Tickets', value: '18', change: '+2', icon: Wallet, color: 'text-purple-600 bg-purple-50' },
];

export const AdminOverview: React.FC = () => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
               <stat.icon size={24} />
            </div>
            <div className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-full uppercase tracking-widest">
               {stat.change}
            </div>
          </div>
          <p className="text-sm font-bold text-slate-500 mb-1">{stat.label}</p>
          <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
        </motion.div>
      ))}
    </div>
  );
};
