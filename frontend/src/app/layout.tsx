import type { Metadata } from "next";
import { StacksProvider } from "@/components/providers/StacksProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zerlin - STX Gas Calculator",
  description:
    "Real-time STX gas calculator and fee estimator for the Stacks blockchain",
  keywords: ["Stacks", "STX", "gas", "fee", "calculator", "Bitcoin", "DeFi"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="talentapp:project_verification"
          content="5464c165f883df4cb51c6fc03b88eeb160f53c4acd8b20220efd210fb93629c6b6e302bae8478f171f817a33c6cab2b815f9a8b058ac32d74404a74c31474103"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="antialiased font-sans">
        <StacksProvider>{children}</StacksProvider>
      </body>
    </html>
  );
}
