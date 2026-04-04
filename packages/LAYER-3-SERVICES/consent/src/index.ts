// Export types
export * from './types/consent.types';

// Export policies
export { POLICIES, TERMS_OF_SERVICE_V1_0, PRIVACY_POLICY_V1_0, COOKIE_POLICY_V1_0 } from './constants/policyText';

// Export hook
export { useConsent } from './hooks/useConsent';
export type { ConsentHookState } from './hooks/useConsent';

// Export API client
export { consentClient, ConsentClient } from './api/consentClient';

// Export utilities
export { StorageManager } from './utils/storageManager';
export { ConsentValidator } from './utils/consentValidator';
