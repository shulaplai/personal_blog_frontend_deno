import { useEffect, useState, useCallback, useRef } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPublicSettings } from '@/store/slices/publicSettingsSlice';
import { useDarkMode, useThemeStyle } from '@/context/ThemeContext';
import { GitHubIcon, SunIcon, MoonIcon, MenuIcon, CloseIcon } from '@/components/public/Icons';
import { profile } from '@/data/profile';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Blog', path: '/blog' },
  { label: 'Projects', path: '/projects' },
  { label: 'About', path: '/about' },
];

export default function PublicLayout({ children }) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { settings, status: settingsStatus } = useAppSelector((state) => state.publicSettings);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const prevScrollY = useRef(0);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { themeStyle, toggleThemeStyle } = useThemeStyle();

  useEffect(() => {
    if (settingsStatus === 'idle') {
      dispatch(fetchPublicSettings());
    }
  }, [dispatch, settingsStatus]);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);
      // Hide header when scrolling down, show when scrolling up (Joye behavior)
      if (scrollY > 80) {
        setHeaderVisible(scrollY < prevScrollY.current);
      } else {
        setHeaderVisible(true);
      }
      prevScrollY.current = scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const siteName = settings.site_name || profile.name;
  const githubUrl = settings.social_github || 'https://github.com';
  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Highlight gradient */}
      <div
        className="pointer-events-none absolute start-0 top-0 z-0 h-screen w-full opacity-25"
        style={{ backgroundImage: 'linear-gradient(#659EB9, transparent)' }}
      />

      {/* Skip-to-content for keyboard users */}
      <a
        href="#public-main-content"
        className="absolute start-2 top-2 z-[9999] rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white opacity-0 focus:opacity-100 transition-opacity"
      >
        Skip to content
      </a>

      {/* Header */}
      <header
        className="sticky top-4 z-[70] mb-12 px-4 transition-transform sm:px-7 lg:px-10"
        data-scroll={scrolled ? 'not-top' : 'top'}
        data-show={String(headerVisible)}
        style={{ transition: 'transform 0.3s, margin-inline 0.3s' }}
      >
        <div
          className={`mx-auto flex max-w-3xl items-center justify-between rounded-xl border px-4 py-3 transition-all sm:rounded-2xl ${
            scrolled ? 'glass border-border shadow-sm' : 'border-transparent bg-transparent'
          }`}
        >
          {/* Site name */}
          <RouterLink
            to="/"
            className="z-30 text-xl font-semibold text-foreground no-underline hover:text-primary transition-colors"
          >
            {siteName}
          </RouterLink>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-x-1 sm:flex">
            {NAV_ITEMS.map((item) => (
              <RouterLink
                key={item.path}
                to={item.path}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors no-underline ${
                  isActive(item.path)
                    ? 'text-primary bg-primary-foreground'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary-foreground'
                }`}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                {item.label}
              </RouterLink>
            ))}
          </nav>

          {/* Right side: github + theme + mobile menu */}
          <div className="flex items-center gap-x-2 z-30">
            {/* GitHub icon */}
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
              aria-label="GitHub"
              title="GitHub"
            >
              <GitHubIcon />
            </a>

            {/* Theme toggle */}
            <button
              onClick={toggleDarkMode}
              className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Theme style toggle — Joye / Default */}
            <button
              onClick={toggleThemeStyle}
              className="relative flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
              aria-label={
                themeStyle === 'joye' ? 'Switch to default theme' : 'Switch to Joye theme'
              }
              title={themeStyle === 'joye' ? 'Default theme' : 'Joye theme'}
            >
              <span
                className={`absolute inset-0 m-auto flex items-center justify-center text-xs font-bold transition-all duration-[250ms] ${
                  themeStyle === 'default'
                    ? 'opacity-100 blur-none scale-100'
                    : 'opacity-0 blur-xs scale-[0.6] pointer-events-none'
                }`}
              >
                J
              </span>
              <span
                className={`absolute inset-0 m-auto flex items-center justify-center text-xs font-bold transition-all duration-[250ms] ${
                  themeStyle === 'joye'
                    ? 'opacity-100 blur-none scale-100'
                    : 'opacity-0 blur-xs scale-[0.6] pointer-events-none'
                }`}
              >
                D
              </span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted sm:hidden"
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="mx-auto mt-2 max-w-3xl rounded-xl border border-border bg-background p-3 shadow-lg sm:hidden">
            <nav className="flex flex-col gap-y-1">
              {NAV_ITEMS.map((item) => (
                <RouterLink
                  key={item.path}
                  to={item.path}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors no-underline ${
                    isActive(item.path)
                      ? 'text-primary bg-primary-foreground'
                      : 'text-muted-foreground hover:text-primary hover:bg-muted'
                  }`}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  {item.label}
                </RouterLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="relative z-0 flex-1 px-4 sm:px-7 lg:px-10" id="public-main-content">
        <div
          className={`mx-auto w-full ${themeStyle === 'joye' ? 'md:w-4/5 lg:w-5/6' : 'max-w-3xl'}`}
        >
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto mb-5 mt-16 w-full max-w-3xl px-4 sm:px-7 lg:px-10">
        <div className="border-t border-border pt-5">
          <div className="flex items-center gap-y-3 max-sm:flex-col sm:justify-between">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {siteName}
            </div>
            <div className="flex items-center gap-x-4 text-sm text-muted-foreground">
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-x-1.5 text-muted-foreground hover:text-primary transition-colors no-underline"
              >
                <GitHubIcon size={16} />
                GitHub
              </a>
              <span>
                Built with{' '}
                <a
                  href="https://react.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  React
                </a>{' '}
                &{' '}
                <a
                  href="https://vitejs.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Vite
                </a>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
