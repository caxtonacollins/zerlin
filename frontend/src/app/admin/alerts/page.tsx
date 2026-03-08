'use client';

import { AlertManagement } from '@/components/organisms/admin/AlertManagement';
import { Navigation } from '@/components/organisms';
import { Toaster } from 'react-hot-toast';

export default function AdminAlertsPage() {
  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen flex flex-col bg-bg-primary">
        <Navigation />
        <main className="flex-1 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AlertManagement />
          </div>
        </main>
      </div>
    </>
  );
}
