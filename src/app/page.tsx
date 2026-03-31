'use client';

import React, { useState, useEffect } from 'react';
import SplashScreen from '@/components/SplashScreen';
import LandingScreen from './landing/components/LandingScreen';

export default function Home() {
    const [showSplash, setShowSplash] = useState(true);
    const [splashDone, setSplashDone] = useState(false);

    useEffect(() => {
        // Only show splash on first visit per session
        const seen = sessionStorage.getItem('splash_seen');
        if (seen) {
            setShowSplash(false);
            setSplashDone(true);
        }
    }, []);

    const handleSplashComplete = () => {
        sessionStorage.setItem('splash_seen', '1');
        setShowSplash(false);
        setSplashDone(true);
    };

    return (
        <>
            {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
            {splashDone && <LandingScreen />}
        </>
    );
}