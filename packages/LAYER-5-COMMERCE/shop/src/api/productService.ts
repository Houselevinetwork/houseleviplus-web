/**
 * Location: packages/LAYER-5-COMMERCE/shop/src/api/productService.ts
 */

import { API_BASE_URL, API_ENDPOINTS } from './config';
import { IProduct, ICollection } from '../types';

// -- Response wrappers ------------------------------------------
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  field?: string;
}

// -- Simple in-memory cache -------------------------------------
const cache = new Map<string, { data: unknown; expiresAt: number }>();

function fromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function toCache(key: string, data: unknown, ttlSeconds = 30): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
}

// -- Auth token helper ------------------------------------------
// Safe for both browser and SSR/Node — avoids referencing `window` directly
function getToken(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (globalThis as any).localStorage?.getItem('admin_token') ?? '';
  } catch {
    return '';
  }
}

// Uses Record<string, string> instead of HeadersInit (DOM type)
// so this compiles without the "lib": ["dom"] requirement
function buildHeaders(withAuth = false): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

// -- Core fetch wrapper -----------------------------------------
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);

  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // ignore parse error
    }
    const error = new Error(message) as Error & { statusCode: number };
    error.statusCode = res.status;
    throw error;
  }

  return res.json() as Promise<T>;
}

// --------------------------------------------------------------
//  PUBLIC PRODUCT SERVICE
//  Used by: web frontend, Android via API
// --------------------------------------------------------------

export class ProductService {
  /**
   * Fetch paginated product list (public, no auth).
   * Cached for 30s to reduce API calls during browsing.
   */
  static async getProducts(
    skip = 0,
    limit = 10,
  ): Promise<PaginatedResponse<IProduct>> {
    const cacheKey = `products:${skip}:${limit}`;
    const cached = fromCache<PaginatedResponse<IProduct>>(cacheKey);
    if (cached) return cached;

    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}?skip=${skip}&limit=${limit}`;
    const data = await apiFetch<PaginatedResponse<IProduct>>(url, {
      headers: buildHeaders(),
    });

    toCache(cacheKey, data, 30);
    return data;
  }

  /**
   * Fetch a single product by ID.
   */
  static async getProductById(id: string): Promise<IProduct> {
    const cacheKey = `product:${id}`;
    const cached = fromCache<IProduct>(cacheKey);
    if (cached) return cached;

    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_BY_ID(id)}`;
    const data = await apiFetch<IProduct>(url, { headers: buildHeaders() });

    toCache(cacheKey, data, 60);
    return data;
  }

  /**
   * Fetch all products in a collection/category.
   */
  static async getProductsByCollection(collectionId: string): Promise<IProduct[]> {
    const cacheKey = `collection-products:${collectionId}`;
    const cached = fromCache<IProduct[]>(cacheKey);
    if (cached) return cached;

    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS_BY_COLLECTION(collectionId)}`;
    const data = await apiFetch<IProduct[]>(url, { headers: buildHeaders() });

    toCache(cacheKey, data, 30);
    return data;
  }

  /**
   * Search products by query string.
   */
  static async searchProducts(query: string, limit = 20): Promise<IProduct[]> {
    if (!query.trim()) return [];
    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    return apiFetch<IProduct[]>(url, { headers: buildHeaders() });
  }

  /**
   * Fetch featured / best seller products for shop homepage.
   */
  static async getFeatured(limit = 8): Promise<IProduct[]> {
    const cacheKey = `featured:${limit}`;
    const cached = fromCache<IProduct[]>(cacheKey);
    if (cached) return cached;

    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}/featured?limit=${limit}`;
    const data = await apiFetch<IProduct[]>(url, { headers: buildHeaders() });

    toCache(cacheKey, data, 60);
    return data;
  }

  /**
   * Fetch all collections / categories (shop nav + grid).
   * Requires API_ENDPOINTS.COLLECTIONS in config.ts.
   */
  static async getCollections(): Promise<ICollection[]> {
    const cacheKey = 'collections';
    const cached = fromCache<ICollection[]>(cacheKey);
    if (cached) return cached;

    const url = `${API_BASE_URL}${API_ENDPOINTS.COLLECTIONS}`;
    const data = await apiFetch<ICollection[]>(url, { headers: buildHeaders() });

    toCache(cacheKey, data, 120);
    return data;
  }

  /**
   * Invalidate cache entries.
   * Call with no args to clear everything, or a prefix string to clear selectively.
   */
  static clearCache(pattern?: string): void {
    if (!pattern) {
      cache.clear();
      return;
    }
    // Array.from avoids MapIterator downlevelIteration requirement
    Array.from(cache.keys()).forEach(key => {
      if (key.startsWith(pattern)) cache.delete(key);
    });
  }
}

// --------------------------------------------------------------
//  ADMIN PRODUCT SERVICE
//  Used by: levi+ admin dashboard only (requires auth token)
//  Connects to: api/src/commerce-and-transactions/admin/
//               admin-product.controller.ts
//               admin-collection.controller.ts
// --------------------------------------------------------------

