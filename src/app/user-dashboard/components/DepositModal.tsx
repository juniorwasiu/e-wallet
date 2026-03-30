"use client";

import React, { useState } from 'react';
import { X, CreditCard, Landmark, Wallet, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'card' | 'bank' | 'crypto'>('card');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onClose();
      alert('Deposit request submitted and pending approval!');
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
              <h3 className="text-2xl font-bold">Add Funds</h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-secondary rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold opacity-60 mb-2 block uppercase tracking-widest">Select Amount</label>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-primary">$</span>
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-secondary border-none rounded-3xl py-6 pl-12 pr-6 text-3xl font-black outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold opacity-60 mb-2 block uppercase tracking-widest">Payment Method</label>
                <div className="grid grid-cols-3 gap-4 text-center">
                   {[
                     { id: 'card', label: 'Credit Card', icon: CreditCard },
                     { id: 'bank', label: 'Bank Transfer', icon: Landmark },
                     { id: 'crypto', label: 'Crypto', icon: Wallet }
                   ].map((item) => (
                     <button 
                       key={item.id}
                       onClick={() => setMethod(item.id as any)}
                       className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${
                         method === item.id 
                         ? 'border-primary bg-primary/5 text-primary' 
                         : 'border-border hover:bg-secondary'
                       }`}
                     >
                       <item.icon size={24} />
                       <span className="text-xs font-bold">{item.label}</span>
                     </button>
                   ))}
                </div>
              </div>

              <div className="bg-secondary/50 p-6 rounded-3xl space-y-3">
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transaction Fee</span>
                    <span className="font-bold">$0.00</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Exchange Rate</span>
                    <span className="font-bold">1 USD = 1 USD</span>
                 </div>
                 <div className="pt-3 border-t border-border flex justify-between items-center">
                    <span className="font-bold">Total to Pay</span>
                    <span className="text-xl font-black text-primary">${amount || '0.00'}</span>
                 </div>
              </div>

              <button 
                disabled={!amount || loading}
                onClick={handleDeposit}
                className="w-full bg-primary text-primary-foreground py-5 rounded-3xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    Confirm Deposit
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
