/**
 * Location: packages/LAYER-5-COMMERCE/shop/src/api/config.ts
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  'http://localhost:3001';

export const API_ENDPOINTS = {
  // -- Public product endpoints -------------------------------
  PRODUCTS:               '/api/commerce/products',
  PRODUCT_BY_ID:          (id: string)             => `/api/commerce/products/${id}`,
  PRODUCTS_BY_COLLECTION: (collectionId: string)   => `/api/commerce/collections/${collectionId}/products`,
  COLLECTIONS:            '/api/commerce/collections',   // ? fixes TS2339

  // -- Cart endpoints -----------------------------------------
  CART:                   '/api/commerce/cart',
  CART_ADD_ITEM:          '/api/commerce/cart/items',
  CART_UPDATE_ITEM:       (itemId: string)          => `/api/commerce/cart/items/${itemId}`,
  CART_REMOVE_ITEM:       (itemId: string)          => `/api/commerce/cart/items/${itemId}`,

  // -- Order endpoints ----------------------------------------
  ORDERS:                 '/api/commerce/orders',
  ORDER_BY_ID:            (id: string)              => `/api/commerce/orders/${id}`,

  // -- Shipping endpoints -------------------------------------
  SHIPPING_RATES:         '/api/commerce/shipping/rates',
  SHIPPING_TRACK:         (id: string)              => `/api/commerce/shipping/track/${id}`,

  // -- Admin endpoints (auth required) -----------------------
  ADMIN_PRODUCTS:         '/api/commerce/admin/products',
  ADMIN_PRODUCT_BY_ID:    (id: string)              => `/api/commerce/admin/products/${id}`,
  ADMIN_PRODUCTS_BULK:    '/api/commerce/admin/products/bulk',
  ADMIN_COLLECTIONS:      '/api/commerce/admin/collections',
  ADMIN_COLLECTION_BY_ID: (id: string)              => `/api/commerce/admin/collections/${id}`,
  ADMIN_ORDERS:           '/api/commerce/admin/orders',
  ADMIN_ORDER_BY_ID:      (id: string)              => `/api/commerce/admin/orders/${id}`,
  ADMIN_ORDER_STATUS:     (id: string)              => `/api/commerce/admin/orders/${id}/status`,
  ADMIN_ORDER_TRACKING:   (id: string)              => `/api/commerce/admin/orders/${id}/tracking`,

  // -- Upload endpoint ----------------------------------------
  UPLOAD_R2:              (folder: string)          => `/api/upload/r2?folder=${folder}`,
} as const;
