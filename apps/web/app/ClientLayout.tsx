'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@houselevi/auth';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isFullWidth = pathname === '/mood-tv';
  const isSplash   = pathname === '/';   // ← hide nav + footer on splash

  return (
    <AuthProvider>
      {!isSplash && <Navbar />}
      <main className={isFullWidth ? 'flex-1 full-width-page' : 'flex-1'}>
        {children}
      </main>
      {!isSplash && <Footer />}
    </AuthProvider>
  );
}