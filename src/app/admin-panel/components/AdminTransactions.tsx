"use client";

import React from 'react';
import { History, ArrowUpRight, ArrowDownLeft, Shield, MoreHorizontal, Filter, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const allTransactions = [
  { id: 'TX4902', from: 'alice@example.com', to: 'System', type: 'Deposit', amount: '+$500.00', status: 'Completed', date: 'Mar 30, 2026, 14:10' },
  { id: 'TX4901', from: 'System', to: 'charlie@example.com', type: 'Withdraw', amount: '-$1,200.00', status: 'Processing', date: 'Mar 30, 2026, 12:45' },
  { id: 'TX4900', from: 'bob@example.com', to: 'alice@example.com', type: 'P2P Transfer', amount: '$75.00', status: 'Completed', date: 'Mar 29, 2026, 21:30' },
  { id: 'TX4899', from: 'diana@example.com', to: 'System', type: 'Withdraw', amount: '-$50.00', status: 'Flagged', date: 'Mar 29, 2026, 18:05' },
];

export const AdminTransactions: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div>
           <h3 className="text-xl font-bold">Comprehensive Ledger</h3>
           <p className="text-sm text-slate-500 font-medium">Complete history of all platform financial movements.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors">
              <Filter size={14} />
              Filter
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
              <Download size={14} />
              Export CSV
           </button>
        </div>
      </div>

      <div className="overflow-x-auto text-nowrap">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <th className="px-4 py-4">TX ID</th>
              <th className="px-4 py-4">Sender / Recipient</th>
              <th className="px-4 py-4">Type</th>
              <th className="px-4 py-4">Amount</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Timestamp</th>
              <th className="px-4 py-4 text-right">---</th>
            </tr>
          </thead>
          <tbody>
            {allTransactions.map((tx, i) => (
              <motion.tr 
                key={tx.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
              >
                <td className="px-4 py-6 text-xs font-black text-primary">{tx.id}</td>
                <td className="px-4 py-6">
                   <div className="text-sm">
                      <p className="font-bold text-slate-900">{tx.from}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">To: {tx.to}</p>
                   </div>
                </td>
                <td className="px-4 py-6">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{tx.type}</span>
                </td>
                <td className="px-4 py-6 font-black text-slate-900">{tx.amount}</td>
                <td className="px-4 py-6">
                   <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${
                     tx.status === 'Completed' ? 'bg-green-50 text-green-700' : 
                     tx.status === 'Flagged' ? 'bg-destructive/10 text-destructive' : 'bg-blue-50 text-blue-700'
                   }`}>
                      {tx.status}
                   </span>
                </td>
                <td className="px-4 py-6 text-xs text-slate-400 font-medium">{tx.date}</td>
                <td className="px-4 py-6 text-right">
                   <button className="p-2 hover:bg-white rounded-lg transition-colors">
                      <MoreHorizontal size={18} className="text-slate-300" />
                   </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
