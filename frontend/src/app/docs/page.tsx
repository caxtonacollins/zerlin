'use client';

import React from 'react';
import { Navigation, Footer } from '@/components/organisms';

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Navigation />
      
      <main className="flex-1 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-text-primary mb-8">Documentation</h1>

          {/* Quick Start */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Quick Start</h2>
            <div className="p-6 rounded-xl bg-bg-secondary border border-bg-tertiary">
              <p className="text-text-secondary mb-4">
                Zerlin provides real-time STX fee estimation for the Stacks blockchain. 
                Get started in seconds:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-text-secondary">
                <li>Select your transaction type</li>
                <li>View the estimated fee</li>
                <li>Connect your wallet to check balance</li>
                <li>Execute your transaction with confidence</li>
              </ol>
            </div>
          </section>

          {/* API Integration */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-text-primary mb-4">API Integration</h2>
            <div className="p-6 rounded-xl bg-bg-secondary border border-bg-tertiary">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Estimate Fee</h3>
              <div className="bg-bg-primary p-4 rounded-lg mb-4 overflow-x-auto">
                <code className="text-sm text-secondary">
                  POST /api/estimate
                </code>
              </div>
              <p className="text-text-secondary mb-4">Request body:</p>
              <div className="bg-bg-primary p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm text-text-secondary">
{`{
  "type": "transfer",
  "payload": {
    "amount": 1000000,
    "recipient": "SP2X0TZ..."
  }
}`}
                </pre>
              </div>
            </div>
          </section>

          {/* Transaction Types */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Supported Transaction Types</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-bg-secondary border border-bg-tertiary">
                <h3 className="font-semibold text-text-primary mb-2">STX Transfer</h3>
                <p className="text-sm text-text-secondary">
                  Simple STX token transfers between addresses
                </p>
              </div>
              <div className="p-4 rounded-xl bg-bg-secondary border border-bg-tertiary">
                <h3 className="font-semibold text-text-primary mb-2">Contract Call</h3>
                <p className="text-sm text-text-secondary">
                  Execute functions on deployed smart contracts
                </p>
              </div>
              <div className="p-4 rounded-xl bg-bg-secondary border border-bg-tertiary">
                <h3 className="font-semibold text-text-primary mb-2">NFT Mint</h3>
                <p className="text-sm text-text-secondary">
                  Mint new NFTs on the Stacks blockchain
                </p>
              </div>
              <div className="p-4 rounded-xl bg-bg-secondary border border-bg-tertiary">
                <h3 className="font-semibold text-text-primary mb-2">Token Swap</h3>
                <p className="text-sm text-text-secondary">
                  Swap tokens on DEXs like ALEX, Bitflow, or Velar
                </p>
              </div>
            </div>
          </section>

          {/* Smart Contracts */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Smart Contracts</h2>
            <div className="p-6 rounded-xl bg-bg-secondary border border-bg-tertiary">
              <p className="text-text-secondary mb-4">
                Zerlin uses on-chain smart contracts to store canonical fee data:
              </p>
              <ul className="space-y-2 text-text-secondary">
                <li>• <span className="text-text-primary font-mono text-sm">fee-oracle-v1</span> - Stores current fee rates</li>
                <li>• <span className="text-text-primary font-mono text-sm">tx-templates-v1</span> - Pre-calculated gas costs</li>
                <li>• <span className="text-text-primary font-mono text-sm">smart-alerts-v1</span> - User alert system</li>
              </ul>
            </div>
          </section>

          {/* Support */}
          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Need Help?</h2>
            <div className="p-6 rounded-xl bg-bg-secondary border border-bg-tertiary">
              <p className="text-text-secondary mb-4">
                Get support through our community channels:
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="https://github.com/zerlin-io/zerlin" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-bg-tertiary text-text-primary hover:bg-bg-primary transition-colors"
                >
                  GitHub
                </a>
                <a 
                  href="https://discord.gg/zerlin" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-bg-tertiary text-text-primary hover:bg-bg-primary transition-colors"
                >
                  Discord
                </a>
                <a 
                  href="https://twitter.com/zerlin_io" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-bg-tertiary text-text-primary hover:bg-bg-primary transition-colors"
                >
                  Twitter
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
