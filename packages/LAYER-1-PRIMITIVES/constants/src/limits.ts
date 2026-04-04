/**
 * @houselevi/constants/limits
 * Rate limits and constraints
 */

export const DEVICE_LIMITS = {
  MAX_DEVICES_PER_ACCOUNT: 3,
  MAX_PHONES: 1,
  MAX_LAPTOPS: 1,
  MAX_TVS: 1,
} as const;

export const SESSION_LIMITS = {
  SESSION_TIMEOUT_MINUTES: 30,
  REFRESH_TOKEN_TIMEOUT_DAYS: 7,
} as const;

export const RATE_LIMITS = {
  LOGIN_ATTEMPTS_PER_MINUTE: 5,
  LOGIN_ATTEMPTS_PER_HOUR: 20,
  API_REQUESTS_PER_MINUTE: 100,
  API_REQUESTS_PER_HOUR: 5000,
} as const;

export const PAGINATION_LIMITS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
} as const;

export const STRING_LIMITS = {
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  MIN_PASSWORD_LENGTH: 8,
} as const;
