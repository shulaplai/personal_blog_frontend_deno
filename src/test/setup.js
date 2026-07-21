import { afterEach } from 'vitest';
import '@testing-library/jest-dom';

// Clean up localStorage between tests
afterEach(() => {
  localStorage.clear();
});
