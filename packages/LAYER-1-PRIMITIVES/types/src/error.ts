/**
 * @houselevi/types/error
 * Application errors and error handling
 * 
 * DPA 2019: All errors logged for audit trail
 */

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  statusCode: number;
  category: 'auth' | 'validation' | 'payment' | 'content' | 'server' | 'network';
  severity: 'info' | 'warning' | 'error' | 'critical';
  details?: Record<string, unknown>;
  timestamp: Date;
}

export interface ValidationError extends AppError {
  category: 'validation';
  fields: Record<string, string>;
}

export interface AuthenticationError extends AppError {
  category: 'auth';
  reason: 'invalid_credentials' | 'token_expired' | 'token_invalid' | 'not_authenticated';
}

export interface PaymentError extends AppError {
  category: 'payment';
  paymentMethod: string;
  transactionId?: string;
}

// Type guards
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

export function isValidationError(error: unknown): error is ValidationError {
  return isAppError(error) && 'fields' in error;
}

export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return isAppError(error) && error.category === 'auth';
}
