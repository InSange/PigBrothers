'use client';

import { ReactNode } from 'react';
import { ThemeProvider, type DefaultTheme } from 'styled-components';
import GlobalStyle from '@/app/_components/globalstyles';

const theme: DefaultTheme = {
  colors: {
    primary: '#D93167',
    secondary: '#FFEBEB',
    backgroundColor: '#FFEBEB',
    defaultBackground: '#FFF5F5',
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
