import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

function BrokenComponent({ shouldThrow = true }) {
  if (shouldThrow) throw new Error('Test explosion');
  return <div>All good</div>;
}

const originalError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});
afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Everything is fine</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Everything is fine')).toBeInTheDocument();
  });

  it('renders fallback UI when child throws', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByText('發生了錯誤')).toBeInTheDocument();
  });

  it('shows retry and reload buttons in error state', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByText('重試')).toBeInTheDocument();
    expect(screen.getByText('重新載入頁面')).toBeInTheDocument();
  });

  it('supports custom fallback render prop', () => {
    render(
      <ErrorBoundary fallback={({ error }) => <div>Custom: {error.message}</div>}>
        <BrokenComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Custom: Test explosion')).toBeInTheDocument();
  });
});
