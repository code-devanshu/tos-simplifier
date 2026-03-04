import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function encodeResult(data: unknown): string {
  return btoa(encodeURIComponent(JSON.stringify(data)));
}


export function formatTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function severityLabel(severity: 'safe' | 'warning' | 'danger'): string {
  return { safe: 'Safe', warning: 'Watch Out', danger: 'Red Flag' }[severity];
}
