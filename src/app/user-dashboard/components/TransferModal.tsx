"use client";

import React, { useState } from 'react';
import { X, Send, ArrowRight, Loader2, Search, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleTransfer = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
      alert('Transfer successful!');
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
            className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">Send Money</h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-secondary rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {step === 1 ? (
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-bold opacity-60 mb-2 block uppercase tracking-widest">To Recipient</label>
                    <div className="relative group">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                      <input 
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="w-full bg-secondary border-none rounded-3xl py-5 pl-14 pr-6 font-bold outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all text-sm"
                        placeholder="Email or Wallet ID"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-secondary/30 rounded-3xl">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-muted-foreground/60">Recent Recipients</p>
                     <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {[1, 2, 3, 4].map((i) => (
                          <button key={i} className="flex flex-col items-center gap-2 shrink-0">
                             <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                                <User size={24} />
                             </div>
                             <span className="text-[10px] font-bold">User {i}</span>
                          </button>
                        ))}
                     </div>
                  </div>

                  <button 
                    disabled={!recipient}
                    onClick={() => setStep(2)}
                    className="w-full bg-primary text-primary-foreground py-5 rounded-3xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    Next Step
                    <ArrowRight size={20} />
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center pb-4 border-b border-border">
                     <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-4">
                        <User size={32} />
                     </div>
                     <p className="font-black text-xl">{recipient}</p>
                     <button onClick={() => setStep(1)} className="text-xs font-bold text-primary mt-1 hover:underline">Change Recipient</button>
                  </div>

                  <div>
                    <label className="text-sm font-bold opacity-60 mb-2 block uppercase tracking-widest text-center">Amount to Send</label>
                    <div className="relative group text-center">
                      <span className="text-5xl font-black text-primary mr-2">$</span>
                      <input 
                        type="number"
                        value={amount}
                        autoFocus
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-transparent border-none w-48 text-5xl font-black outline-none text-center font-mono"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <button 
                    disabled={!amount || loading}
                    onClick={handleTransfer}
                    className="w-full bg-primary text-primary-foreground py-5 rounded-3xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : (
                      <>
                        Send Now
                        <Send size={20} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
