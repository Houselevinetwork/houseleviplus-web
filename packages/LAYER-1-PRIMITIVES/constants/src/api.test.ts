import { describe, test, expect } from '@jest/globals';
import { API_ENDPOINTS, HTTP_METHODS, API_VERSIONS } from './api';

describe('API Endpoints', () => {
  test('AUTH endpoints should be defined', () => {
    expect(API_ENDPOINTS.AUTH).toBe('/api/v1/auth');
    expect(API_ENDPOINTS.LOGIN).toBe('/api/v1/auth/login');
  });

  test('HTTP methods should be defined', () => {
    expect(HTTP_METHODS.GET).toBe('GET');
    expect(HTTP_METHODS.POST).toBe('POST');
  });

  test('API versions should be defined', () => {
    expect(API_VERSIONS.V1).toBe('v1');
  });
});
