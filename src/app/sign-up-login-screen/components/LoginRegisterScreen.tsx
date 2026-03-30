"use client";

import React, { useState } from 'react';
import { AppLogo } from '@/components/ui/AppLogo';
import { supabase } from '@/lib/supabaseClient';
import { Mail, Lock, User, Github, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export const LoginRegisterScreen: React.FC = () => {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    console.debug(`Starting auth process: ${mode} for ${email}`);
    
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        alert('Check your email for confirmation!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/user-dashboard');
      }
    } catch (err: any) {
      console.error(`Auth error: ${err.message}`);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Decoration (Desktop Only) */}
      <div className="hidden md:flex flex-[1.2] bg-primary relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-400 rounded-full blur-[150px] opacity-30" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-purple-400 rounded-full blur-[150px] opacity-30" />
        
        <div className="relative z-10 max-w-lg text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold mb-6 leading-tight">Welcome to the <br/>New Era of Finance.</h2>
            <p className="text-xl opacity-90 mb-12">Join thousands of users who trust E-Wallet for their daily digital transactions and secure asset management.</p>
            
            <div className="space-y-6">
              {[
                "Instant P2P Transfers",
                "Advanced Security Protocols",
                "Real-time Balance Tracking"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</div>
                  <span className="font-medium">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Content / Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="mb-12 text-center md:text-left">
            <AppLogo className="mb-8 justify-center md:justify-start" />
            <h1 className="text-3xl font-bold mb-2">
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'login' 
                ? 'Enter your credentials to access your account' 
                : 'Start your journey with us today'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-sm font-medium px-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-secondary border-none rounded-2xl py-4 pl-12 pr-4 outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium px-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-secondary border-none rounded-2xl py-4 pl-12 pr-4 outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium px-1 flex justify-between">
                Password
                {mode === 'login' && <span className="text-primary cursor-pointer hover:underline">Forgot?</span>}
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-secondary border-none rounded-2xl py-4 pl-12 pr-4 outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-2xl flex items-center gap-3 text-sm animate-shake">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Sign Up'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4 text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase tracking-widest whitespace-nowrap">Or continue with</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4">
            <button className="flex items-center justify-center gap-3 bg-card border border-border py-4 rounded-2xl font-medium hover:bg-secondary transition-colors">
              <Github size={20} />
              GitHub
            </button>
          </div>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="ml-2 font-bold text-primary hover:underline transition-all"
            >
              {mode === 'login' ? 'Create Account' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
