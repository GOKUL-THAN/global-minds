/** Format a price number to currency string */
export function formatPrice(price: number, currency = 'INR'): string {
  const symbols: Record<string, string> = {
    INR: '₹', USD: '$', GBP: '£', EUR: '€', AED: 'د.إ', CAD: 'C$', AUD: 'A$',
  };
  const symbol = symbols[currency] || currency;
  return `${symbol}${price.toLocaleString('en-IN')}`;
}

/** Format a number with K/M suffix */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return num.toLocaleString();
}

/** Format a date string to readable format */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

/** Truncate a string with ellipsis */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

/** Convert slug to title */
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Generate a URL-safe slug from a title */
export function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
