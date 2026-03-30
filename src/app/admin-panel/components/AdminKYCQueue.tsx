"use client";

import React from 'react';
import { Check, X, Eye, FileText, UserCheck, Clock, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const queue = [
  { id: 1, name: 'John Smith', type: 'Passport', submitted: '10 mins ago', level: 'Level 2' },
  { id: 2, name: 'Sarah Wilson', type: 'Driver License', submitted: '25 mins ago', level: 'Level 1' },
  { id: 3, name: 'Mike Ross', type: 'National ID', submitted: '1 hour ago', level: 'Level 2' },
];

export const AdminKYCQueue: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
           <div>
              <h3 className="text-xl font-bold">KYC Verification Queue</h3>
              <p className="text-sm text-slate-500 font-medium">Approve or reject pending identity verifications.</p>
           </div>
           <div className="flex items-center gap-3">
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-blue-100">
                <Clock size={14} />
                Avg Wait: 12m
              </div>
           </div>
        </div>

        <div className="grid gap-4">
           {queue.map((item, i) => (
             <motion.div 
               key={item.id}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               className="p-6 border border-slate-100 rounded-[1.5rem] flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-slate-50 transition-colors group"
             >
               <div className="flex items-center gap-4 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                     <FileText size={24} />
                  </div>
                  <div>
                     <h4 className="font-bold text-slate-900">{item.name}</h4>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.type} • {item.level}</p>
                  </div>
               </div>

               <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 mr-4">{item.submitted}</span>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors">
                     <Eye size={14} />
                     Review
                  </button>
                  <div className="flex items-center gap-2">
                     <button className="p-2 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive hover:text-white transition-all">
                        <X size={18} />
                     </button>
                     <button className="p-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-600 hover:text-white transition-all">
                        <Check size={18} />
                     </button>
                  </div>
               </div>
             </motion.div>
           ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-10 text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.1),transparent)]" />
         
         <div className="w-20 h-20 bg-primary/20 rounded-[2rem] flex items-center justify-center text-primary shrink-0">
            <UserCheck size={40} />
         </div>
         
         <div className="flex-1 text-center md:text-left relative z-10">
            <h4 className="text-2xl font-black mb-2 tracking-tight">Verified Users Overview</h4>
            <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-lg">
               System has automatically verified <span className="text-green-400 font-black">2,451</span> users today using AI-match technology. Human intervention required only for 5% of cases.
            </p>
         </div>

         <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm hover:scale-105 transition-transform flex items-center gap-2 relative z-10 shadow-xl shadow-black/20">
            Analytics Report <ExternalLink size={16} />
         </button>
      </div>
    </div>
  );
};
