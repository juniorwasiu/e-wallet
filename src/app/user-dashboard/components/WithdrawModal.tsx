"use client";

import React, { useState } from 'react';
import { X, Landmark, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
      alert('Withdrawal request submitted and pending approval!');
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">Withdraw Funds</h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-secondary rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 text-amber-700 text-sm">
                <AlertTriangle className="shrink-0" size={20} />
                <p>Withdrawals are processed within 24 hours after approval. Make sure your bank details are correct.</p>
              </div>

              <div>
                <label className="text-sm font-bold opacity-60 mb-2 block uppercase tracking-widest">Amount to Withdraw</label>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-primary">$</span>
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-secondary border-none rounded-3xl py-6 pl-12 pr-6 text-3xl font-black outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all font-mono"
                    placeholder="0.00"
                  />
                </div>
                <div className="mt-2 flex justify-between items-center px-1">
                   <p className="text-xs text-muted-foreground">Available Balance: <span className="font-bold text-foreground">$45,285.00</span></p>
                   <button onClick={() => setAmount('45285')} className="text-xs font-bold text-primary hover:underline">Withdraw All</button>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold opacity-60 mb-2 block uppercase tracking-widest">Destination Bank</label>
                <button className="w-full p-6 bg-secondary hover:bg-secondary/80 rounded-3xl flex items-center justify-between transition-colors border border-dashed border-border/50">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                         <Landmark size={20} />
                      </div>
                      <div className="text-left">
                         <p className="font-bold text-sm">Chase Bank •••• 4242</p>
                         <p className="text-xs text-muted-foreground">Checking Account</p>
                      </div>
                   </div>
                   <ArrowRight size={18} className="text-muted-foreground" />
                </button>
              </div>

              <button 
                disabled={!amount || loading}
                onClick={handleWithdraw}
                className="w-full bg-primary text-primary-foreground py-5 rounded-3xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    Confirm Withdrawal
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
