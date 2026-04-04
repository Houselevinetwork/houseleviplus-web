/**
 * Tests for response types
 */

import { describe, test, expect } from '@jest/globals';
import { ApiResponse, PaginatedResponse, BulkResponse } from './response';
import type { AppError } from './error';

describe('Response Types', () => {
  test('ApiResponse type should work', () => {
    const response: ApiResponse<string> = {
      data: 'Success!',
      success: true,
      timestamp: new Date(),
      requestId: 'req_123',
    };

    expect(response.success).toBe(true);
    expect(response.data).toBe('Success!');
  });

  test('ApiResponse with error should work', () => {
    const error: AppError = {
      code: 'TEST_001',
      message: 'Test error',
      userMessage: 'Something went wrong',
      statusCode: 500,
      category: 'server',
      severity: 'error',
      timestamp: new Date(),
    };

    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: error,
      timestamp: new Date(),
      requestId: 'req_123',
    };

    expect(response.success).toBe(false);
    expect(response.error?.code).toBe('TEST_001');
  });

  test('PaginatedResponse type should work', () => {
    const response: PaginatedResponse<string> = {
      items: ['item1', 'item2', 'item3'],
      page: 1,
      pageSize: 10,
      totalPages: 5,
      totalItems: 50,
      hasMore: true,
    };

    expect(response.items.length).toBe(3);
    expect(response.hasMore).toBe(true);
  });

  test('BulkResponse type should work', () => {
    const response: BulkResponse = {
      succeeded: 8,
      failed: 2,
      errors: [
        {
          index: 0,
          error: {
            code: 'ERR_001',
            message: 'Error 1',
            userMessage: 'Error',
            statusCode: 400,
            category: 'validation',
            severity: 'error',
            timestamp: new Date(),
          },
        },
      ],
    };

    expect(response.succeeded).toBe(8);
    expect(response.failed).toBe(2);
  });
});
