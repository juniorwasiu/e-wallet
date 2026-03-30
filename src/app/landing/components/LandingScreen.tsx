"use client";

import React from 'react';
import { AppLogo } from '@/components/ui/AppLogo';
import { ArrowRight, Shield, Zap, Globe, Github } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export const LandingScreen: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-border/50 backdrop-blur-md">
        <AppLogo />
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="#security" className="hover:text-primary transition-colors">Security</Link>
          <Link href="#about" className="hover:text-primary transition-colors">About</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-up-login-screen">
            <button className="px-4 py-2 text-sm font-semibold hover:text-primary transition-colors">
              Login
            </button>
          </Link>
          <Link href="/sign-up-login-screen?mode=signup">
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95">
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            The Future of <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-600 to-purple-600">
              Digital Banking
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Secure, lightning-fast digital wallet powered by real-time technology. 
            Manage your assets, transfer globally, and stay in control of your finances.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up-login-screen?mode=signup">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-primary/20 group">
                Open Free Account
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-secondary text-secondary-foreground rounded-2xl font-bold text-lg hover:bg-secondary/80 transition-colors">
               Explore Demo
            </button>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <section id="features" className="mt-32 grid md:grid-cols-3 gap-8 text-left">
          {[
            { icon: <Zap className="text-yellow-500" />, title: "Instant Transfers", desc: "Send money globally in split seconds with no hidden fees." },
            { icon: <Shield className="text-green-500" />, title: "Bank-Grade Security", desc: "Your assets are protected with the latest encryption standards." },
            { icon: <Globe className="text-blue-500" />, title: "Real-time Updates", desc: "Track every transaction as it happens with live notifications." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-8 rounded-3xl bg-card/50 border border-border/50 backdrop-blur-xl hover:border-primary/50 transition-colors group"
            >
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/50 py-12 px-6 bg-card/5 md:flex items-center justify-between max-w-7xl mx-auto">
        <AppLogo size={24} />
        <p className="text-sm text-muted-foreground mt-4 md:mt-0">
          © 2026 E-Wallet Inc. All rights reserved. Built with Next.js & Supabase.
        </p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Github className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
        </div>
      </footer>
    </div>
  );
};
