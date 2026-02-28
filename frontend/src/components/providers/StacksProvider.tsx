'use client';

interface StacksProviderProps {
  children: React.ReactNode;
}

export function StacksProvider({ children }: StacksProviderProps) {
  // In @stacks/connect v8, configuration is handled per-request
  // No global configuration needed
  return <>{children}</>;
}
