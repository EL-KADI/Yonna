import { createTheme, ThemeOptions } from "@mui/material/styles";
import { Shadows } from "@mui/material";

export const brand = {
  50: "hsl(210, 100%, 95%)",
  100: "hsl(210, 100%, 92%)",
  200: "hsl(210, 100%, 80%)",
  300: "hsl(210, 100%, 65%)",
  400: "hsl(210, 98%, 48%)",
  500: "hsl(210, 98%, 42%)",
  600: "hsl(210, 98%, 55%)",
  700: "hsl(210, 100%, 35%)",
  800: "hsl(210, 100%, 16%)",
  900: "hsl(210, 100%, 21%)",
};

export const gray = {
  50: "hsl(220, 35%, 97%)",
  100: "hsl(220, 30%, 94%)",
  200: "hsl(220, 20%, 88%)",
  300: "hsl(220, 20%, 80%)",
  400: "hsl(220, 20%, 65%)",
  500: "hsl(220, 20%, 42%)",
  600: "hsl(220, 20%, 35%)",
  700: "hsl(220, 20%, 25%)",
  800: "hsl(220, 30%, 6%)",
  900: "hsl(220, 35%, 3%)",
};

export const orange = {
  50: "hsl(33, 100%, 96%)",
  100: "hsl(33, 90%, 90%)",
  200: "hsl(33, 80%, 80%)",
  300: "hsl(33, 70%, 70%)",
  400: "hsl(33, 60%, 60%)",
  500: "hsl(33, 70%, 50%)",
  600: "hsl(33, 80%, 40%)",
  700: "hsl(33, 90%, 30%)",
  800: "hsl(33, 100%, 20%)",
  900: "hsl(33, 100%, 10%)",
};

export const red = {
  50: "hsl(0, 100%, 97%)",
  100: "hsl(0, 90%, 90%)",
  200: "hsl(0, 80%, 80%)",
  300: "hsl(0, 70%, 70%)",
  400: "hsl(0, 60%, 60%)",
  500: "hsl(0, 70%, 50%)",
  600: "hsl(0, 80%, 40%)",
  700: "hsl(0, 90%, 30%)",
  800: "hsl(0, 100%, 20%)",
  900: "hsl(0, 100%, 10%)",
};

export const green = {
  50: "hsl(120, 60%, 95%)",
  100: "hsl(120, 60%, 85%)",
  200: "hsl(120, 60%, 75%)",
  300: "hsl(120, 60%, 65%)",
  400: "hsl(120, 60%, 55%)",
  500: "hsl(120, 60%, 45%)",
  600: "hsl(120, 60%, 35%)",
  700: "hsl(120, 60%, 25%)",
  800: "hsl(120, 60%, 15%)",
  900: "hsl(120, 60%, 10%)",
};

interface CustomThemeOptions extends ThemeOptions {
  shadows?: Shadows;
}

const defaultTheme = createTheme();
const customShadows: Shadows = [...defaultTheme.shadows];

const themeOptions: CustomThemeOptions = {
  palette: {
    mode: "dark", 
    primary: {
      light: brand[200],
      main: brand[400],
      dark: brand[700],
      contrastText: brand[50],
    },
    background: {
      default: gray[900],
      paper: "hsl(220, 30%, 7%)",
    },
    text: {
      primary: "hsl(0, 0%, 100%)",
      secondary: gray[400],
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    h1: {
      fontSize: defaultTheme.typography.pxToRem(48),
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: -0.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
};

customShadows[1] =
  "hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px";
themeOptions.shadows = customShadows;

const theme = createTheme(themeOptions);
export default theme;
