
// src/lib/xml-escape.ts

/**
 * Escapes characters in a string to make it safe for inclusion in XML content.
 * Handles undefined or null input by returning an empty string.
 * @param str The string to escape.
 * @returns The escaped string.
 */
export function xmlEscape(str: string | undefined | null): string {
  if (str === undefined || str === null) {
    return '';
  }
  return String(str).replace(/[<>&"']/g, (match) => {
    switch (match) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '"':
        return '&quot;';
      case "'":
        return '&apos;';
      default:
        return match; // Should not happen based on regex
    }
  });
}
