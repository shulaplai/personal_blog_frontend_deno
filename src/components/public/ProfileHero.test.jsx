import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfileHero from './ProfileHero';

describe('ProfileHero', () => {
  it('renders the profile name', () => {
    render(
      <MemoryRouter>
        <ProfileHero />
      </MemoryRouter>,
    );
    expect(screen.getByText('Shulap Lai')).toBeInTheDocument();
  });

  it('renders the profile title', () => {
    render(
      <MemoryRouter>
        <ProfileHero />
      </MemoryRouter>,
    );
    expect(screen.getByText('Full-Stack Developer')).toBeInTheDocument();
  });

  it('renders the avatar initial', () => {
    render(
      <MemoryRouter>
        <ProfileHero />
      </MemoryRouter>,
    );
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('renders tech pills', () => {
    render(
      <MemoryRouter>
        <ProfileHero />
      </MemoryRouter>,
    );
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('PHP')).toBeInTheDocument();
  });

  it('renders contact links', () => {
    render(
      <MemoryRouter>
        <ProfileHero />
      </MemoryRouter>,
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('View Resume')).toBeInTheDocument();
  });

  it('View Resume links to /about', () => {
    render(
      <MemoryRouter>
        <ProfileHero />
      </MemoryRouter>,
    );
    expect(screen.getByText('View Resume').closest('a')).toHaveAttribute('href', '/about');
  });
});
