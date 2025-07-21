import { createTheme, alpha } from '@mui/material/styles';

const getDesignTokens = (mode, primary) => ({
  palette: {
    mode,
    primary: {
      main: primary,
    },
    ...(mode === 'light'
      ? {
          divider: 'rgba(0, 0, 0, 0.07)',
          background: { default: '#f9fafb', paper: '#ffffff' },
          text: { primary: '#1f2937', secondary: '#6b7280' },
        }
      : {
          divider: 'rgba(255, 255, 255, 0.1)',
          background: { default: '#0d0d0f', paper: '#18181a' },
          text: { primary: '#f4f4f5', secondary: '#a0a0a9' },
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 600, fontSize: '1.5rem', letterSpacing: '-0.5px' },
    h6: { fontWeight: 600 },
    body2: { color: 'text.secondary', fontWeight: 500 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => `
        body {
          background-color: ${theme.palette.background.default};
          background-image: ${
            theme.palette.mode === 'dark'
              ? `linear-gradient(180deg, ${alpha(primary, 0.1)} 0%, ${theme.palette.background.default} 100%)`
              // CORRECTED: The light mode gradient now uses the selected primary color
              : `linear-gradient(180deg, ${alpha(primary, 0.05)} 0%, ${alpha(theme.palette.background.default, 0.5)} 100%)`
          };
        }
      `,
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${theme.palette.divider}`,
          backgroundImage: 'none',
        }),
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600, padding: '8px 16px' } },
    },
    MuiAppBar: {
      styleOverrides: { root: { backgroundColor: 'transparent', boxShadow: 'none' } },
    },
    MuiDrawer: {
      styleOverrides: { paper: { border: 'none' } }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius - 2,
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
            },
          },
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
          }
        }),
      },
    },
  },
});

export default getDesignTokens;