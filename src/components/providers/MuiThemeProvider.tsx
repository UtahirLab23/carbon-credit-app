// @ts-nocheck
'use client';

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
    // Design tokens surfaced as CSS variables via MUI's cssVariables mechanism
    // Access in sx as: theme.spacing(3) === 24px for CARD_PADDING
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
      // Universal card padding: 24px (theme.spacing(3)) on all sides
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: 24,
            '&:last-child': { paddingBottom: 24 },
          },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiChip: {
        styleOverrides: {
          // Ensure all chips have consistent vertical rhythm
          root: {
            display: 'inline-flex',
            alignItems: 'center',
          },
          sizeSmall: {
            height: 22,
            fontSize: '0.7rem',
            fontWeight: 600,
            paddingLeft: 6,
            paddingRight: 6,
          },
        },
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

export default function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ColorMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('colorMode') as ColorMode) || 'dark';
    }
    return 'dark';
  });

  const toggleColorMode = () => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') localStorage.setItem('colorMode', next);
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
}
