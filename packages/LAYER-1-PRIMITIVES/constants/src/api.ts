/**
 * @houselevi/constants/api
 * API endpoints and routes
 */

export const API_ENDPOINTS = {
  AUTH: '/api/v1/auth',
  LOGIN: '/api/v1/auth/login',
  LOGOUT: '/api/v1/auth/logout',
  REFRESH_TOKEN: '/api/v1/auth/refresh',
  USERS: '/api/v1/users',
  USER_PROFILE: '/api/v1/users/profile',
  USER_SETTINGS: '/api/v1/users/settings',
  SESSIONS: '/api/v1/sessions',
  SESSION_REVOKE: '/api/v1/sessions/:id/revoke',
  DEVICES: '/api/v1/devices',
  DEVICE_BIND: '/api/v1/devices/bind',
  DEVICE_TRUST: '/api/v1/devices/:id/trust',
  CONTENT: '/api/v1/content',
  MOVIES: '/api/v1/content/movies',
  SERIES: '/api/v1/content/series',
  SHOP: '/api/v1/shop',
  PRODUCTS: '/api/v1/shop/products',
  ORDERS: '/api/v1/shop/orders',
} as const;

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export const API_VERSIONS = {
  V1: 'v1',
  V2: 'v2',
} as const;
