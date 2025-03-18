import * as React from 'react';
import { alpha, Theme, Components } from '@mui/material/styles';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';
import { svgIconClasses } from '@mui/material/SvgIcon';
import { toggleButtonGroupClasses } from '@mui/material/ToggleButtonGroup';
import { toggleButtonClasses } from '@mui/material/ToggleButton';
import CheckBoxOutlineBlankRoundedIcon from '@mui/icons-material/CheckBoxOutlineBlankRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import { gray, brand } from '../themePrimitives';

export const inputsCustomizations: Components<Theme> = {
  MuiButtonBase: {
    defaultProps: {
      disableTouchRipple: true,
      disableRipple: true,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        boxSizing: 'border-box',
        transition: 'all 100ms ease-in',
        '&:focus-visible': {
          outline: `3px solid ${alpha(theme.palette.primary.main, 0.5)}`,
          outlineOffset: '2px',
        },
      }),
    },
  },
  MuiButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        boxShadow: 'none',
        borderRadius: theme.shape.borderRadius,
        textTransform: 'none',
        color: 'white',
        backgroundColor: gray[900],
        backgroundImage: `linear-gradient(to bottom, ${gray[700]}, ${gray[800]})`,
        border: `1px solid ${gray[700]}`,
        '&:hover': {
          backgroundImage: 'none',
          backgroundColor: gray[700],
          boxShadow: 'none',
        },
        '&:active': { backgroundColor: gray[800] },
      }),
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
        color: 'white',
        backgroundColor: gray[800],
        border: '1px solid',
        borderColor: gray[700],
        '&:hover': {
          backgroundColor: gray[900],
          borderColor: gray[600],
        },
        '&:active': {
          backgroundColor: gray[900],
        },
      }),
    },
  },
  MuiToggleButtonGroup: {
    styleOverrides: {
      root: () => ({
        borderRadius: '10px',
        boxShadow: `0 4px 16px ${alpha(brand[700], 0.5)}`,
        [`& .${toggleButtonGroupClasses.selected}`]: {
          color: '#fff',
        },
      }),
    },
  },
  MuiToggleButton: {
    styleOverrides: {
      root: () => ({
        padding: '12px 16px',
        textTransform: 'none',
        borderRadius: '10px',
        fontWeight: 500,
        color: gray[400],
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
        [`&.${toggleButtonClasses.selected}`]: {
          color: brand[300],
        },
      }),
    },
  },
  MuiCheckbox: {
    defaultProps: {
      disableRipple: true,
      icon: <CheckBoxOutlineBlankRoundedIcon sx={{ color: 'hsla(210, 0%, 0%, 0.0)' }} />,
      checkedIcon: <CheckRoundedIcon sx={{ height: 14, width: 14 }} />,
      indeterminateIcon: <RemoveRoundedIcon sx={{ height: 14, width: 14 }} />,
    },
    styleOverrides: {
      root: () => ({
        margin: 10,
        height: 16,
        width: 16,
        borderRadius: 5,
        border: '1px solid',
        borderColor: alpha(gray[300], 0.8),
        boxShadow: '0 0 0 1.5px hsla(210, 0%, 0%, 0.04) inset',
        backgroundColor: alpha(gray[100], 0.4),
        transition: 'border-color, background-color, 120ms ease-in',
        '&:hover': {
          borderColor: brand[300],
        },
        '&.Mui-focusVisible': {
          outline: `3px solid ${alpha(brand[500], 0.5)}`,
          outlineOffset: '2px',
          borderColor: brand[400],
        },
        '&.Mui-checked': {
          color: 'white',
          backgroundColor: brand[500],
          borderColor: brand[500],
          boxShadow: `none`,
          '&:hover': {
            backgroundColor: brand[600],
          },
        },
      }),
    },
  },
};
