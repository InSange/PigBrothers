'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const client = new QueryClient({ defaultOptions: { queries: { retry: 0 } } });
export default function ApiProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={client}>
      {children}
      {/* {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools />} */}
    </QueryClientProvider>
  );
}
