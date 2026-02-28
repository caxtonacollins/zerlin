import Link from 'next/link';
import { WalletConnect } from '../molecules';

export function Navigation() {
  return (
    <nav className="w-full border-b border-bg-tertiary bg-bg-primary/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Zerlin
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-text-secondary hover:text-text-primary transition-colors px-3 py-2 rounded-lg hover:bg-bg-secondary"
              >
                Calculator
              </Link>
              <Link 
                href="/dashboard" 
                className="text-text-secondary hover:text-text-primary transition-colors px-3 py-2 rounded-lg hover:bg-bg-secondary"
              >
                Dashboard
              </Link>
              <Link 
                href="/history" 
                className="text-text-secondary hover:text-text-primary transition-colors px-3 py-2 rounded-lg hover:bg-bg-secondary"
              >
                History
              </Link>
              <Link 
                href="/docs" 
                className="text-text-secondary hover:text-text-primary transition-colors px-3 py-2 rounded-lg hover:bg-bg-secondary"
              >
                Docs
              </Link>
            </div>
          </div>
          
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}
