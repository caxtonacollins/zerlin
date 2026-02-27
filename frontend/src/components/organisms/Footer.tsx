import React from 'react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full border-t border-bg-tertiary bg-bg-primary mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Zerlin
            </h3>
            <p className="text-text-secondary text-sm max-w-md">
              Real-time STX gas calculator and fee estimator for the Stacks blockchain. 
              Stop guessing. Start transacting.
            </p>
          </div>
          
          <div>
            <h4 className="text-text-primary font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-text-secondary hover:text-text-primary text-sm transition-colors">
                  Calculator
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-text-secondary hover:text-text-primary text-sm transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-text-secondary hover:text-text-primary text-sm transition-colors">
                  History
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-text-primary font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-text-secondary hover:text-text-primary text-sm transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/zerlin-io/zerlin" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-text-primary text-sm transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a 
                  href="https://twitter.com/zerlin_io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-text-primary text-sm transition-colors"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-bg-tertiary">
          <p className="text-text-tertiary text-sm text-center">
            © {currentYear} Zerlin. Built for the Stacks ecosystem.
          </p>
        </div>
      </div>
    </footer>
  );
}
