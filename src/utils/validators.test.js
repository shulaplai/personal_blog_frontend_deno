import { describe, it, expect } from 'vitest';
import { required, maxLength, isValidUrl, url } from './validators';

describe('required', () => {
  it('returns error for empty string', () => {
    expect(required('')).toBe('此欄位為必填');
  });

  it('returns error for whitespace-only string', () => {
    expect(required('   ')).toBe('此欄位為必填');
  });

  it('returns error for null/undefined', () => {
    expect(required(null)).toBe('此欄位為必填');
    expect(required(undefined)).toBe('此欄位為必填');
  });

  it('returns null for non-empty string', () => {
    expect(required('hello')).toBeNull();
  });

  it('uses custom field name', () => {
    expect(required('', '標題')).toBe('標題為必填');
  });
});

describe('maxLength', () => {
  it('returns null if value is within limit', () => {
    expect(maxLength('hello', 10)).toBeNull();
  });

  it('returns null if value is missing (optional field)', () => {
    expect(maxLength(null, 10)).toBeNull();
  });

  it('returns error if value exceeds max', () => {
    const result = maxLength('hello world', 5);
    expect(result).toContain('不可超過 5 個字元');
  });
});

describe('isValidUrl', () => {
  it('returns true for empty value (optional field)', () => {
    expect(isValidUrl('')).toBe(true);
    expect(isValidUrl(null)).toBe(true);
  });

  it('returns true for valid URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://localhost:3000')).toBe(true);
  });

  it('returns false for invalid URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
  });
});

describe('url validator', () => {
  it('returns null for valid URL', () => {
    expect(url('https://example.com')).toBeNull();
  });

  it('returns null for empty URL (optional)', () => {
    expect(url('')).toBeNull();
  });

  it('returns error for invalid URL', () => {
    expect(url('invalid')).toBe('此欄位格式不正確');
  });
});
