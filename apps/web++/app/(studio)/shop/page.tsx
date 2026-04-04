'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { shopApi } from '@/lib/shop/api';
import { formatPrice } from '@/lib/shop/utils/formatting';

export default function ShopDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await shopApi.orders.stats();
      setStats(data[0] || { totalOrders: 0, totalRevenue: 0 });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading statistics...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shop Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your products, orders, and inventory</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon="📦"
          color="blue"
        />
        <MetricCard
          title="Revenue"
          value={formatPrice(stats?.totalRevenue || 0, 'USD')}
          icon="💰"
          color="green"
        />
        <MetricCard
          title="Products"
          value="0"
          icon="📦"
          color="purple"
        />
        <MetricCard
          title="Low Stock"
          value="0"
          icon="⚠️"
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard
          title="Products"
          description="Manage your product catalog"
          href="/shop/products"
          icon="📦"
        />
        <QuickActionCard
          title="Orders"
          description="View and fulfill orders"
          href="/shop/orders"
          icon="🛒"
        />
        <QuickActionCard
          title="Collections"
          description="Organize products by collection"
          href="/shop/collections"
          icon="📁"
        />
        <QuickActionCard
          title="Shipping"
          description="Configure shipping rates"
          href="/shop/shipping"
          icon="🚚"
        />
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }: any) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200'
  };

  return (
    <div className={`p-6 border rounded-lg ${colors[color as keyof typeof colors]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function QuickActionCard({ title, description, href, icon }: any) {
  return (
    <Link
      href={href}
      className="p-6 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
}
