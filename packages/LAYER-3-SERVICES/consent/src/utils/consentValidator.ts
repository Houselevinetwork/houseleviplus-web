/**
 *  Consent Validator
 * Validates consent state and DPA compliance
 */

export type ConsentType = 'terms_of_service' | 'privacy_policy' | 'cookie_policy';

export interface ConsentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canProceed: boolean;
}

export class ConsentValidator {
  /**
   * Validate that all required consents are given
   */
  static validateAllConsentsGiven(consents: {
    terms_of_service: boolean;
    privacy_policy: boolean;
    cookie_policy: boolean;
  }): ConsentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!consents.terms_of_service) {
      errors.push('Terms of Service consent is required');
    }

    if (!consents.privacy_policy) {
      errors.push('Privacy Policy consent is required');
    }

    if (!consents.cookie_policy) {
      errors.push('Cookie Policy consent is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      canProceed: errors.length === 0,
    };
  }

  /**
   * Validate single consent
   */
  static validateConsent(type: ConsentType, accepted: boolean): ConsentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!accepted) {
      errors.push(`${type} consent is required`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      canProceed: errors.length === 0,
    };
  }

  /**
   * Check if consent is expired
   */
  static isConsentExpired(acceptedAt: Date, expiryDays: number = 365): boolean {
    const now = new Date();
    const acceptedDate = new Date(acceptedAt);
    const daysDifference = (now.getTime() - acceptedDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDifference > expiryDays;
  }
}
