import React from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className
}: ButtonProps) {
  const baseStyles = 'rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95';
  
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30',
    ghost: 'bg-transparent text-text-primary hover:bg-bg-secondary focus:ring-text-tertiary'
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const disabledStyles = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], disabledStyles, className)}
    >
      {loading && (
        <span className="mr-2 inline-block">
          <Spinner size={size === 'lg' ? 'md' : 'sm'} />
        </span>
      )}
      {children}
    </button>
  );
}
