'use client';

import React from 'react';
import { FeeCalculator, Navigation, Footer } from '@/components/organisms';
import { NetworkStatus } from '@/components/molecules';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Navigation />
      
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Stop Guessing.
              </span>
              <br />
              <span className="text-text-primary">Start Transacting.</span>
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Real-time STX gas calculator for the Stacks blockchain. 
              Know exactly how much you need before your transaction fails.
            </p>
          </div>

          {/* Network Status */}
          <div className="flex justify-center mb-8">
            <NetworkStatus congestion="low" />
          </div>

          {/* Fee Calculator */}
          <FeeCalculator />

          {/* Features Grid */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-bg-secondary border border-bg-tertiary">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-text-primary mb-2">
                Real-time Estimates
              </h3>
              <p className="text-text-secondary">
                Get instant fee calculations based on current network conditions
              </p>
            </div>

            <div className="p-6 rounded-xl bg-bg-secondary border border-bg-tertiary">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-text-primary mb-2">
                Historical Trends
              </h3>
              <p className="text-text-secondary">
                View fee patterns over time to optimize your transaction timing
              </p>
            </div>

            <div className="p-6 rounded-xl bg-bg-secondary border border-bg-tertiary">
              <div className="text-3xl mb-4">🔔</div>
              <h3 className="text-xl font-bold text-text-primary mb-2">
                Smart Alerts
              </h3>
              <p className="text-text-secondary">
                Get notified when fees drop below your target threshold
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
