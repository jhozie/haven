import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DataProvider } from '@/context/DataContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'HavenProp Elite',
  description: 'Premium Estate Management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#0f172a] text-slate-50 min-h-screen flex flex-col`}>
        <DataProvider>
          {children}
        </DataProvider>
      </body>
    </html>
  );
}
