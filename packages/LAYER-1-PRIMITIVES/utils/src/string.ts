/**
 * @houselevi/utils/string
 * String utilities
 */

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function slug(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

export function camelCase(str: string): string {
  return str
    .replace(/[-_\s]([a-z])/g, (g) => g[1].toUpperCase());
}
