import React from 'react';
import * as LucideIcons from 'lucide-react';

interface AppIconProps {
  name: keyof typeof LucideIcons;
  size?: number;
  className?: string;
  color?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({ name, size = 24, className = '', color }) => {
  const Icon = LucideIcons[name] as React.ElementType;
  
  if (!Icon) {
    console.warn(`Icon ${name} not found in lucide-react`);
    return null;
  }

  return <Icon size={size} className={className} color={color} />;
};
