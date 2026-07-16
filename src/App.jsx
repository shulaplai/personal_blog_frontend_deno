import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme';
import { setNavigate } from './utils/navigation';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { initializeAuth } from './store/slices/authSlice';
import { useDarkMode } from './context/ThemeContext';
import AppRoutes from './routes';

export default function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status: authStatus } = useAppSelector((state) => state.auth);
  const { darkMode } = useDarkMode();

  // Register React Router navigate for the Axios 401 interceptor
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  const theme = useMemo(() => getTheme(darkMode ? 'dark' : 'light'), [darkMode]);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Show nothing while checking auth on initial load
  if (authStatus === 'loading') {
    return null;
  }

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes />
    </MuiThemeProvider>
  );
}
