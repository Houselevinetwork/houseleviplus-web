#  Consent Service

DPA 2019 Compliant consent management for House Levi+.

## What is this?

A complete consent service that handles:
- Terms of Service acceptance
- Privacy Policy acceptance
- Cookie Policy acceptance

All with DPA 2019 compliance built-in.

## Installation
```bash
npm install @houselevi/consent
```

## Usage

### React Hook
```typescript
import { useConsent } from '@houselevi/consent';

function SignupForm() {
  const { consents, acceptAll, allConsentsGiven } = useConsent();
  
  return (
    <div>
      <button onClick={acceptAll}>Accept All</button>
      <button disabled={!allConsentsGiven}>Create Account</button>
    </div>
  );
}
```

### API Client
```typescript
import { consentClient } from '@houselevi/consent';

// Accept consent
await consentClient.acceptConsent('privacy_policy');

// Get status
const status = await consentClient.getConsentStatus();

// Revoke consent
await consentClient.revokeConsent('cookie_policy');
```

## DPA 2019 Compliance

 Consent FIRST (before any data collection)
 Explicit acceptance (user must click)
 Version tracking (know what user agreed to)
 Audit trail (timestamp, IP, browser)
 Right to revoke (anytime)

## Files

- `types/consent.types.ts` - TypeScript interfaces
- `constants/policyText.ts` - Policy texts
- `hooks/useConsent.ts` - React hook
- `api/consentClient.ts` - API client
- `utils/storageManager.ts` - localStorage management
- `utils/consentValidator.ts` - Validation logic

## License

MIT
