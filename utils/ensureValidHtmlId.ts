export type HtmlIdOptions = {
  /**
   * Replacement string for disallowed characters.
   * Default: '-'
   */
  replacement?: string;
  /**
   * Prefix to add if the id would otherwise be empty or start with a non-letter.
   * Default: 'id-'
   */
  prefixIfNeeded?: string;
  /**
   * Lowercase the result.
   * Default: true
   */
  lowercase?: boolean;
  /**
   * Maximum length of the id (after prefixing). If provided, the id will be truncated.
   */
  maxLength?: number;
  /**
   * Allowed characters regex (character class without brackets). Advanced use only.
   * Default allows: a-z 0-9 dash underscore
   */
  allowedClass?: string;
};

/**
 * Ensure a string becomes a safe HTML id attribute value.
 * - Removes diacritics
 * - Replaces disallowed characters with replacement (default '-')
 * - Collapses repeats and trims from ends
 * - Ensures it starts with a letter (prefixes if not)
 * - Optionally lowercases and truncates to maxLength
 */
export default function ensureValidHtmlId(input: string, opts: HtmlIdOptions = {}): string {
  const { replacement = '-', prefixIfNeeded = 'id-', lowercase = true, maxLength, allowedClass = 'a-z0-9_-' } = opts;

  const str = (input ?? '').toString();
  // Fast-path for already-valid simple ids
  const simpleValidRe = new RegExp(`^[${allowedClass}]+$`, 'i');
  if (str && simpleValidRe.test(str) && /[a-z]/i.test(str[0])) {
    const out = lowercase ? str.toLowerCase() : str;
    return maxLength ? trimTrailing(replacement, out).slice(0, maxLength) : trimTrailing(replacement, out);
  }

  // Normalize and strip diacritics
  let s = str.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  if (lowercase) s = s.toLowerCase();

  // Replace any char not allowed with the replacement
  const notAllowedRe = new RegExp(`[^${allowedClass}]`, 'g');
  s = s.replace(notAllowedRe, replacement);

  // Collapse multiple replacements
  if (replacement) {
    const multiRe = new RegExp(`${escapeRegExp(replacement)}{2,}`, 'g');
    s = s.replace(multiRe, replacement);
  }

  // Trim replacement from both ends
  s = trimBoth(replacement, s);

  // If empty, set to fallback core
  if (!s) s = '0';

  // Ensure starts with a letter (A-Z)
  if (!/[a-z]/i.test(s[0])) {
    s = `${prefixIfNeeded}${s}`;
  }

  // Truncate if needed and re-trim replacement at end
  if (typeof maxLength === 'number' && maxLength > 0 && s.length > maxLength) {
    s = s.slice(0, maxLength);
    s = trimTrailing(replacement, s);
    if (!s) s = prefixIfNeeded.replace(new RegExp(`${escapeRegExp(replacement)}+$`), '') || 'id-';
  }

  return s;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function trimBoth(token: string, s: string): string {
  if (!token) return s.trim();
  const re = new RegExp(`^(?:${escapeRegExp(token)})+|(?:${escapeRegExp(token)})+$`, 'g');
  return s.replace(re, '');
}

function trimTrailing(token: string, s: string): string {
  if (!token) return s.trimEnd();
  const re = new RegExp(`(?:${escapeRegExp(token)})+$`);
  return s.replace(re, '');
}