export interface CreateProductDto {
  name: string;
  price: number;
  salePrice?: number;
  onSale?: boolean;
  category: string;
  stock: number;
  visible: boolean;
  imageUrl?: string;
  description?: string;
}

export class AdminProductService {
  private static base = `${API_BASE_URL}/api/commerce/admin`;

  // -- Products ------------------------------------------------

  static async getAllProducts(params?: {
    category?: string;
    visible?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<IProduct>> {
    const qs = new URLSearchParams();
    if (params?.category)              qs.set('category', params.category);
    if (params?.visible !== undefined) qs.set('visible', String(params.visible));
    if (params?.page)                  qs.set('page',    String(params.page));
    if (params?.limit)                 qs.set('limit',   String(params.limit ?? 50));

    return apiFetch<PaginatedResponse<IProduct>>(
      `${this.base}/products?${qs}`,
      { headers: buildHeaders(true) },
    );
  }

  static async createProduct(dto: CreateProductDto): Promise<IProduct> {
    const product = await apiFetch<IProduct>(`${this.base}/products`, {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify(dto),
    });
    ProductService.clearCache('products');
    ProductService.clearCache('featured');
    return product;
  }

  static async updateProduct(id: string, dto: Partial<CreateProductDto>): Promise<IProduct> {
    const product = await apiFetch<IProduct>(`${this.base}/products/${id}`, {
      method: 'PUT',
      headers: buildHeaders(true),
      body: JSON.stringify(dto),
    });
    ProductService.clearCache(`product:${id}`);
    ProductService.clearCache('products');
    return product;
  }

  static async toggleVisibility(id: string, visible: boolean): Promise<IProduct> {
    return AdminProductService.updateProduct(id, { visible });
  }

  static async deleteProduct(id: string): Promise<void> {
    await apiFetch<void>(`${this.base}/products/${id}`, {
      method: 'DELETE',
      headers: buildHeaders(true),
    });
    ProductService.clearCache(`product:${id}`);
    ProductService.clearCache('products');
  }

  // -- Bulk CSV upload ------------------------------------------

  static async bulkUpload(
    csvFile: File,
    zipFile?: File,
  ): Promise<{ created: number; failed: number; errors: string[] }> {
    const fd = new FormData();
    fd.append('csv', csvFile);
    if (zipFile) fd.append('images', zipFile);

    const res = await fetch(`${this.base}/products/bulk`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: fd,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: 'Bulk upload failed' })) as { message?: string };
      throw new Error(body.message ?? 'Bulk upload failed');
    }

    return res.json() as Promise<{ created: number; failed: number; errors: string[] }>;
  }

  // -- Collections ----------------------------------------------

  static async getAllCollections(): Promise<ICollection[]> {
    return apiFetch<ICollection[]>(`${this.base}/collections`, {
      headers: buildHeaders(true),
    });
  }

  static async createCollection(dto: {
    name: string;
    slug: string;
    imageUrl?: string;
    visible?: boolean;
  }): Promise<ICollection> {
    const col = await apiFetch<ICollection>(`${this.base}/collections`, {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify(dto),
    });
    ProductService.clearCache('collections');
    return col;
  }

  static async updateCollection(
    id: string,
    dto: Partial<{ name: string; slug: string; imageUrl: string; visible: boolean }>,
  ): Promise<ICollection> {
    const col = await apiFetch<ICollection>(`${this.base}/collections/${id}`, {
      method: 'PUT',
      headers: buildHeaders(true),
      body: JSON.stringify(dto),
    });
    ProductService.clearCache('collections');
    return col;
  }

  static async deleteCollection(id: string): Promise<void> {
    await apiFetch<void>(`${this.base}/collections/${id}`, {
      method: 'DELETE',
      headers: buildHeaders(true),
    });
    ProductService.clearCache('collections');
  }

  // -- Image upload ? R2 ----------------------------------------

  static async uploadImage(
    file: File,
    folder: 'products' | 'heroes' | 'collections' = 'products',
  ): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);

    const res = await fetch(`${API_BASE_URL}/api/upload/r2?folder=${folder}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: fd,
    });

    if (!res.ok) throw new Error('Image upload failed');

    const body = (await res.json()) as { url: string };
    return body.url;
  }

  /**
   * Full create-with-image flow:
   * 1. Upload image to R2 ? get URL
   * 2. Create product with that URL
   */
  static async createProductWithImage(
    dto: Omit<CreateProductDto, 'imageUrl'>,
    imageFile?: File,
  ): Promise<IProduct> {
    let imageUrl: string | undefined;
    if (imageFile) {
      imageUrl = await AdminProductService.uploadImage(imageFile, 'products');
    }
    return AdminProductService.createProduct({ ...dto, imageUrl });
  }
}
