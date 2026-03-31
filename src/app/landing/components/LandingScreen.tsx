'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Shield, Zap, Globe, Wallet, ArrowRight, Check, Star, TrendingUp, Lock, CreditCard, Smartphone, ChevronDown, ArrowDownLeft, Send, BarChart3, Bell } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

export default function LandingScreen() {
    const [scrollY, setScrollY] = useState(0);
    const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibleSections((prev) => new Set([...prev, entry.target.id]));
                    }
                });
            },
            { threshold: 0.1 }
        );

        const sections = document.querySelectorAll('[data-animate]');
        sections.forEach((section) => observerRef.current?.observe(section));

        return () => observerRef.current?.disconnect();
    }, []);

    const isVisible = (id: string) => visibleSections.has(id);

    return (
        <div className="min-h-screen bg-[hsl(220,20%,97%)] overflow-x-hidden">
            {/* ── NAVBAR ── */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 40 ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-[hsl(var(--border))]' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <AppLogo size={32} />
                        <span className="font-bold text-xl text-[hsl(var(--primary))] tracking-tight">eWallet</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">Features</a>
                        <a href="#security" className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">Security</a>
                        <a href="#pricing" className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">Pricing</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/sign-up-login-screen" className="hidden sm:block text-sm font-semibold text-[hsl(var(--primary))] hover:underline">Sign In</Link>
                        <Link href="/sign-up-login-screen" className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5">
                            Get Started <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(214,74%,12%)] via-[hsl(214,74%,20%)] to-[hsl(220,60%,28%)]" />
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-400/10 blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-3xl" />
                </div>
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(hsl(0,0%,100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0,0%,100%) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Left content */}
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-blue-200 text-xs font-semibold tracking-wide uppercase">Now live — FDIC insured accounts</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
                                Banking built for<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
                                    how you live.
                                </span>
                            </h1>

                            <p className="text-blue-200 text-lg leading-relaxed mb-10 max-w-lg">
                                Open a verified digital wallet in minutes. ACH transfers, direct deposit, instant peer-to-peer payments — all in one place with zero monthly fees.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                                <Link href="/sign-up-login-screen" className="inline-flex items-center justify-center gap-2 bg-white text-[hsl(var(--primary))] px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all duration-200 active:scale-95 shadow-lg shadow-black/20">
                                    Open Free Account <ArrowRight size={16} />
                                </Link>
                                <a href="#features" className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-white/20 transition-all duration-200">
                                    See how it works <ChevronDown size={16} />
                                </a>
                            </div>

                            <div className="flex flex-wrap items-center gap-6">
                                {[
                                    { label: '$0 monthly fees', icon: Check },
                                    { label: 'FDIC insured', icon: Shield },
                                    { label: 'Instant setup', icon: Zap },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center">
                                            <item.icon size={11} className="text-emerald-400" />
                                        </div>
                                        <span className="text-blue-200 text-sm font-medium">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right — floating wallet card mockup */}
                        <div className="relative hidden lg:flex items-center justify-center">
                            <div className="relative w-80">
                                {/* Main card */}
                                <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <AppLogo size={24} />
                                            <span className="text-white font-bold text-sm">eWallet</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                            <Bell size={14} className="text-white" />
                                        </div>
                                    </div>
                                    <p className="text-blue-300 text-xs font-medium mb-1">Available Balance</p>
                                    <p className="text-white text-3xl font-bold tabular-nums mb-1">$12,450.00</p>
                                    <div className="flex items-center gap-1.5 mb-6">
                                        <TrendingUp size={12} className="text-emerald-400" />
                                        <span className="text-emerald-400 text-xs font-semibold">+$2,300 this month</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 mb-6">
                                        {[
                                            { label: 'Add', icon: ArrowDownLeft, color: 'bg-emerald-500/20' },
                                            { label: 'Send', icon: Send, color: 'bg-blue-500/20' },
                                            { label: 'Pay', icon: CreditCard, color: 'bg-purple-500/20' },
                                            { label: 'More', icon: BarChart3, color: 'bg-amber-500/20' },
                                        ].map((btn) => (
                                            <div key={btn.label} className={`${btn.color} rounded-xl p-2.5 flex flex-col items-center gap-1`}>
                                                <btn.icon size={16} className="text-white" />
                                                <span className="text-white text-[10px] font-semibold">{btn.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-2.5">
                                        {[
                                            { label: 'Direct Deposit', amount: '+$3,200.00', time: 'Today', color: 'text-emerald-400' },
                                            { label: 'Transfer to Sarah', amount: '-$450.00', time: 'Yesterday', color: 'text-red-400' },
                                            { label: 'ACH Deposit', amount: '+$1,800.00', time: 'Mar 28', color: 'text-emerald-400' },
                                        ].map((txn) => (
                                            <div key={txn.label} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                                                        <Wallet size={12} className="text-blue-300" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white text-xs font-medium">{txn.label}</p>
                                                        <p className="text-blue-300 text-[10px]">{txn.time}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-xs font-bold tabular-nums ${txn.color}`}>{txn.amount}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Floating notification */}
                                <div className="absolute -top-4 -right-8 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <ArrowDownLeft size={14} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[hsl(var(--foreground))]">Payment received</p>
                                        <p className="text-xs text-emerald-600 font-semibold">+$3,200.00</p>
                                    </div>
                                </div>

                                {/* Floating KYC badge */}
                                <div className="absolute -bottom-4 -left-8 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Shield size={14} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[hsl(var(--foreground))]">KYC Verified</p>
                                        <p className="text-xs text-blue-600 font-semibold">Full access unlocked</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
                    <span className="text-blue-300 text-xs font-medium">Scroll to explore</span>
                    <ChevronDown size={16} className="text-blue-300" />
                </div>
            </section>

            {/* ── STATS BAR ── */}
            <section className="bg-white border-y border-[hsl(var(--border))]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: '$2.4B+', label: 'Total processed', sub: 'in 2025' },
                            { value: '180K+', label: 'Active wallets', sub: 'and growing' },
                            { value: '99.97%', label: 'Uptime SLA', sub: 'guaranteed' },
                            { value: '<2s', label: 'Transfer speed', sub: 'peer-to-peer' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-2xl sm:text-3xl font-bold text-[hsl(var(--primary))] tabular-nums">{stat.value}</p>
                                <p className="text-sm font-semibold text-[hsl(var(--foreground))] mt-1">{stat.label}</p>
                                <p className="text-xs text-[hsl(var(--muted-foreground))]">{stat.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES BENTO ── */}
            <section id="features" className="py-20 lg:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div
                        id="features-header"
                        data-animate
                        className={`text-center mb-16 transition-all duration-700 ${isVisible('features-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    >
                        <span className="inline-block text-xs font-bold uppercase tracking-widest text-[hsl(var(--primary))] bg-blue-50 px-3 py-1.5 rounded-full mb-4">Everything you need</span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[hsl(var(--foreground))] leading-tight">
                            A wallet that works<br />as hard as you do.
                        </h2>
                        <p className="text-[hsl(var(--muted-foreground))] text-lg mt-4 max-w-2xl mx-auto">
                            From instant transfers to compliance-grade KYC — every feature built for real financial needs.
                        </p>
                    </div>

                    {/* Bento grid */}
                    <div
                        id="features-bento"
                        data-animate
                        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-700 delay-200 ${isVisible('features-bento') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    >
                        {/* Large card — Instant Transfers */}
                        <div className="lg:col-span-2 bg-gradient-to-br from-[hsl(214,74%,18%)] to-[hsl(214,74%,30%)] rounded-2xl p-8 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
                                    <Zap size={24} className="text-cyan-300" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Instant peer-to-peer transfers</h3>
                                <p className="text-blue-200 text-base leading-relaxed max-w-md">
                                    Send money to any eWallet user in under 2 seconds. No waiting, no fees, no friction. Just type an amount and hit send.
                                </p>
                                <div className="mt-6 flex items-center gap-3">
                                    <div className="flex -space-x-2">
                                        {['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'].map((color, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-[hsl(214,74%,24%)] flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: color }}>
                                                {['M', 'S', 'A', 'J'][i]}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-blue-300 text-sm">180,000+ users sending daily</span>
                                </div>
                            </div>
                        </div>

                        {/* KYC card */}
                        <div className="bg-white border border-[hsl(var(--border))] rounded-2xl p-6 group hover:shadow-lg transition-shadow duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
                                <Shield size={24} className="text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-2">KYC Verification</h3>
                            <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">
                                FinCEN-compliant identity verification. Submit once, unlock everything — withdrawals, transfers, and higher limits.
                            </p>
                            <div className="mt-5 space-y-2">
                                {['Driver\'s License', 'Passport', 'State ID'].map((doc) => (
                                    <div key={doc} className="flex items-center gap-2">
                                        <Check size={14} className="text-emerald-500 shrink-0" />
                                        <span className="text-sm text-[hsl(var(--foreground))]">{doc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ACH card */}
                        <div className="bg-white border border-[hsl(var(--border))] rounded-2xl p-6 group hover:shadow-lg transition-shadow duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
                                <Globe size={24} className="text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-2">ACH & Direct Deposit</h3>
                            <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">
                                Connect your employer or bank. Get your paycheck deposited directly — up to 2 days early with qualifying accounts.
                            </p>
                            <div className="mt-5 bg-[hsl(var(--muted))] rounded-xl p-3">
                                <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">Routing Number</p>
                                <p className="font-mono text-sm font-bold text-[hsl(var(--foreground))] mt-0.5">021 000 089</p>
                            </div>
                        </div>

                        {/* Transaction history */}
                        <div className="bg-white border border-[hsl(var(--border))] rounded-2xl p-6 group hover:shadow-lg transition-shadow duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-5">
                                <BarChart3 size={24} className="text-purple-600" />
                            </div>
                            <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-2">Full Transaction History</h3>
                            <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">
                                Every transaction logged with reference numbers. Export to PDF for tax records or bank reconciliation.
                            </p>
                            <div className="mt-5 flex items-center gap-2 text-purple-600 text-sm font-semibold">
                                <Download size={14} />
                                <span>PDF export included</span>
                            </div>
                        </div>

                        {/* Large card — Security */}
                        <div id="security" className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white relative overflow-hidden group">
                            <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                                    <Lock size={24} className="text-slate-300" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Bank-grade security, always on.</h3>
                                <p className="text-slate-300 text-base leading-relaxed max-w-md mb-6">
                                    256-bit AES encryption, multi-factor authentication, and real-time fraud monitoring protect every transaction.
                                </p>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { label: '256-bit AES', sub: 'Encryption' },
                                        { label: 'SOC 2 Type II', sub: 'Certified' },
                                        { label: 'FDIC Insured', sub: 'Up to $250K' },
                                    ].map((item) => (
                                        <div key={item.label} className="bg-white/10 rounded-xl p-3 text-center">
                                            <p className="text-white font-bold text-sm">{item.label}</p>
                                            <p className="text-slate-400 text-xs mt-0.5">{item.sub}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Mobile app card */}
                        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-blue-100 rounded-2xl p-6 group hover:shadow-lg transition-shadow duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-5">
                                <Smartphone size={24} className="text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-2">Mobile-first design</h3>
                            <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">
                                Fully responsive on every device. Manage your wallet from your phone, tablet, or desktop — seamlessly.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="py-20 bg-white border-y border-[hsl(var(--border))]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div
                        id="how-it-works"
                        data-animate
                        className={`transition-all duration-700 ${isVisible('how-it-works') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    >
                        <div className="text-center mb-16">
                            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[hsl(var(--primary))] bg-blue-50 px-3 py-1.5 rounded-full mb-4">Simple process</span>
                            <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))]">Up and running in 3 minutes.</h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                            {[
                                {
                                    step: '01',
                                    title: 'Create your account',
                                    desc: 'Fill in your name, address, and contact details. No credit check, no minimum balance required.',
                                    color: 'bg-blue-600',
                                    lightColor: 'bg-blue-50',
                                    textColor: 'text-blue-600',
                                },
                                {
                                    step: '02',
                                    title: 'Verify your identity',
                                    desc: 'Submit a government-issued ID for KYC compliance. Our team reviews within 1–2 business days.',
                                    color: 'bg-emerald-600',
                                    lightColor: 'bg-emerald-50',
                                    textColor: 'text-emerald-600',
                                },
                                {
                                    step: '03',
                                    title: 'Start transacting',
                                    desc: 'Deposit funds via ACH or direct deposit, then send, receive, and manage money instantly.',
                                    color: 'bg-purple-600',
                                    lightColor: 'bg-purple-50',
                                    textColor: 'text-purple-600',
                                },
                            ].map((item, i) => (
                                <div key={item.step} className="relative">
                                    {i < 2 && (
                                        <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-[hsl(var(--border))] to-transparent z-0 -translate-x-4" />
                                    )}
                                    <div className={`w-16 h-16 rounded-2xl ${item.lightColor} flex items-center justify-center mb-6 relative z-10`}>
                                        <span className={`text-2xl font-black ${item.textColor}`}>{item.step}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-3">{item.title}</h3>
                                    <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PRICING ── */}
            <section id="pricing" className="py-20 lg:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div
                        id="pricing-section"
                        data-animate
                        className={`transition-all duration-700 ${isVisible('pricing-section') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    >
                        <div className="text-center mb-16">
                            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[hsl(var(--primary))] bg-blue-50 px-3 py-1.5 rounded-full mb-4">Transparent pricing</span>
                            <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))]">No hidden fees. Ever.</h2>
                            <p className="text-[hsl(var(--muted-foreground))] text-lg mt-4">One plan, everything included.</p>
                        </div>

                        <div className="max-w-lg mx-auto">
                            <div className="bg-gradient-to-br from-[hsl(214,74%,18%)] to-[hsl(214,74%,28%)] rounded-3xl p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-2 bg-emerald-400/20 border border-emerald-400/30 rounded-full px-3 py-1 mb-6">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        <span className="text-emerald-300 text-xs font-semibold">Most popular</span>
                                    </div>
                                    <div className="flex items-end gap-2 mb-2">
                                        <span className="text-5xl font-black">$0</span>
                                        <span className="text-blue-300 text-lg mb-2">/month</span>
                                    </div>
                                    <p className="text-blue-200 mb-8">Everything you need to manage your money.</p>
                                    <div className="space-y-3 mb-8">
                                        {[
                                            'Unlimited ACH transfers',
                                            'Direct deposit setup',
                                            'Peer-to-peer payments',
                                            'Full transaction history & PDF export',
                                            'KYC verification included',
                                            '24/7 support access',
                                            'FDIC insurance up to $250,000',
                                        ].map((feature) => (
                                            <div key={feature} className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0">
                                                    <Check size={11} className="text-emerald-400" />
                                                </div>
                                                <span className="text-blue-100 text-sm">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <Link href="/sign-up-login-screen" className="w-full flex items-center justify-center gap-2 bg-white text-[hsl(var(--primary))] px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all duration-200 active:scale-95">
                                        Open Free Account <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section className="py-20 bg-white border-t border-[hsl(var(--border))]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div
                        id="testimonials"
                        data-animate
                        className={`transition-all duration-700 ${isVisible('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">Trusted by real people.</h2>
                            <div className="flex items-center justify-center gap-1 mt-3">
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-amber-400 fill-amber-400" />)}
                                <span className="text-[hsl(var(--muted-foreground))] text-sm ml-2">4.9/5 from 12,000+ reviews</span>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                {
                                    name: 'Marcus O.',
                                    role: 'Freelance Designer',
                                    quote: 'I get paid by clients all over the country. eWallet makes it dead simple — ACH deposits hit within a day and I can transfer to my bank instantly.',
                                    avatar: 'M',
                                    color: '#3b82f6',
                                },
                                {
                                    name: 'Priya N.',
                                    role: 'Software Engineer',
                                    quote: 'The KYC process was surprisingly smooth. Submitted my passport, got verified in less than 24 hours. Now I use it for all my freelance payments.',
                                    avatar: 'P',
                                    color: '#8b5cf6',
                                },
                                {
                                    name: 'James T.',
                                    role: 'Small Business Owner',
                                    quote: 'Zero monthly fees and instant transfers? I moved my entire business payments here. The transaction history export is a lifesaver at tax time.',
                                    avatar: 'J',
                                    color: '#059669',
                                },
                            ].map((t) => (
                                <div key={t.name} className="bg-[hsl(var(--muted))] rounded-2xl p-6">
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}
                                    </div>
                                    <p className="text-[hsl(var(--foreground))] text-sm leading-relaxed mb-5">&quot;{t.quote}&quot;</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: t.color }}>
                                            {t.avatar}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[hsl(var(--foreground))]">{t.name}</p>
                                            <p className="text-xs text-[hsl(var(--muted-foreground))]">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-20 lg:py-28 bg-gradient-to-br from-[hsl(214,74%,14%)] to-[hsl(214,74%,26%)] relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-cyan-400/10 blur-3xl" />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                        Your wallet is waiting.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">Open yours today.</span>
                    </h2>
                    <p className="text-blue-200 text-lg mb-10 max-w-2xl mx-auto">
                        Join 180,000+ people who manage their money smarter with eWallet. Free forever, no credit card required.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/sign-up-login-screen" className="inline-flex items-center justify-center gap-2 bg-white text-[hsl(var(--primary))] px-8 py-4 rounded-xl font-bold text-base hover:bg-blue-50 transition-all duration-200 active:scale-95 shadow-lg shadow-black/20">
                            Create Free Account <ArrowRight size={18} />
                        </Link>
                        <Link href="/sign-up-login-screen" className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-white/20 transition-all duration-200">
                            Sign In Instead
                        </Link>
                    </div>
                    <p className="text-blue-300 text-sm mt-6">No credit check · No monthly fees · Cancel anytime</p>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="bg-slate-950 text-slate-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2.5 mb-3">
                                <AppLogo size={28} />
                                <span className="font-bold text-lg text-white">eWallet</span>
                            </div>
                            <p className="text-sm text-slate-500 max-w-xs">Licensed Money Services Business. FDIC insured deposits up to $250,000.</p>
                        </div>
                        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
                            <a href="#features" className="hover:text-white transition-colors">Features</a>
                            <a href="#security" className="hover:text-white transition-colors">Security</a>
                            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                            <Link href="/sign-up-login-screen" className="hover:text-white transition-colors">Sign In</Link>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
                        <p>© 2026 eWallet Inc. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-slate-400 transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Missing import
function Download({ size, className }: { size: number; className?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    );
}
