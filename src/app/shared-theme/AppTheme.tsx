"use client";

import * as React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import theme from "./themePrimitives"; 


interface AppThemeProps {
  children: React.ReactNode;
  disableCustomTheme?: boolean;
}

export default function AppTheme({ children, disableCustomTheme }: AppThemeProps) {

  const appliedTheme = disableCustomTheme ? createTheme() : theme;

  return (
    <ThemeProvider theme={appliedTheme} disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}