/**
 *  HOUSE LEVI+ - CONSENT POLICIES
 * DPA 2019 Compliant
 */

// ============================================
// 1 TERMS OF SERVICE v1.0
// ============================================

export const TERMS_OF_SERVICE_V1_0 = `
HOUSE LEVI+ - TERMS OF SERVICE
Version 1.0 | Effective: February 15, 2026

 Welcome to House Levi+

Thank you for choosing House Levi+.

By clicking "I Agree," you accept these terms.

---

1 SUBSCRIPTION AUTO-RENEWAL


YOUR SUBSCRIPTION WILL AUTO-RENEW.

- Your subscription renews automatically every month
- We charge your payment method on the same date each month
- You will receive an email reminder 3 days before renewal
- You can cancel anytime by visiting Settings > Subscription > Cancel
- Cancellation takes effect at the end of your current billing period
- You will NOT be charged after cancellation

Example:
  Sign up: February 15 (charged 1,499 KES)
  Renews: March 15 (charged 1,499 KES)
  You cancel on March 10
  Access continues until March 15
  March 15 charge is NOT made 

---

2 DEVICE LIMITS - THE 3-DEVICE RULE


Netflix-grade enforcement. We take this seriously.

YOU GET:
- 1 phone (iPhone / Android)
- 1 laptop (Windows / Mac)
- 1 TV / Tablet (Samsung TV / Fire TV / iPad / etc)

That's it. 3 devices maximum.

WHAT HAPPENS IF YOU TRY TO LOGIN ON A 4TH DEVICE?

Option 1: Logout from your oldest device
          Then login on the new device
          
Option 2: Keep your current 3 devices
          The 4th device gets BLOCKED

WHY DO WE DO THIS?

We prevent account sharing (e.g., giving your password to 5 friends).
One person pays = one person watches.
This is fair to us and fair to all customers.

---

3 ACCOUNT SHARING VIOLATION


Your subscription is personal to you. Do NOT share your password.

PROHIBITED:
 Giving your password to friends/family outside your home
 Sharing your account across different households
 Selling access to your account
 Using account for commercial purposes

IF WE DETECT SHARING:

- We may revoke your session
- We may suspend your account
- We may terminate your subscription

---

4 PAYMENT & REFUNDS


NO REFUNDS.

Your subscription gives you immediate access upon payment.
We do not offer refunds for:
- Unused portions of your subscription
- Content you didn't watch
- Change of mind

INSTEAD: Email support@houselevi.com with issue.
We will help within 24 hours.

---

I UNDERSTAND AND AGREE TO THESE TERMS OF SERVICE

 Check this box to proceed
`;

// ============================================
// 2 PRIVACY POLICY v1.0
// ============================================

export const PRIVACY_POLICY_V1_0 = `
HOUSE LEVI+ - PRIVACY POLICY
Version 1.0 | Effective: February 15, 2026

 Your Privacy Matters. Here's What We Do.

---

1 WHAT DATA WE COLLECT


REQUIRED (necessary for the service):
 Email address
    Why: Authentication + billing communication
    Kept: For account lifetime + 2 years after deletion

 First Name
    Why: Billing receipt + personalization
    Kept: For account lifetime + 2 years after deletion

 Last Name
    Why: Billing receipt (legal requirement)
    Kept: For account lifetime + 2 years after deletion

 Password (hashed, never in plaintext)
    Why: Security - prove it's you
    Kept: Until account deletion

OPTIONAL (only if you use these methods):
 Phone Number
    Why: M-Pesa payment verification
    Kept: For account lifetime + 2 years after deletion
    Only if you choose M-Pesa payment

WE DO NOT COLLECT:
 Age / Gender
 Location (beyond IP for fraud detection)
 Biometric data
 Social media profiles

---

2 HOW WE USE YOUR DATA


AUTHENTICATION:
 Email + password to prove it's you
 Device ID to prevent account sharing

BILLING:
 Name + email for receipts
 Payment token for monthly charges

RECOMMENDATIONS:
 Watch history to suggest content

FRAUD PREVENTION:
 IP address to detect suspicious logins
 Device patterns to detect account sharing

WE DO NOT:
 Sell your data
 Share with advertisers
 Use for targeted ads outside House Levi+

---

3 YOUR RIGHTS (DPA 2019)


RIGHT 1: RIGHT TO ACCESS
You have the right to download your data.
 Go to Settings > My Data > Download
 Get JSON/CSV with all your information

RIGHT 2: RIGHT TO DELETE
You have the right to delete your account.
 Go to Settings > Delete Account
 Data deleted within 30 days
 You get deletion certificate

RIGHT 3: RIGHT TO RECTIFICATION
You have the right to fix wrong data.
 Go to Settings > Profile to update name/email
 We'll update immediately

---

4 DATA BREACH NOTIFICATION


IF YOUR DATA IS BREACHED:

We will:
1. Notify you within 48 hours
2. Tell Data Commissioner within 72 hours (legal requirement)
3. Explain what happened
4. Tell you what we're doing to fix it

---

I UNDERSTAND AND AGREE TO THIS PRIVACY POLICY

 Check this box to proceed
`;

// ============================================
// 3 COOKIE POLICY v1.0
// ============================================

export const COOKIE_POLICY_V1_0 = `
HOUSE LEVI+ - COOKIE POLICY
Version 1.0 | Effective: February 15, 2026

 We Use Cookies. Here's Why.

---

1 ESSENTIAL COOKIES (Required)


These cookies are REQUIRED for House Levi+ to work.

WHAT THEY DO:

 Session Cookie
    Keeps you logged in
    Expires: When you close browser (or 30 days if "Remember me")

 Device Cookie
    Identifies your device
    Prevents you logging in 4 times on different phones

 Security Token
    Prevents hackers faking requests
    Expires: Session end

---

2 ANALYTICS COOKIES (Optional)


These cookies help us understand how people use House Levi+.
YOU CAN OPT OUT.

WHAT THEY DO:

 Google Analytics
    Tracks: Pages visited, time spent, where you came from
    Can opt out: Yes

---

3 YOUR CHOICES


HOW TO MANAGE COOKIES:

1 Browser Settings
   Go to: Settings > Privacy > Cookies

2 Our Settings
   In House Levi+ app:
   Go to: Settings > Privacy > Cookie Preferences

3 Opt Out of Analytics
   Email: privacy@houselevi.com with subject "Opt out of analytics"

---

I UNDERSTAND AND AGREE TO THIS COOKIE POLICY

 Check this box to proceed
`;

// ============================================
// VERSION EXPORT (for tracking policy changes)
// ============================================

export const POLICIES = {
  TERMS_OF_SERVICE: {
    version: '1.0',
    effective_date: '2026-02-15',
    content: TERMS_OF_SERVICE_V1_0,
  },
  PRIVACY_POLICY: {
    version: '1.0',
    effective_date: '2026-02-15',
    content: PRIVACY_POLICY_V1_0,
  },
  COOKIE_POLICY: {
    version: '1.0',
    effective_date: '2026-02-15',
    content: COOKIE_POLICY_V1_0,
  },
};

export default POLICIES;
