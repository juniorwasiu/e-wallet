"use client";

import React from 'react';
import { Search, MoreVertical, ShieldCheck, Mail, Calendar, UserX } from 'lucide-react';
import { motion } from 'framer-motion';

const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', status: 'Verified', joined: 'Mar 12, 2026', balance: '$4,285.00' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', status: 'Pending', joined: 'Mar 25, 2026', balance: '$0.00' },
  { id: 3, name: 'Charlie Davis', email: 'charlie@example.com', status: 'Verified', joined: 'Jan 15, 2026', balance: '$12,450.00' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', status: 'Blocked', joined: 'Feb 02, 2026', balance: '$50.00' },
];

export const AdminUsers: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div>
           <h3 className="text-xl font-bold">User Directory</h3>
           <p className="text-sm text-slate-500 font-medium">Manage and monitor all platform participants.</p>
        </div>
        <div className="relative w-full md:w-80 group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
           <input 
             type="text" 
             placeholder="Search name, email..." 
             className="w-full bg-slate-100 border-none rounded-xl py-3 pl-12 pr-4 text-sm outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all font-bold"
           />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <th className="px-4 py-4">User</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Joined Date</th>
              <th className="px-4 py-4 text-right">Balance</th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <motion.tr 
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                       {user.name[0]}
                    </div>
                    <div>
                       <p className="text-sm font-bold text-slate-900">{user.name}</p>
                       <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-6">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                     user.status === 'Verified' ? 'bg-green-100 text-green-700' : 
                     user.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-destructive/10 text-destructive'
                   }`}>
                      {user.status}
                   </span>
                </td>
                <td className="px-4 py-6 text-sm text-slate-500 font-medium">{user.joined}</td>
                <td className="px-4 py-6 text-right font-black text-slate-900">{user.balance}</td>
                <td className="px-4 py-6 text-right">
                   <button className="p-2 hover:bg-white rounded-lg transition-colors shadow-sm">
                      <MoreVertical size={18} className="text-slate-400" />
                   </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between text-sm">
         <p className="text-slate-500 font-medium tracking-tight">Showing 4 of 12,543 users</p>
         <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-slate-100 rounded-xl font-bold hover:bg-slate-200 transition-colors">Previous</button>
            <button className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">Next Page</button>
         </div>
      </div>
    </div>
  );
};
