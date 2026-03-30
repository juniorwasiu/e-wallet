import React from 'react';
import { Wallet } from 'lucide-react';

interface AppLogoProps {
  className?: string;
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = '', size = 32 }) => {
  return (
    <div className={`flex items-center gap-2 font-bold text-2xl tracking-tight ${className}`}>
      <div className="bg-primary p-2 rounded-xl text-primary-foreground shadow-lg shadow-primary/20 animate-pulse">
        <Wallet size={size} />
      </div>
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
        E-Wallet
      </span>
    </div>
  );
};
