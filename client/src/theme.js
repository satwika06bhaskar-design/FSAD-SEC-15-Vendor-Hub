import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#4F46E5" },
    secondary: { main: "#06B6D4" },
    success: { main: "#10B981" },
    warning: { main: "#F59E0B" },
    error: { main: "#EF4444" },
    background: { default: "#F8FAFC", paper: "#FFFFFF" },
    text: { primary: "#0F172A", secondary: "#475569" },
    divider: "#E2E8F0",
  },
  spacing: 8,
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: 'Inter, Roboto, "Segoe UI", sans-serif',
    h1: { fontWeight: 600, fontSize: "2.5rem", letterSpacing: "-0.03em" },
    h2: { fontWeight: 600, fontSize: "2rem", letterSpacing: "-0.02em" },
    h3: { fontWeight: 600, fontSize: "1.5rem", letterSpacing: "-0.02em" },
    h4: { fontWeight: 600, fontSize: "1.25rem" },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    body1: { fontWeight: 400 },
    body2: { fontWeight: 400 },
    button: { fontWeight: 500, textTransform: "none" },
  },
  shadows: [
    "none",
    "0 1px 2px rgba(15, 23, 42, 0.04)",
    "0 4px 10px rgba(15, 23, 42, 0.05)",
    "0 8px 20px rgba(15, 23, 42, 0.06)",
    "0 10px 24px rgba(15, 23, 42, 0.06)",
    ...Array(20).fill("0 12px 28px rgba(15, 23, 42, 0.08)"),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F8FAFC",
          color: "#0F172A",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
          paddingInline: 18,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: "1px solid #E2E8F0",
          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 500,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: "#334155",
          backgroundColor: "#F8FAFC",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: "#FFFFFF",
        },
      },
    },
  },
});

export default theme;
