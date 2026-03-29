import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names using clsx and tailwind-merge.
 * Handles conditional classes, arrays, and resolves Tailwind CSS conflicts.
 *
 * @param inputs - Class values to merge (strings, objects, arrays, etc.)
 * @returns Merged and deduplicated class name string
 *
 * @example
 * cn('px-2 py-1', condition && 'bg-blue-500', 'px-4');
 * // => 'py-1 bg-blue-500 px-4' (px-4 overrides px-2)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}