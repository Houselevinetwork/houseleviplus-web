/**
 * @houselevi/utils/number
 * Number utilities
 */

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function percentage(value: number, total: number): number {
  return (value / total) * 100;
}
