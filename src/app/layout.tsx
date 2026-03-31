import React from 'react';
import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/lib/AuthContext';
import '../styles/tailwind.css';

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
};

export const metadata: Metadata = {
    title: 'eWallet — Your Digital Money, Simplified',
    description: 'eWallet lets you deposit, withdraw, and transfer money securely with full KYC compliance and real-time transaction tracking.',
    icons: {
        icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
    },
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}