'use client';

import React from 'react';
import { Navigation, Footer, HistoricalChart } from '@/components/organisms';

export default function HistoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Navigation />
      
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-text-primary mb-2">Fee History</h1>
            <p className="text-text-secondary">
              Track STX fee trends over time to optimize your transaction timing
            </p>
          </div>

          <HistoricalChart />

          {/* Insights Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-bg-secondary border border-bg-tertiary">
              <h3 className="text-lg font-bold text-text-primary mb-4">💡 Best Time to Transact</h3>
              <p className="text-text-secondary mb-4">
                Based on historical data, fees are typically lowest between 2 AM - 6 AM UTC.
              </p>
              <div className="text-sm text-text-tertiary">
                Average savings: <span className="text-success font-semibold">23%</span>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-bg-secondary border border-bg-tertiary">
              <h3 className="text-lg font-bold text-text-primary mb-4">📈 Trend Analysis</h3>
              <p className="text-text-secondary mb-4">
                Fees have been <span className="text-success">decreasing</span> over the past 7 days.
              </p>
              <div className="text-sm text-text-tertiary">
                7-day change: <span className="text-success font-semibold">-15%</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
