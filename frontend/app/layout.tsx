import ApiProvider from '@/lib/ApiProvider';
import ClientLayout from '@/lib/client-layout';
import SnackLib from '@/lib/SnackLib';
import StyledComponentsRegistry from '@/lib/styled-components-registry';
import { ReactNode } from 'react';
import { GlobalContextProvider } from './GlobalContext';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='ko'>
      <head>
        <script src='https://unpkg.com/react-scan/dist/auto.global.js' async />
      </head>
      <body>
        <StyledComponentsRegistry>
          <GlobalContextProvider>
            <SnackLib>
              <ApiProvider>
                <ClientLayout>{children}</ClientLayout>
              </ApiProvider>
            </SnackLib>
          </GlobalContextProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
