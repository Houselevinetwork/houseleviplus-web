export const SUBSCRIPTION_CONFIG = {
  autoRenew: {
    benefits: [
      'Never miss a day of entertainment',
      'Email reminder 3 days before charge',
      'Cancel anytime from account settings',
      'Secure card storage by Pesapal (PCI-DSS certified)'
    ],
    warnings: {
      mpesa: 'Auto-renewal only works with Visa/Mastercard. M-Pesa payments require manual renewal.',
      retry: 'If payment fails, we retry 3 times over 7 days before cancellation.'
    },
    supportedMethods: ['Visa', 'Mastercard'],
    reminderDays: 3,
    retryAttempts: 3,
    retrySchedule: [1, 2, 7] // Days: Retry on Day 1, Day 2, Day 7
  },
  
  // 🆕 DYNAMIC BILLING CYCLES
  billingCycles: {
    monthly: {
      label: 'every month',
      reminderText: 'charged monthly',
      pesapalFrequency: 'MONTHLY'
    },
    quarterly: {
      label: 'every 3 months',
      reminderText: 'charged quarterly',
      pesapalFrequency: 'QUARTERLY' // Pesapal supports this
    },
    half_year: {
      label: 'every 6 months',
      reminderText: 'charged every 6 months',
      pesapalFrequency: 'MONTHLY', // Pesapal doesn't have "half-year", so we use MONTHLY and calculate
      customPeriod: 6 // months
    },
    yearly: {
      label: 'every year',
      reminderText: 'charged annually',
      pesapalFrequency: 'YEARLY'
    }
  }
};