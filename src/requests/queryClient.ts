import { QueryClient, dehydrate, hydrate } from '@tanstack/query-core';
import type { DehydratedState } from '@tanstack/query-core';
import { storage, StorageKey } from '../storage';

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: FIVE_MINUTES_MS,
      gcTime: TWENTY_FOUR_HOURS_MS,
      retry: 2,
    },
  },
});

function persistCache(): void {
  const dehydrated = dehydrate(queryClient);
  storage.set<DehydratedState>(StorageKey.PRODUCT_CACHE, dehydrated);
}

function restoreCache(): void {
  const cached = storage.get<DehydratedState>(StorageKey.PRODUCT_CACHE);
  if (cached !== null) {
    hydrate(queryClient, cached);
  }
}

// Restore persisted cache immediately on module load
restoreCache();

// Persist whenever the cache changes
queryClient.getQueryCache().subscribe(() => {
  persistCache();
});
