'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/blocked');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-600">Loading Studio...</p>
    </div>
  );
}
