'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function CartPage() {
  return (
    <>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Your cart is empty</p>
              <Link
                href="/shop"
                className="mt-4 inline-block bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 h-fit">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>KSh 0</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>KSh 0</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>KSh 0</span>
              </div>
            </div>
            <button className="w-full bg-gray-900 text-white py-3 rounded hover:bg-gray-800 disabled:opacity-50">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
      
    </>
  );
}
