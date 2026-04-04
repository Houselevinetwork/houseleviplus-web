//  @houselevi/api-sdk 
// Single import point for all apps and packages.
// Usage: import { authService, subscriptionService } from '@houselevi/api-sdk'

// Client config  call once at app startup via configureClient()
export { configureClient, getBaseUrl, http } from './utils/http-client';
export { getDeviceType, getDeviceInfo }      from './utils/device';
export type { DeviceType }                   from './utils/device';

// Services
export { authService }         from './services/auth.service';
export { subscriptionService } from './services/subscription.service';
export { contentService }      from './services/content.service';
export { billingService }      from './services/billing.service';
export type { ContentItem, ContentType } from './services/content.service';
