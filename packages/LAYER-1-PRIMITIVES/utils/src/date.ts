/**
 * @houselevi/utils/date
 * Date utilities
 */

export function formatDate(date: Date, format: string = 'MM/DD/YYYY'): string {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  
  return format
    .replace('MM', month)
    .replace('DD', day)
    .replace('YYYY', String(year));
}

export function isExpired(date: Date): boolean {
  return new Date(date) < new Date();
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
