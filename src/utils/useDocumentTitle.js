import { useEffect } from 'react';

const BASE_TITLE = 'Personal Blog';

/**
 * Sets the document title. Restores the base title on unmount.
 *
 * @param {string} title - The page-specific title, appended after a separator.
 *   Use empty string or omit to keep just the base title.
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} — ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
