"use client";

import React from 'react';
import { MessageCircle, HelpCircle, Mail, Phone, ExternalLink, ChevronRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export const SupportSection: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-black mb-2">How can we help?</h2>
        <p className="text-muted-foreground font-medium">Explore our help center or talk to our experts.</p>
      </div>

      <div className="relative group max-w-2xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
        <input 
          type="text"
          className="w-full bg-card border border-border rounded-[2rem] py-6 pl-14 pr-6 font-bold outline-none ring-4 ring-transparent focus:ring-primary/5 transition-all text-sm shadow-sm"
          placeholder="Search for articles, guides..."
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: MessageCircle, label: 'Live Chat', desc: 'Talk to an agent', color: 'text-green-600 bg-green-50' },
          { icon: Mail, label: 'Email Us', desc: 'Get a reply in 2hr', color: 'text-blue-600 bg-blue-50' },
          { icon: Phone, label: 'Call Support', desc: 'available 24/7', color: 'text-purple-600 bg-purple-50' }
        ].map((item, i) => (
          <button 
            key={i}
            className="p-8 rounded-[2.5rem] bg-card border border-border text-center hover:border-primary transition-all hover:shadow-xl hover:shadow-primary/5 group"
          >
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 ${item.color} group-hover:scale-110 transition-transform`}>
              <item.icon size={28} />
            </div>
            <h4 className="font-black mb-1">{item.label}</h4>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{item.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-[2.5rem] p-8">
          <h4 className="text-xl font-bold mb-6">Frequently Asked Questions</h4>
          <div className="space-y-4">
            {[
              "How long do withdrawals take?",
              "What are the transaction fees?",
              "How do I secure my account?",
              "Where can I find my wallet ID?"
            ].map((q, i) => (
              <button key={i} className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 rounded-2xl transition-colors text-left group">
                <span className="text-sm font-bold">{q}</span>
                <ChevronRight size={18} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-900 to-black rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 p-8 opacity-20">
              <HelpCircle size={100} />
           </div>
           
           <div className="relative z-10">
              <h4 className="text-3xl font-black mb-6 leading-tight">Need custom <br/>help for Business?</h4>
              <p className="text-indigo-200 text-sm font-medium mb-8 max-w-xs">
                Our business support team is ready to help you with API integrations and high-volume limits.
              </p>
           </div>
           
           <button className="relative z-10 w-fit flex items-center gap-2 bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-indigo-400 transition-colors">
              Contact Sales <ExternalLink size={16} />
           </button>
        </div>
      </div>
    </div>
  );
};
