import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'password';
  disabled?: boolean;
  error?: boolean;
}

export function Input({ 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  disabled = false,
  error = false
}: InputProps) {
  const baseStyles = 'w-full px-4 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 text-text-primary placeholder:text-text-tertiary';
  
  const stateStyles = error
    ? 'border-error focus:ring-error bg-error/5'
    : 'border-bg-tertiary focus:ring-secondary focus:border-secondary bg-bg-secondary';
  
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <input 
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(baseStyles, stateStyles, disabledStyles)}
    />
  );
}
