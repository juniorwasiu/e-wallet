"use client";

import React, { useState } from 'react';
import { Shield, Upload, CheckCircle, Info, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const KYCSection: React.FC = () => {
  const [status, setStatus] = useState<'not_started' | 'pending' | 'verified'>('not_started');

  return (
    <div className="space-y-8">
      <div className="bg-card border border-border rounded-[2.5rem] p-10 overflow-hidden relative">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="w-48 h-48 rounded-[3rem] bg-secondary flex items-center justify-center text-primary shrink-0 transition-transform hover:scale-105 duration-500">
             <Shield size={80} />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-3xl font-black mb-4">Identity Verification</h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl font-medium leading-relaxed">
              Verify your identity to unlock higher transaction limits, enable instant withdrawals, and increase your account security.
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest">
                <CheckCircle size={14} className="text-green-500" />
                Higher Limits
              </div>
              <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest">
                <CheckCircle size={14} className="text-green-500" />
                Priority Support
              </div>
              <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest">
                <CheckCircle size={14} className="text-green-500" />
                Global Access
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Verification Status Card */}
        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h4 className="text-xl font-bold">Verification Flow</h4>
              <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                status === 'not_started' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {status.replace('_', ' ')}
              </div>
           </div>

           <div className="space-y-6">
              {[
                { step: 1, title: 'Upload ID Document', desc: 'Passport, Driver License, or National ID', status: 'done' },
                { step: 2, title: 'Selfie Verification', desc: 'A quick 3D face scan to match your document', status: 'current' },
                { step: 3, title: 'Address Proof', desc: 'Utility bill or bank statement (Optional)', status: 'pending' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    item.status === 'done' ? 'bg-green-500 text-white' : 
                    item.status === 'current' ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {item.status === 'done' ? <CheckCircle size={14} /> : item.step}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm group-hover:text-primary transition-colors">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
           </div>

           <button 
             onClick={() => setStatus('pending')}
             className="w-full mt-10 bg-primary text-primary-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/20 transition-all group"
           >
             Continue Verification
             <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>

        {/* Info Box */}
        <div className="space-y-8">
           <div className="bg-secondary/40 p-8 rounded-[2.5rem] border border-border/50">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary mb-6 shadow-sm">
                <Info size={24} />
              </div>
              <h4 className="text-lg font-bold mb-3">Why verify?</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Regulations require us to collect and verify information about our users. This helps us prevent fraud, money laundering, and ensures the security of your funds.
              </p>
           </div>

           <div className="flex items-center gap-4 p-6 bg-blue-50/50 border border-blue-100 rounded-3xl text-blue-800 text-sm italic">
              <Clock size={20} className="shrink-0" />
              <p>Applications are usually reviewed within 15-30 minutes during business hours.</p>
           </div>
        </div>
      </div>
    </div>
  );
};
