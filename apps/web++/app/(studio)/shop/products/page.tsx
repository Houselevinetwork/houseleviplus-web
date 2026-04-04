'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { shopApi } from '@/lib/shop/api';
import { IProduct } from '@/lib/shop/types';
import { formatPrice, formatDate } from '@/lib/shop/utils/formatting';

export default function ProductsListPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await shopApi.products.list(0, 50);
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">{products.length} products total</p>
        </div>
        <Link
          href="/shop/products/new"
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'published', 'draft', 'archived'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">No products found</p>
          <Link
            href="/shop/products/new"
            className="text-blue-600 hover:underline"
          >
            Create your first product
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map(product => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-200 rounded flex-shrink-0 mr-3">
                        {product.images[0] && (
                          <img
                            src={product.images[0].url}
                            alt={product.title}
                            className="h-10 w-10 object-cover rounded"
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{product.title}</div>
                        <div className="text-sm text-gray-500">{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatPrice(product.discountPrice || product.basePrice, product.currency)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.totalStock} units
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(product.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <Link
                      href={`/shop/products/${product._id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors]}`}>
      {status}
    </span>
  );
}
