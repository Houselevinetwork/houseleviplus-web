'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/lib/auth';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isFullWidth = pathname === '/mood-tv';

  return (
    <AuthProvider>
      <Navbar />
      <main className={isFullWidth ? 'flex-1 full-width-page' : 'flex-1'}>
        {children}
      </main>
      <Footer />
    </AuthProvider>
  );
}
