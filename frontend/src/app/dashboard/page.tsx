'use client';

import React from 'react';
import { Navigation, Footer } from '@/components/organisms';
import { Badge } from '@/components/atoms';

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Navigation />
      
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-text-primary mb-2">Dashboard</h1>
            <p className="text-text-secondary">
              Manage your alerts and view your transaction history
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-xl bg-bg-secondary border border-bg-tertiary">
              <div className="text-sm text-text-secondary mb-1">Active Alerts</div>
              <div className="text-3xl font-bold text-text-primary">3</div>
            </div>

            <div className="p-6 rounded-xl bg-bg-secondary border border-bg-tertiary">
              <div className="text-sm text-text-secondary mb-1">Estimates This Month</div>
              <div className="text-3xl font-bold text-text-primary">47</div>
            </div>

            <div className="p-6 rounded-xl bg-bg-secondary border border-bg-tertiary">
              <div className="text-sm text-text-secondary mb-1">Avg. Fee Saved</div>
              <div className="text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                23%
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary">Your Alerts</h2>
              <button className="px-4 py-2 rounded-lg bg-secondary text-white hover:bg-secondary-dark transition-colors">
                Create Alert
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-bg-secondary border border-bg-tertiary">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant="success">Active</Badge>
                      <span className="text-text-primary font-semibold">
                        STX Transfer - Below 0.0002 STX
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary">
                      Created 2 days ago • Triggered 3 times
                    </p>
                  </div>
                  <button className="text-text-secondary hover:text-text-primary">
                    ⋮
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-bg-secondary border border-bg-tertiary opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant="warning">Paused</Badge>
                      <span className="text-text-primary font-semibold">
                        NFT Mint - Below 0.005 STX
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary">
                      Created 1 week ago • Never triggered
                    </p>
                  </div>
                  <button className="text-text-secondary hover:text-text-primary">
                    ⋮
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Estimates */}
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Recent Estimates</h2>
            <div className="rounded-xl bg-bg-secondary border border-bg-tertiary overflow-hidden">
              <table className="w-full">
                <thead className="bg-bg-tertiary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bg-tertiary">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      STX Transfer
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      0.00018 STX
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      2 hours ago
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      Token Swap
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      0.00395 STX
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      5 hours ago
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
