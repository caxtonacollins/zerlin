import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { StacksProvider } from '@/components/providers/StacksProvider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Zerlin - STX Gas Calculator',
  description: 'Real-time STX gas calculator and fee estimator for the Stacks blockchain',
  keywords: ['Stacks', 'STX', 'gas', 'fee', 'calculator', 'Bitcoin', 'DeFi'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <StacksProvider>
          {children}
        </StacksProvider>
      </body>
    </html>
  );
}
