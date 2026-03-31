'use client';

import React, { useEffect, useState } from 'react';
import AppLogo from '@/components/ui/AppLogo';

interface SplashScreenProps {
    onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
    const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('hold'), 600);
        const t2 = setTimeout(() => setPhase('exit'), 2200);
        const t3 = setTimeout(() => onComplete(), 2800);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-500 ${phase === 'exit' ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                }`}
            style={{
                background: 'linear-gradient(135deg, hsl(214,74%,12%) 0%, hsl(214,74%,22%) 50%, hsl(220,60%,28%) 100%)',
            }}
        >
            {/* Animated background circles */}
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl"
                    style={{ animation: 'pulse 3s ease-in-out infinite' }}
                />
                <div
                    className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-400/10 blur-3xl"
                    style={{ animation: 'pulse 4s ease-in-out infinite', animationDelay: '1s' }}
                />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(hsl(0,0%,100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0,0%,100%) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            </div>

            {/* Content */}
            <div
                className={`relative z-10 flex flex-col items-center transition-all duration-600 ${phase === 'enter' ? 'opacity-0 translate-y-6 scale-95' : 'opacity-100 translate-y-0 scale-100'
                    }`}
                style={{ transitionDuration: '600ms' }}
            >
                {/* Logo with ring animation */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-full bg-white/10 animate-ping" style={{ animationDuration: '2s' }} />
                    <div className="relative w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
                        <AppLogo size={44} />
                    </div>
                </div>

                {/* Brand name */}
                <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                    eWallet
                </h1>
                <p className="text-blue-300 text-sm font-medium tracking-widest uppercase">
                    Your money, everywhere
                </p>

                {/* Loading bar */}
                <div className="mt-10 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"
                        style={{
                            width: phase === 'enter' ? '0%' : phase === 'hold' ? '70%' : '100%',
                            transition: phase === 'enter' ? 'width 0.6s ease-out' : phase === 'hold' ? 'width 1.4s ease-out' : 'width 0.4s ease-out',
                        }}
                    />
                </div>

                {/* Tagline */}
                <p
                    className={`mt-6 text-blue-400 text-xs transition-all duration-500 delay-300 ${phase === 'enter' ? 'opacity-0' : 'opacity-100'
                        }`}
                >
                    Secure · Fast · Verified
                </p>
            </div>
        </div>
    );
}
