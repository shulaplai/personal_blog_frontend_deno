import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BlogCard from './BlogCard';

const mockPost = {
  id: 1,
  slug: 'hello-world',
  title: 'Hello World',
  published_at: '2026-07-15T00:00:00Z',
};

describe('BlogCard', () => {
  it('renders the post title and date', () => {
    render(
      <MemoryRouter>
        <BlogCard post={mockPost} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it('links to the blog post detail page', () => {
    render(
      <MemoryRouter>
        <BlogCard post={mockPost} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/blog/hello-world');
  });

  it('renders the decorative arrow SVG', () => {
    render(
      <MemoryRouter>
        <BlogCard post={mockPost} />
      </MemoryRouter>,
    );
    expect(document.querySelector('svg')).toBeInTheDocument();
  });
});
