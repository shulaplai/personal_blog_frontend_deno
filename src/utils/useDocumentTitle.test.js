import { describe, it, expect, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDocumentTitle } from './useDocumentTitle';

describe('useDocumentTitle', () => {
  const originalTitle = document.title;

  afterEach(() => {
    document.title = originalTitle;
  });

  it('sets document title with page name and base (Shulap Lai)', () => {
    const { unmount } = renderHook(() => useDocumentTitle('Blog'));
    expect(document.title).toBe('Blog — Shulap Lai');
    unmount();
  });

  it('sets only base title when passed empty string', () => {
    const { unmount } = renderHook(() => useDocumentTitle(''));
    expect(document.title).toBe('Shulap Lai');
    unmount();
  });

  it('restores previous title on unmount', () => {
    document.title = 'Original Title';
    const { unmount } = renderHook(() => useDocumentTitle('About'));
    expect(document.title).toBe('About — Shulap Lai');
    unmount();
    expect(document.title).toBe('Original Title');
  });

  it('updates title when the title argument changes', () => {
    const { rerender, unmount } = renderHook((title) => useDocumentTitle(title), {
      initialProps: 'Blog',
    });
    expect(document.title).toBe('Blog — Shulap Lai');
    rerender('Projects');
    expect(document.title).toBe('Projects — Shulap Lai');
    unmount();
  });
});
