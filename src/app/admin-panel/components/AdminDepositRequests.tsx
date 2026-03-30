"use client";

import React from 'react';
import { DownloadCloud, Check, X, ArrowDownLeft, Landmark, DollarSign, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const deposits = [
  { id: 1, user: 'alice@example.com', amount: '$5,000.00', method: 'Bank Transfer', status: 'Pending', time: '5 mins ago' },
  { id: 2, user: 'bob@example.com', amount: '$150.00', method: 'Credit Card', status: 'Pending', time: '12 mins ago' },
  { id: 3, user: 'charlie@example.com', amount: '$10,200.00', method: 'Crypto', status: 'Reviewing', time: '45 mins ago' },
];

export const AdminDepositRequests: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
         <div>
            <h3 className="text-xl font-bold">Deposit Requests</h3>
            <p className="text-sm text-slate-500 font-medium">Approve or flag incoming fund additions.</p>
         </div>
         <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-green-100 flex items-center gap-2">
            <DollarSign size={14} />
            Total Pending: $15,350.00
         </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <th className="px-4 py-4">User</th>
              <th className="px-4 py-4">Amount</th>
              <th className="px-4 py-4">Method</th>
              <th className="px-4 py-4">Submitted</th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((req, i) => (
              <motion.tr 
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
              >
                <td className="px-4 py-6">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                         <DownloadCloud size={16} />
                      </div>
                      <span className="text-sm font-bold text-slate-900">{req.user}</span>
                   </div>
                </td>
                <td className="px-4 py-6 font-black text-slate-900">{req.amount}</td>
                <td className="px-4 py-6">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Landmark size={14} />
                      {req.method}
                   </div>
                </td>
                <td className="px-4 py-6">
                   <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <Clock size={12} />
                      {req.time}
                   </div>
                </td>
                <td className="px-4 py-6 text-right">
                   <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-all">
                        <X size={18} />
                      </button>
                      <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all shadow-md">
                        Approve
                      </button>
                   </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
