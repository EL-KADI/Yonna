"use client";

import React, { createContext, useContext } from "react";

type ThemeContextType = {
  disableCustomTheme?: boolean;
};

const ThemeContext = createContext<ThemeContextType>({ disableCustomTheme: false });

export const useThemeSettings = () => useContext(ThemeContext);

export const ThemeSettingsProvider = ({
  children,
  disableCustomTheme = false,
}: {
  children: React.ReactNode;
  disableCustomTheme?: boolean;
}) => {
  return (
    <ThemeContext.Provider value={{ disableCustomTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};