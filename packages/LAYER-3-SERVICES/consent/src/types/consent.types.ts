/**
 *  CONSENT SERVICE - TYPESCRIPT TYPES
 * Location: packages/LAYER-3-SERVICES/consent/src/types/consent.types.ts
 * 
 * DPA 2019 Compliant Consent Tracking
 */

export type ConsentType = 'terms_of_service' | 'privacy_policy' | 'cookie_policy';
export type ConsentStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

export interface ConsentRecord {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  version: string;
  status: ConsentStatus;
  accepted: boolean;
  accepted_at: Date;
  accepted_ip_address: string;
  accepted_user_agent: string;
  revoked?: boolean;
  revoked_at?: Date;
  was_free?: boolean;
  was_explicit?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ConsentStatusCheckResponse {
  user_id: string;
  terms_of_service: {
    accepted: boolean;
    version: string;
    accepted_at?: Date;
  };
  privacy_policy: {
    accepted: boolean;
    version: string;
    accepted_at?: Date;
  };
  cookie_policy: {
    accepted: boolean;
    version: string;
    accepted_at?: Date;
  };
  all_consents_given: boolean;
  can_proceed: boolean;
  missing_consents: ConsentType[];
}

export interface AcceptConsentRequest {
  user_id: string;
  consent_type: ConsentType;
  version: string;
  accepted_at: Date;
  ip_address: string;
  user_agent: string;
}

export interface RevokeConsentRequest {
  user_id: string;
  consent_type: ConsentType;
  reason?: string;
}

export interface ConsentVersion {
  id: string;
  consent_type: ConsentType;
  version: string;
  content_hash: string;
  content_summary: string;
  effective_date: Date;
  ends_date?: Date;
  created_at: Date;
  created_by: string;
}

export interface ConsentHookState {
  consents: {
    terms_of_service: boolean;
    privacy_policy: boolean;
    cookie_policy: boolean;
  };
  acceptConsent: (type: ConsentType) => Promise<void>;
  revokeConsent: (type: ConsentType) => Promise<void>;
  acceptAll: () => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
  allConsentsGiven: boolean;
  canProceed: boolean;
  missingConsents: ConsentType[];
}
