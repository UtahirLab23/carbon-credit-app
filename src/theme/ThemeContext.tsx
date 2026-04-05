import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';

type ColorMode = 'light' | 'dark';

interface ColorModeContextType {
  mode: ColorMode;
  toggleColorMode: () => void;
}

export const ColorModeContext = createContext<ColorModeContextType>({
  mode: 'dark',
  toggleColorMode: () => {},
});

export const useColorMode = () => useContext(ColorModeContext);

const buildTheme = (mode: ColorMode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: '#4CAF50', light: '#81C784', dark: '#388E3C' },
      secondary: { main: '#FFC107' },
      background: {
        default: mode === 'dark' ? '#0A0E1A' : '#F0F4F8',
        paper: mode === 'dark' ? '#111827' : '#FFFFFF',
      },
      error: { main: '#EF5350' },
      warning: { main: '#FFA726' },
      success: { main: '#66BB6A' },
      text: {
        primary: mode === 'dark' ? '#E2E8F0' : '#1A202C',
        secondary: mode === 'dark' ? '#94A3B8' : '#64748B',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', borderRadius: 8, fontWeight: 600 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
            color: mode === 'dark' ? '#94A3B8' : '#64748B',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          },
          body: {
            borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}`,
          },
        },
      },
    },
  });

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const stored = (localStorage.getItem('colorMode') as ColorMode) || 'dark';
  const [mode, setMode] = useState<ColorMode>(stored);

  const toggleColorMode = () => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('colorMode', next);
      return next;
    });
  };

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
