/**
 *  useConsent HOOK
 * Location: packages/LAYER-3-SERVICES/consent/src/hooks/useConsent.ts
 * 
 * React hook that manages consent state
 */

import { useState, useCallback, useEffect } from 'react';

export type ConsentType = 'terms_of_service' | 'privacy_policy' | 'cookie_policy';

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

/**
 * MAIN HOOK
 * Use in components like:
 * 
 * function SignupForm() {
 *   const { consents, acceptAll, allConsentsGiven } = useConsent();
 *   
 *   return (
 *     <div>
 *       <ConsentForm />
 *       <button disabled={!allConsentsGiven}>Create Account</button>
 *     </div>
 *   );
 * }
 */
export function useConsent(): ConsentHookState {
  // STATE
  const [consents, setConsents] = useState({
    terms_of_service: false,
    privacy_policy: false,
    cookie_policy: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // COMPUTED VALUES
  const allConsentsGiven =
    consents.terms_of_service &&
    consents.privacy_policy &&
    consents.cookie_policy;

  const missingConsents: ConsentType[] = [];
  if (!consents.terms_of_service) missingConsents.push('terms_of_service');
  if (!consents.privacy_policy) missingConsents.push('privacy_policy');
  if (!consents.cookie_policy) missingConsents.push('cookie_policy');

  const canProceed = allConsentsGiven;

  // LOAD CONSENT STATUS ON MOUNT
  useEffect(() => {
    const loadConsentStatus = async () => {
      try {
        setLoading(true);
        
        // Try to get from localStorage (for now)
        const stored = localStorage.getItem('consents');
        if (stored) {
          setConsents(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Failed to load consent status:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConsentStatus();
  }, []);

  // ACCEPT SINGLE CONSENT
  const acceptConsent = useCallback(
    async (type: ConsentType) => {
      try {
        setLoading(true);
        setError(null);

        // Save to localStorage
        const updated = {
          ...consents,
          [type]: true,
        };
        localStorage.setItem('consents', JSON.stringify(updated));
        setConsents(updated);

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save consent';
        setError(errorMessage);
        console.error('Failed to accept consent:', err);
      } finally {
        setLoading(false);
      }
    },
    [consents]
  );

  // ACCEPT ALL CONSENTS
  const acceptAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const updated = {
        terms_of_service: true,
        privacy_policy: true,
        cookie_policy: true,
      };

      localStorage.setItem('consents', JSON.stringify(updated));
      setConsents(updated);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save consents';
      setError(errorMessage);
      console.error('Failed to accept all consents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // REVOKE CONSENT
  const revokeConsent = useCallback(
    async (type: ConsentType) => {
      try {
        setLoading(true);
        setError(null);

        const updated = {
          ...consents,
          [type]: false,
        };
        localStorage.setItem('consents', JSON.stringify(updated));
        setConsents(updated);

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to revoke consent';
        setError(errorMessage);
        console.error('Failed to revoke consent:', err);
      } finally {
        setLoading(false);
      }
    },
    [consents]
  );

  // RETURN HOOK STATE
  return {
    consents,
    acceptConsent,
    revokeConsent,
    acceptAll,
    loading,
    error,
    success,
    allConsentsGiven,
    canProceed,
    missingConsents,
  };
}

export default useConsent;
