/**
 * @houselevi/config/env
 * Environment configuration
 */

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TESTING: process.env.NODE_ENV === 'test',
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  API_TIMEOUT_MS: 30000,
  JWT_STORAGE_KEY: 'levi_jwt_token',
  DEVICE_ID_STORAGE_KEY: 'levi_device_id',
  FEATURES: {
    DARK_MODE: true,
    OFFLINE_MODE: true,
    ANALYTICS: true,
  },
} as const;
