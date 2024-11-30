'use client';

import { ReactNode } from 'react';
import { ThemeProvider, type DefaultTheme } from 'styled-components';
import GlobalStyle from '@/app/_components/globalstyles';

const theme: DefaultTheme = {
  colors: {
    primary: '#D93167',
    secondary: '#FFEBEB',
    gray: '#939393',
    backgroundColor: '#FFEBEB',
    defaultBackground: '#FFF5F5',
    disabledBackground: '#F5F5F5',
    disabledText: '#BDBDBD',
    error: '#FF0000',
  },
};

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
}
