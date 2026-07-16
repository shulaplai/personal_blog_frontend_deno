import { createTheme } from '@mui/material/styles';

export function getTheme(mode = 'light') {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#659EB9',
      },
      secondary: {
        main: '#94a3b8',
      },
      background: {
        default: mode === 'light' ? '#FCFCFD' : '#0B0B10',
        paper: mode === 'light' ? '#ffffff' : '#111118',
      },
      text: {
        primary: mode === 'light' ? '#1a1a2e' : '#e5e7eb',
        secondary: '#6b7280',
      },
    },
    typography: {
      fontFamily: '"Satoshi", "Noto Sans HK", system-ui, sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 500 },
      h6: { fontWeight: 500 },
      body1: {
        fontFamily: '"Noto Serif HK", "Noto Sans HK", serif',
        lineHeight: 1.8,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 12,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  });
}
