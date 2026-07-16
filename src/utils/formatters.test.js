import { describe, it, expect } from 'vitest';
import { formatDate, truncate, formatWordCount, estimateReadTime } from './formatters';

describe('formatDate', () => {
  it('returns empty string for null/undefined', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });

  it('formats date with default YYYY-MM-DD', () => {
    const result = formatDate('2024-03-15T10:30:00Z');
    expect(result).toBe('2024-03-15');
  });

  it('formats date with custom format', () => {
    const result = formatDate('2024-03-15T10:30:00Z', 'DD/MM/YYYY');
    expect(result).toBe('15/03/2024');
  });
});

describe('truncate', () => {
  it('returns empty string for null/undefined', () => {
    expect(truncate(null)).toBe('');
    expect(truncate(undefined)).toBe('');
  });

  it('returns full text if under maxLength', () => {
    expect(truncate('Hello world', 50)).toBe('Hello world');
  });

  it('truncates and appends ellipsis', () => {
    const result = truncate('Hello world this is a long text', 10);
    expect(result).toBe('Hello worl…');
  });

  it('strips HTML tags before counting', () => {
    const result = truncate('<p>Hello</p> world', 8);
    expect(result).toBe('Hello wo…');
  });
});

describe('formatWordCount', () => {
  it('returns "0" for falsy counts', () => {
    expect(formatWordCount(0)).toBe('0');
    expect(formatWordCount(null)).toBe('0');
  });

  it('formats thousands with k', () => {
    expect(formatWordCount(5000)).toBe('5.0k');
  });

  it('formats ten-thousands with Chinese character', () => {
    expect(formatWordCount(15000)).toBe('1.5 萬');
  });

  it('returns number as-is for small counts', () => {
    expect(formatWordCount(500)).toBe('500');
  });
});

describe('estimateReadTime', () => {
  it('returns short read time for zero word count', () => {
    expect(estimateReadTime(0)).toBe('少於 1 分鐘');
    expect(estimateReadTime(null)).toBe('少於 1 分鐘');
  });

  it('returns estimated minutes', () => {
    expect(estimateReadTime(300)).toBe('約 1 分鐘');
    expect(estimateReadTime(600)).toBe('約 2 分鐘');
    expect(estimateReadTime(1200)).toBe('約 4 分鐘');
  });
});
