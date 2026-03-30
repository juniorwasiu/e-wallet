"use client";

import React from 'react';
import { Ticket, MessageSquare, User, Clock, AlertTriangle, ChevronRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const tickets = [
  { id: '#8923', subject: 'Withdrawal Delayed', user: 'bob@example.com', priority: 'High', status: 'Open', time: '15m ago' },
  { id: '#8922', subject: 'KYC Document Rejected', user: 'sarah@example.com', priority: 'Medium', status: 'Pending', time: '1h ago' },
  { id: '#8921', subject: 'Account Access Issue', user: 'jane@example.com', priority: 'Urgent', status: 'Open', time: '2h ago' },
];

export const AdminTickets: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
         <div>
            <h3 className="text-xl font-bold">Support Tickets</h3>
            <p className="text-sm text-slate-500 font-medium">Recent inquiries and issues from platform users.</p>
         </div>
         <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter by ID, user..." 
              className="bg-slate-100 border-none rounded-xl py-2 pl-10 pr-4 text-xs font-bold outline-none ring-2 ring-transparent focus:ring-primary/10 transition-all"
            />
         </div>
      </div>

      <div className="space-y-3">
        {tickets.map((ticket, i) => (
          <motion.div 
            key={ticket.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-primary/20 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4 flex-1">
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                 ticket.priority === 'Urgent' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
               }`}>
                  <MessageSquare size={18} />
               </div>
               <div>
                  <div className="flex items-center gap-2">
                     <span className="text-xs font-black text-primary">{ticket.id}</span>
                     <h4 className="text-sm font-bold text-slate-900">{ticket.subject}</h4>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">{ticket.user} • {ticket.time}</p>
               </div>
            </div>

            <div className="flex items-center gap-8">
               <div className="hidden md:block text-right">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${
                    ticket.priority === 'Urgent' ? 'text-red-500' : 'text-slate-400'
                  }`}>
                    {ticket.priority} Priority
                  </p>
                  <span className="text-xs font-bold text-slate-500">{ticket.status}</span>
               </div>
               <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>

      <button className="w-full mt-6 py-4 border border-dashed border-slate-200 rounded-2xl text-xs font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest">
         Load Historical Tickets
      </button>
    </div>
  );
};
