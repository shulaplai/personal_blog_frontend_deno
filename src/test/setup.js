import { afterEach } from 'vitest';

// Clean up localStorage between tests
afterEach(() => {
  localStorage.clear();
});
