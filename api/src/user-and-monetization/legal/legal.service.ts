// api/src/user-and-monetization/legal/legal.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class LegalService {
  
  getBillingTerms(): string {
    return `
# Billing Terms & Conditions

**Effective Date:** February 17, 2026

## 1. Subscription & Billing

1.1 Your House Levi+ subscription begins when you complete payment and continues until cancelled.

1.2 **Billing Cycle:** Subscriptions renew monthly on the same calendar date as your initial signup unless you cancel before the renewal date.

1.3 **Payment Methods:**
- **Card Payments (Recommended):** Your card will be charged automatically on each renewal date. No action required from you.
- **M-Pesa Payments:** M-Pesa does not support automatic recurring charges. You will receive SMS and email reminders 3 days and 1 day before your subscription expires. Failure to renew will result in your account entering a 3-day grace period, after which access will be paused.

1.4 **Pricing:** All prices are displayed in your local currency at checkout. Prices are subject to change with 30 days' written notice to your registered email address.

## 2. Cancellation & Refunds

2.1 You may cancel your subscription at any time from **Account → Settings → Subscription**.

2.2 Cancellation takes effect at the end of your current billing period. You will retain access until that date.

2.3 **No partial refunds** are issued for unused portions of your subscription period.

2.4 If payment fails (e.g., insufficient funds, expired card), your account will enter a grace period and may be suspended if payment is not received.

## 3. Free Trial (If Applicable)

3.1 Free trials, if offered, are available to new subscribers only and limited to one per person.

3.2 You must provide valid payment information to start a free trial. You will not be charged during the trial period.

3.3 If you do not cancel before the trial ends, you will be automatically charged for a monthly subscription.

## 4. Account Access & Sharing

4.1 Your account is for personal use only. You may not share your login credentials with anyone outside your household.

4.2 The number of simultaneous streams allowed depends on your plan (Mobile: 1, Basic: 1, Standard: 2, Premium VIP: 4).

4.3 House Levi+ reserves the right to suspend accounts that violate these terms or show signs of unauthorized sharing.

## 5. Content & Availability

5.1 House Levi+ provides access to a library of theatre productions, films, and related content ("Content").

5.2 Content availability may vary by region and may change over time due to licensing agreements.

5.3 Video quality (480p, 720p, 1080p, 4K) depends on your plan, internet speed, and device capabilities.

## 6. Acceptable Use

You agree NOT to:
- Circumvent or bypass any security measures
- Copy, distribute, or publicly display Content
- Use automated means (bots, scrapers) to access the service
- Reverse engineer, decompile, or disassemble any part of the platform

## 7. Termination

7.1 House Levi+ may suspend or terminate your account if you violate these terms, engage in fraudulent activity, or for any other reason at our discretion.

7.2 Upon termination, you will lose access immediately and no refunds will be issued.

## 8. Limitation of Liability

8.1 House Levi+ is provided "as is" without warranties of any kind, express or implied.

8.2 We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.

8.3 Our total liability to you shall not exceed the amount you paid in the 12 months preceding the claim.

## 9. Governing Law

These terms are governed by the laws of Kenya. Any disputes shall be resolved in the courts of Nairobi, Kenya.

## 10. Changes to Terms

We may update these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.

---

**Contact:** For billing questions, email support@houselevi.com
`;
  }

  getPrivacyPolicy(): string {
    return `
# Privacy Policy

**Effective Date:** February 17, 2026  
**Last Updated:** February 17, 2026

House Levi+ ("we," "us," "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information in compliance with the **Data Protection Act 2019** (Kenya) and the **Kenya Information and Communications Act**.

---

## 1. Information We Collect

### 1.1 Information You Provide
- **Account Information:** Name, email address, phone number (optional)
- **Payment Information:** Processed by Pesapal Ltd (see Section 3)
- **Profile Data:** Viewing preferences, watchlist, playback position

### 1.2 Automatically Collected Information
- **Device Information:** IP address, browser type, operating system, device ID
- **Usage Data:** Pages viewed, content watched, timestamps, search queries
- **Cookies:** We use cookies to remember your preferences and improve your experience

---

## 2. How We Use Your Information

We use your data to:
- **Provide the Service:** Process payments, manage your account, deliver content
- **Personalize Experience:** Recommend content based on your viewing history
- **Communication:** Send you subscription reminders, service updates, and promotional offers (you can opt out)
- **Improve the Service:** Analyze usage patterns to enhance platform performance
- **Legal Compliance:** Comply with legal obligations and enforce our terms

### 2.1 Legal Basis for Processing (DPA Act 2019)
We process your data under the following lawful bases:
- **Contractual Necessity:** To fulfil our subscription agreement with you (Section 30, DPA 2019)
- **Legitimate Interest:** To improve our service and prevent fraud
- **Consent:** For marketing communications (you may withdraw consent at any time)

---

## 3. Data Sharing & Third Parties

### 3.1 Payment Processor
We use **Pesapal Ltd** to process all payments. Pesapal is PCI-DSS certified and acts as our **data processor** under a signed data processing agreement.

**What Pesapal Receives:** Payment details (card number, CVV, expiry) or M-Pesa phone number  
**What We Receive:** Transaction status (completed/failed), transaction ID only  
**Security:** House Levi+ NEVER stores your card details, CVV, or PIN

Pesapal's Privacy Policy: [https://www.pesapal.com/privacy-policy](https://www.pesapal.com/privacy-policy)

### 3.2 Other Third Parties
We may share data with:
- **Cloud Providers:** For secure data storage (AWS, Google Cloud)
- **Analytics Tools:** To understand how users interact with our platform
- **Legal Authorities:** When required by law or to protect our rights

### 3.3 No Selling of Data
We do NOT sell, rent, or trade your personal information to third parties for marketing purposes.

---

## 4. Data Security

We implement industry-standard security measures:
- **Encryption:** All data transmitted over HTTPS/TLS
- **Access Controls:** Limited access to personal data on a need-to-know basis
- **Regular Audits:** Periodic security assessments and vulnerability testing

Despite our efforts, no system is 100% secure. We cannot guarantee absolute security.

---

## 5. Data Retention

We retain your data:
- **Active Accounts:** For the duration of your subscription plus 12 months after cancellation
- **Payment Records:** 7 years (tax and accounting compliance)
- **Marketing Data:** Until you opt out or request deletion

---

## 6. Your Rights (DPA Act 2019)

Under Kenya's Data Protection Act 2019, you have the right to:

1. **Access:** Request a copy of your personal data
2. **Correction:** Update inaccurate or incomplete data
3. **Deletion:** Request deletion of your data (subject to legal retention requirements)
4. **Portability:** Receive your data in a machine-readable format
5. **Objection:** Object to processing for marketing purposes
6. **Restriction:** Request restriction of processing in certain circumstances
7. **Withdraw Consent:** For marketing communications

**How to Exercise Your Rights:**  
Email: privacy@houselevi.com  
We will respond within **21 days** as required by law.

---

## 7. Data Breach Notification

In the event of a data breach affecting your personal information, we will notify you **within 72 hours** as required under Section 41 of the Data Protection Act 2019.

---

## 8. Children's Privacy

House Levi+ is not intended for children under 13. We do not knowingly collect data from children. If we learn we have collected data from a child under 13, we will delete it immediately.

---

## 9. International Data Transfers

Your data is stored in Kenya. If we transfer data outside Kenya, we will ensure adequate safeguards are in place as required by DPA 2019.

---

## 10. Cookies & Tracking

We use cookies to:
- Remember your login session
- Store playback preferences
- Analyze usage patterns

**Cookie Types:**
- **Essential:** Required for the service to function
- **Functional:** Remember your preferences
- **Analytics:** Understand how you use the platform

You can disable cookies in your browser, but this may affect functionality.

---

## 11. Changes to This Policy

We may update this policy from time to time. We will notify you of significant changes via email or platform notification.

---

## 12. Contact Us

**Data Protection Officer:**  
Email: privacy@houselevi.com  
Address: Nairobi, Kenya

**Office of the Data Protection Commissioner (Kenya):**  
If you have a complaint about how we handle your data, you may contact:  
Website: [https://www.odpc.go.ke](https://www.odpc.go.ke)

---

**Effective Date:** February 17, 2026
`;
  }

  getDataProcessingAgreement(): string {
    return `
# Data Processing Agreement (DPA)

**Effective Date:** February 17, 2026

This Data Processing Agreement ("DPA") supplements the Privacy Policy and Billing Terms and is entered into between **House Levi+ Limited** ("Data Controller") and **you** ("Data Subject") in compliance with the **Data Protection Act 2019** (Kenya).

---

## 1. Purpose & Scope

1.1 This DPA governs how House Levi+ processes your personal data in connection with your subscription to our streaming service.

1.2 **Data Controller:** House Levi+ Limited determines the purposes and means of processing your personal data.

1.3 **Data Subject:** You, the individual subscriber, have rights under the Data Protection Act 2019.

---

## 2. Types of Personal Data Processed

We process the following categories of personal data:

| Category | Examples |
|----------|----------|
| Identity Data | Name, email address, phone number (optional) |
| Payment Data | Transaction history, subscription status |
| Technical Data | IP address, device type, browser, cookies |
| Usage Data | Viewing history, search queries, preferences |
| Communications | Support tickets, feedback, marketing preferences |

---

## 3. Lawful Basis for Processing

We process your data under the following lawful bases as defined in **Section 30 of the Data Protection Act 2019**:

1. **Contractual Necessity:** To fulfil our subscription agreement with you
2. **Legal Obligation:** To comply with tax, accounting, and regulatory requirements
3. **Legitimate Interest:** To improve our service, prevent fraud, and ensure platform security
4. **Consent:** For marketing communications (you may withdraw at any time)

---

## 4. Data Processors

We engage third-party processors to assist in delivering our service:

### 4.1 Pesapal Ltd (Payment Processor)
- **Role:** Processes all payments (card and M-Pesa)
- **Data Shared:** Payment method details, transaction amounts
- **Security:** PCI-DSS Level 1 certified
- **DPA Status:** We have a signed data processing agreement with Pesapal
- **Your Card Details:** Never stored by House Levi+ — handled exclusively by Pesapal

### 4.2 Cloud Service Providers
- **Role:** Data storage and hosting
- **Data Shared:** Account data, viewing history
- **Security:** ISO 27001 certified, encryption at rest and in transit

All processors are contractually obligated to process data only on our instructions and maintain appropriate security measures.

---

## 5. Data Storage & Location

5.1 **Primary Storage:** All data is stored in secure data centers located in **Kenya**.

5.2 **Backup Storage:** Encrypted backups may be stored in regional data centers (East Africa).

5.3 **International Transfers:** If we transfer data outside Kenya, we will:
- Ensure the recipient country has adequate data protection laws, OR
- Implement Standard Contractual Clauses (SCCs), OR
- Obtain your explicit consent

---

## 6. Data Retention

| Data Type | Retention Period |
|-----------|------------------|
| Account Information | Duration of subscription + 12 months |
| Payment Records | 7 years (tax compliance) |
| Viewing History | Duration of subscription + 6 months |
| Marketing Data | Until consent is withdrawn |
| Support Tickets | 3 years |

After retention periods expire, data is securely deleted or anonymized.

---

## 7. Your Rights

Under the **Data Protection Act 2019**, you have the following rights:

### 7.1 Right of Access (Section 38)
Request a copy of all personal data we hold about you.

### 7.2 Right to Rectification (Section 39)
Correct inaccurate or incomplete data.

### 7.3 Right to Erasure (Section 40)
Request deletion of your data (subject to legal retention requirements).

### 7.4 Right to Data Portability (Section 42)
Receive your data in a structured, machine-readable format (e.g., JSON, CSV).

### 7.5 Right to Object (Section 43)
Object to processing for marketing purposes or where we rely on legitimate interest.

### 7.6 Right to Restriction
Request restriction of processing in certain circumstances (e.g., disputed accuracy).

### 7.7 Right to Withdraw Consent
For marketing communications or optional processing activities.

**How to Exercise Your Rights:**  
Email: privacy@houselevi.com  
**Response Time:** Within 21 days as required by law

---

## 8. Data Security Measures

We implement the following safeguards:

- **Encryption:** TLS/SSL for data in transit, AES-256 for data at rest
- **Access Controls:** Role-based access, two-factor authentication for staff
- **Monitoring:** 24/7 security monitoring and intrusion detection
- **Audits:** Annual third-party security audits
- **Employee Training:** All staff trained on data protection obligations

---

## 9. Data Breach Notification

### 9.1 Obligation to Notify
In the event of a personal data breach, we will:
- Notify you **within 72 hours** (Section 41, DPA 2019)
- Report to the Office of the Data Protection Commissioner (ODPC) if required
- Provide details of the breach, affected data, and remedial actions

### 9.2 What Constitutes a Breach
Unauthorized access, accidental loss, destruction, or disclosure of personal data.

---

## 10. Automated Decision-Making

We do NOT use automated decision-making or profiling that produces legal or similarly significant effects on you.

Content recommendations are based on algorithms but do not affect your legal rights or subscription status.

---

## 11. Complaints & Escalation

### 11.1 Internal Complaint
If you believe we have violated your data protection rights:  
Email: privacy@houselevi.com

### 11.2 Regulatory Complaint
You have the right to lodge a complaint with:

**Office of the Data Protection Commissioner (Kenya)**  
Website: [https://www.odpc.go.ke](https://www.odpc.go.ke)  
Email: info@odpc.go.ke  
Phone: +254 (0) 20 2649000

---

## 12. Amendments

We may update this DPA to reflect changes in law or our practices. We will notify you of material changes via email or platform notification.

**Continued use of the service after changes constitutes acceptance of the updated DPA.**

---

## 13. Governing Law & Jurisdiction

This DPA is governed by the laws of **Kenya**. Any disputes shall be resolved in the courts of **Nairobi, Kenya**.

---

## 14. Contact Information

**Data Protection Officer**  
House Levi+ Limited  
Email: privacy@houselevi.com  
Location: Nairobi, Kenya

---

**Effective Date:** February 17, 2026  
**Version:** 1.0
`;
  }

  // Summary method for payment page
  getLegalSummaries() {
    return {
      billing: {
        title: 'Billing & Recurring Payments',
        points: [
          'You will be charged on signup and monthly thereafter',
          'Card payments renew automatically — no action needed',
          'M-Pesa payments require manual renewal — we send reminders at 3 days and 1 day before expiry',
          'Cancel anytime from Account Settings — takes effect at end of current period',
          'No partial refunds for unused time',
        ],
      },
      privacy: {
        title: 'Your Data & Privacy (DPA Act 2019)',
        points: [
          'We collect only necessary data: name, email, Phone no, payment info',
          'Pesapal (PCI-DSS certified) processes payments — we never store your card details',
          'Pesapal is our data processor under a signed agreement',
          'Data stored securely in Kenya per Data Protection Act 2019',
          'You can access, correct, or delete your data anytime',
          'We notify you within 72 hours of any data breach',
          'We do not sell your data to third parties',
        ],
      },
    };
  }
}