import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { TooltipProvider } from '@/components/ui/tooltip';

/**
 * vitest 用の共通 Provider wrapper。
 *
 * TanStack QueryClient + Radix TooltipProvider を一括で提供する。
 * 各 test で `render(ui, { wrapper: WithProviders })` のように使う。
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function WithProviders({ children }: { children: React.ReactNode }) {
  const client = makeQueryClient();
  return (
    <QueryClientProvider client={client}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </QueryClientProvider>
  );
}
