import React from 'react';
import Link from 'next/link';
import { AppLogo } from '@/components/ui/AppLogo';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <AppLogo className="mb-12" />
      
      <div className="relative mb-8">
        <h1 className="text-[12rem] font-black text-secondary leading-none">404</h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-2xl font-bold bg-background px-4">Page not found</p>
        </div>
      </div>
      
      <p className="text-muted-foreground max-w-md mb-12">
        Oops! The page you are looking for doesn't exist or has been moved. 
        Let's get you back on track.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/">
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:shadow-lg transition-all">
            <Home size={20} />
            Back to Home
          </button>
        </Link>
        <button 
          onClick={() => window.history.back()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-2xl font-bold hover:bg-secondary/80 transition-all"
        >
          <ArrowLeft size={20} />
          Go Back
        </button>
      </div>
    </div>
  );
}
