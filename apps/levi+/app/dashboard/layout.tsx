'use client';

// Location: apps/levi+/app/dashboard/layout.tsx
// This layout wraps ALL dashboard pages with sidebar + navbar

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/layout/AdminSidebar';
import { Navbar as AdminNavbar } from '../components/layout/AdminNavbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Guard: if no admin token at all, redirect to login
    const token =
      localStorage.getItem('admin_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');

    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <>
      <style>{`
        .dashboard-shell {
          display: flex;
          min-height: 100vh;
          background: #f4f2ef;
        }

        .dashboard-main {
          margin-left: 220px;
          margin-top: 56px;
          flex: 1;
          padding: 28px;
          transition: margin-left 0.25s cubic-bezier(0.4,0,0.2,1);
          min-height: calc(100vh - 56px);
        }

        /* When sidebar is collapsed (64px wide) */
        .sidebar-collapsed .dashboard-main {
          margin-left: 64px;
        }

        .sidebar-collapsed .admin-navbar {
          left: 64px;
        }
      `}</style>

      <div className="dashboard-shell">
        <AdminSidebar />
        <AdminNavbar />
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </>
  );
}
