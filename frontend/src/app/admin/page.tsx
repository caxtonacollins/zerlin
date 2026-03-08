'use client';

import { AdminDashboard } from '@/components/organisms/admin/AdminDashboard';
import { Navigation } from '@/components/organisms';
import { Toaster } from 'react-hot-toast';

export default function AdminPage() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid #2d2d44',
          },
        }}
      />
      <div className="min-h-screen flex flex-col bg-bg-primary">
        <Navigation />
        <main className="flex-1 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AdminDashboard />
          </div>
        </main>
      </div>
    </>
  );
}
